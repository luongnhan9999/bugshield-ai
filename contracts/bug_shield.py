import json
from genlayer.std import *

@gl.serializable
class BountyData:
    id: u256
    creator: Address
    title: str
    target_repo_url: str
    vulnerability_description: str
    expected_fix_criteria: str
    reward_amount: u256
    status: u256  # 0: OPEN, 1: RESOLVED, 2: CANCELLED
    winner: Address
    ai_verdict_reason: str
    patch_pr_url: str

    def __init__(
        self,
        id: u256,
        creator: Address,
        title: str,
        target_repo_url: str,
        vulnerability_description: str,
        expected_fix_criteria: str,
        reward_amount: u256,
        status: u256,
        winner: Address,
        ai_verdict_reason: str,
        patch_pr_url: str,
    ):
        self.id = id
        self.creator = creator
        self.title = title
        self.target_repo_url = target_repo_url
        self.vulnerability_description = vulnerability_description
        self.expected_fix_criteria = expected_fix_criteria
        self.reward_amount = reward_amount
        self.status = status
        self.winner = winner
        self.ai_verdict_reason = ai_verdict_reason
        self.patch_pr_url = patch_pr_url

    def to_dict(self) -> dict:
        return {
            "id": int(self.id),
            "creator": str(self.creator),
            "title": self.title,
            "target_repo_url": self.target_repo_url,
            "vulnerability_description": self.vulnerability_description,
            "expected_fix_criteria": self.expected_fix_criteria,
            "reward_amount": str(self.reward_amount),
            "status": int(self.status),
            "winner": str(self.winner),
            "ai_verdict_reason": self.ai_verdict_reason,
            "patch_pr_url": self.patch_pr_url,
        }


class BugShield(Contract):
    bounties: TreeMap[u256, BountyData]
    bounty_count: u256

    def __init__(self):
        self.bounty_count = u256(0)

    @gl.public.write
    def create_bounty(
        self,
        title: str,
        target_repo_url: str,
        vulnerability_description: str,
        expected_fix_criteria: str,
    ) -> u256:
        """Tạo một security bounty mới với tiền thưởng ký quỹ (native token)"""
        bounty_id = self.bounty_count
        reward_amount = gl.message.value
        creator_address = gl.message.sender

        bounty_data = BountyData(
            id=bounty_id,
            creator=creator_address,
            title=title,
            target_repo_url=target_repo_url,
            vulnerability_description=vulnerability_description,
            expected_fix_criteria=expected_fix_criteria,
            reward_amount=reward_amount,
            status=u256(0),  # 0 = OPEN
            winner=Address("0x0000000000000000000000000000000000000000"),
            ai_verdict_reason="",
            patch_pr_url="",
        )

        self.bounties[bounty_id] = bounty_data
        self.bounty_count = bounty_id + u256(1)
        return bounty_id

    @gl.public.write
    def submit_and_evaluate_patch(
        self,
        bounty_id: u256,
        patch_diff_or_code: str,
        pr_url: str,
    ) -> dict:
        """
        Hunter nộp bản vá. GenLayer Validators thực thi AI Consensus
        để audit độc lập code patch trước khi quyết định giải ngân.
        """
        bounty = self.bounties.get(bounty_id)
        if not bounty:
            raise Exception("Bounty does not exist.")
        if bounty.status != u256(0):
            raise Exception("Bounty is not open for submissions.")

        hunter_address = gl.message.sender

        # Strict Prompt engineering for deterministic Validator LLM Consensus
        audit_prompt = f"""
You are an elite Web3 & Smart Contract Security Auditor acting as an on-chain validator for GenLayer VM.
Evaluate the submitted security patch for the following bounty:

[BOUNTY SPECIFICATION]
- Title: {bounty.title}
- Vulnerability Description: {bounty.vulnerability_description}
- Acceptance Criteria: {bounty.expected_fix_criteria}

[SUBMITTED PATCH CODE / DIFF]
{patch_diff_or_code}

[AUDIT RULES]
1. Does this patch completely eliminate the described vulnerability?
2. Does the patch avoid introducing new security flaws or broken logic?
3. Does it strictly satisfy the acceptance criteria?

Output ONLY a single valid JSON object. No Markdown code fences, no extra text.
Format:
{{"is_valid": true, "reason": "Concise technical evaluation summary (max 3 sentences)"}}
"""

        # Kích hoạt thực thi LLM on-chain qua GenLayer VM Consensus Engine
        raw_response = gl.exec_prompt(audit_prompt)

        try:
            cleaned_response = (
                raw_response.strip().replace("```json", "").replace("```", "").strip()
            )
            eval_result = json.loads(cleaned_response)
        except Exception:
            eval_result = {
                "is_valid": False,
                "reason": "AI validator failed to parse audit payload. Manual review required.",
            }

        is_valid = bool(eval_result.get("is_valid", False))
        reason = str(eval_result.get("reason", "No reason provided."))

        if is_valid:
            bounty.status = u256(1)  # 1 = RESOLVED
            bounty.winner = hunter_address
            bounty.ai_verdict_reason = reason
            bounty.patch_pr_url = pr_url
            self.bounties[bounty_id] = bounty

            # Tự động giải ngân Native Escrow Token cho Hunter bằng kiểu Address & u256 chuẩn
            if bounty.reward_amount > u256(0):
                gl.transfer(hunter_address, bounty.reward_amount)

            return {
                "status": "APPROVED",
                "reward_paid": str(bounty.reward_amount),
                "reason": reason,
            }
        else:
            bounty.ai_verdict_reason = reason
            self.bounties[bounty_id] = bounty
            return {
                "status": "REJECTED",
                "reason": reason,
            }

    @gl.public.write
    def cancel_bounty(self, bounty_id: u256) -> dict:
        """
        Cho phép Bounty Creator hủy bounty chưa giải quyết và hoàn tiền ký quỹ (Refund).
        """
        bounty = self.bounties.get(bounty_id)
        if not bounty:
            raise Exception("Bounty does not exist.")
        if bounty.creator != gl.message.sender:
            raise Exception("Only the bounty creator can cancel and claim a refund.")
        if bounty.status != u256(0):
            raise Exception("Only open bounties can be cancelled.")

        bounty.status = u256(2)  # 2 = CANCELLED
        bounty.ai_verdict_reason = "Bounty cancelled by creator. Escrow refunded."
        self.bounties[bounty_id] = bounty

        # Hoàn tiền lại cho Creator
        if bounty.reward_amount > u256(0):
            gl.transfer(bounty.creator, bounty.reward_amount)

        return {
            "status": "CANCELLED",
            "refunded_to": str(bounty.creator),
            "amount": str(bounty.reward_amount),
        }

    @gl.public.view
    def get_bounty(self, bounty_id: u256) -> dict:
        """Lấy thông tin chi tiết của một bounty"""
        bounty = self.bounties.get(bounty_id)
        if not bounty:
            raise Exception("Bounty not found.")
        return bounty.to_dict()

    @gl.public.view
    def get_bounty_count(self) -> u256:
        """Lấy tổng số lượng bounties đã tạo"""
        return self.bounty_count
