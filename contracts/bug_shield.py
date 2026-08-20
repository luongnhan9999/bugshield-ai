# v0.2.17
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json

@allow_storage
@dataclass
class Bounty:
    id: str
    creator: str
    title: str
    target_repo_url: str
    vulnerability_description: str
    expected_fix_criteria: str
    reward_amount: bigint
    status: str  # "OPEN", "RESOLVED", "CANCELLED"
    winner: str
    ai_verdict_reason: str
    patch_pr_url: str
    created_at: bigint
    submission_count: bigint


class Contract(gl.Contract):
    bounties: TreeMap[str, Bounty]
    bounty_ids: DynArray[str]
    owner: str

    def __init__(self):
        # DO NOT initialize TreeMap/DynArray here (Rule #2). GenVM automatically allocates memory.
        self.owner = str(gl.message.sender_address).lower()

    def _parse_llm_json(self, response) -> dict:
        """Robust JSON parser to handle LLM markdown formatting issues"""
        if isinstance(response, dict):
            return response
        try:
            text = str(response).strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text.strip())
        except Exception as e:
            return {"is_valid": False, "reason": "Failed to parse JSON: " + str(e)}

    @gl.public.write.payable
    def create_bounty(
        self,
        bounty_id: str,
        title: str,
        target_repo_url: str,
        vulnerability_description: str,
        expected_fix_criteria: str,
    ) -> None:
        amount = gl.message.value
        if amount <= bigint(0):
            raise UserError("Escrow reward amount must be greater than 0")

        if bounty_id in self.bounties:
            raise UserError("Bounty ID already exists")

        self.bounty_ids.append(bounty_id)
        self.bounties[bounty_id] = Bounty(
            id=bounty_id,
            creator=str(gl.message.sender_address).lower(),
            title=title,
            target_repo_url=target_repo_url,
            vulnerability_description=vulnerability_description,
            expected_fix_criteria=expected_fix_criteria,
            reward_amount=amount,
            status="OPEN",
            winner="",
            ai_verdict_reason="Awaiting Submissions",
            patch_pr_url="",
            created_at=bigint(0),
            submission_count=bigint(0),
        )

    @gl.public.write
    def submit_and_evaluate_patch(
        self,
        bounty_id: str,
        patch_code: str,
        pr_url: str,
    ) -> None:
        if bounty_id not in self.bounties:
            raise UserError("Bounty not found")
        bounty = self.bounties[bounty_id]

        if bounty.status != "OPEN":
            raise UserError("Bounty is not OPEN for submissions")

        if len(patch_code.strip()) < 15:
            raise UserError("Patch submission is too short. Minimum 15 characters required.")

        hunter = str(gl.message.sender_address).lower()
        title_str = str(bounty.title)
        repo_url = str(bounty.target_repo_url)
        vuln_desc = str(bounty.vulnerability_description)
        criteria = str(bounty.expected_fix_criteria)
        code_str = str(patch_code)

        def leader_fn():
            prompt = f"""
            You are an elite AI consensus security auditor for BugShield AI.
            Bounty Title: {title_str}
            Target Repository: {repo_url}
            Vulnerability Description: {vuln_desc}
            Acceptance Criteria: {criteria}

            Submitted Security Patch Code:
            {code_str[:3000]}

            Evaluate strictly:
            1. Does this patch completely eliminate the described vulnerability?
            2. Does it satisfy acceptance criteria without introducing new flaws?

            Return ONLY a JSON with format:
            {{"is_valid": true, "reason": "Concise technical evaluation summary (max 3 sentences)"}}
            """
            try:
                llm_res = gl.nondet.exec_prompt(prompt, response_format="json")
                text_res = llm_res.content if hasattr(llm_res, "content") else str(llm_res)
                return self._parse_llm_json(text_res)
            except Exception as e:
                return {"is_valid": False, "reason": f"LLM evaluation failure: {str(e)}"}

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False

            leader_data = leader_res.calldata if hasattr(leader_res, "calldata") else leader_res
            if not isinstance(leader_data, dict):
                leader_data = self._parse_llm_json(str(leader_data))

            mine_data = leader_fn()

            v_leader = bool(leader_data.get("is_valid", False))
            v_mine = bool(mine_data.get("is_valid", False))
            return v_leader == v_mine

        # Execute GenLayer non-deterministic consensus block
        result = gl.vm.run_nondet(leader_fn, validator_fn)
        if not isinstance(result, dict):
            result = self._parse_llm_json(str(result))

        is_valid = bool(result.get("is_valid", False))
        reason = str(result.get("reason", "No reason provided"))

        bounty.submission_count += bigint(1)
        sub_count = int(bounty.submission_count)

        if is_valid:
            bounty.status = "RESOLVED"
            bounty.winner = hunter
            bounty.ai_verdict_reason = f"[Submission #{sub_count}] PASSED: {reason}"
            bounty.patch_pr_url = pr_url
            self.bounties[bounty_id] = bounty

            # Escrow Payout to Hunter via emit_transfer
            gl.get_contract_at(Address(hunter)).emit_transfer(value=u256(bounty.reward_amount))
        else:
            bounty.ai_verdict_reason = f"[Submission #{sub_count}] REJECTED: {reason}"
            self.bounties[bounty_id] = bounty

    @gl.public.write
    def cancel_bounty(self, bounty_id: str) -> None:
        if bounty_id not in self.bounties:
            raise UserError("Bounty not found")
        bounty = self.bounties[bounty_id]

        if str(gl.message.sender_address).lower() != bounty.creator.lower():
            raise UserError("Only the Creator can cancel")

        if bounty.status != "OPEN":
            raise UserError("Bounty is not OPEN for cancellation")

        bounty.status = "CANCELLED"
        bounty.ai_verdict_reason = "Cancelled by creator. Escrow refunded."
        self.bounties[bounty_id] = bounty

        # Escrow Refund to Creator via emit_transfer
        gl.get_contract_at(Address(bounty.creator)).emit_transfer(value=u256(bounty.reward_amount))

    @gl.public.view
    def get_bounty(self, bounty_id: str) -> str:
        """View must return JSON string for easiest compatibility with genlayer-js / Studio"""
        if bounty_id not in self.bounties:
            raise UserError("Bounty not found")
        b = self.bounties[bounty_id]
        return json.dumps({
            "id": b.id,
            "creator": b.creator,
            "title": b.title,
            "target_repo_url": b.target_repo_url,
            "vulnerability_description": b.vulnerability_description,
            "expected_fix_criteria": b.expected_fix_criteria,
            "reward_amount": str(b.reward_amount),
            "status": b.status,
            "winner": b.winner,
            "ai_verdict_reason": b.ai_verdict_reason,
            "patch_pr_url": b.patch_pr_url,
            "submission_count": str(b.submission_count),
        })

    @gl.public.view
    def get_all_bounties() -> str:
        """Return a JSON array of all bounties for easy frontend fetching"""
        all_items = []
        for i in range(len(self.bounty_ids)):
            bid = self.bounty_ids[i]
            b = self.bounties[bid]
            all_items.append({
                "id": b.id,
                "creator": b.creator,
                "title": b.title,
                "target_repo_url": b.target_repo_url,
                "reward_amount": str(b.reward_amount),
                "status": b.status,
                "winner": b.winner,
                "ai_verdict_reason": b.ai_verdict_reason,
            })
        return json.dumps(all_items)
