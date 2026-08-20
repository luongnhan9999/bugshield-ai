import json
from genlayer.std import *

class BugShield(Contract):
    # Trạng thái của Bounty: 0: OPEN, 1: RESOLVED, 2: CANCELLED
    bounties: TreeMap[u256, dict]
    bounty_count: u256

    def __init__(self):
        self.bounty_count = u256(0)

    @gl.public.write
    def create_bounty(
        self,
        title: str,
        target_repo_url: str,
        vulnerability_description: str,
        expected_fix_criteria: str
    ) -> u256:
        """Tạo một security bounty mới với tiền thưởng ký quỹ (native token)"""
        bounty_id = self.bounty_count
        reward_amount = gl.message.value

        bounty_data = {
            "id": int(bounty_id),
            "creator": str(gl.message.sender),
            "title": title,
            "target_repo_url": target_repo_url,
            "vulnerability_description": vulnerability_description,
            "expected_fix_criteria": expected_fix_criteria,
            "reward_amount": str(reward_amount),
            "status": 0,  # 0 = OPEN
            "winner": "",
            "ai_verdict_reason": "",
            "patch_pr_url": ""
        }

        self.bounties[bounty_id] = bounty_data
        self.bounty_count = bounty_id + u256(1)
        return bounty_id

    @gl.public.write
    def submit_and_evaluate_patch(
        self,
        bounty_id: u256,
        patch_diff_or_code: str,
        pr_url: str
    ) -> dict:
        """
        Hunter nộp bản vá. GenLayer Validators thực thi AI Consensus
        để audit độc lập code patch trước khi quyết định giải ngân.
        """
        bounty = self.bounties.get(bounty_id)
        if not bounty:
            raise Exception("Bounty does not exist.")
        if bounty["status"] != 0:
            raise Exception("Bounty is not open for submissions.")

        hunter_address = gl.message.sender

        # Prompt dành cho AI Validator Consensus của GenLayer
        audit_prompt = f"""
        You are an elite Web3 & Software Security Auditor acting as an on-chain validator.
        Evaluate the submitted security patch for the following bounty:

        [BOUNTY DETAILS]
        - Title: {bounty['title']}
        - Vulnerability Description: {bounty['vulnerability_description']}
        - Acceptance Criteria: {bounty['expected_fix_criteria']}

        [SUBMITTED PATCH CODE / DIFF]
        {patch_diff_or_code}

        [AUDIT TASK]
        1. Does this patch completely eliminate the described vulnerability?
        2. Does the patch avoid introducing new obvious security flaws or broken logic?
        3. Does it strictly meet the acceptance criteria?

        Return ONLY a strict JSON object with this format (no markdown fences, no extra text):
        {{"is_valid": true/false, "reason": "concise technical evaluation summary (max 3 sentences)"}}
        """

        # Kích hoạt thực thi LLM on-chain qua GenLayer VM
        raw_response = gl.exec_prompt(audit_prompt)

        try:
            cleaned_response = raw_response.strip().replace("```json", "").replace("```", "").strip()
            eval_result = json.loads(cleaned_response)
        except Exception:
            eval_result = {
                "is_valid": False,
                "reason": "AI validator failed to parse audit payload. Manual review or re-submission required."
            }

        is_valid = eval_result.get("is_valid", False)
        reason = eval_result.get("reason", "No reason provided.")

        if is_valid:
            bounty["status"] = 1  # RESOLVED
            bounty["winner"] = str(hunter_address)
            bounty["ai_verdict_reason"] = reason
            bounty["patch_pr_url"] = pr_url
            self.bounties[bounty_id] = bounty

            # Tự động giải ngân Native Escrow Token cho Hunter
            reward_val = u256(int(bounty["reward_amount"]))
            if reward_val > u256(0):
                gl.transfer(hunter_address, reward_val)

            return {
                "status": "APPROVED",
                "reward_paid": bounty["reward_amount"],
                "reason": reason
            }
        else:
            # Lưu lại log từ chối để hunter cập nhật
            bounty["ai_verdict_reason"] = reason
            self.bounties[bounty_id] = bounty
            return {
                "status": "REJECTED",
                "reason": reason
            }

    @gl.public.view
    def get_bounty(self, bounty_id: u256) -> dict:
        """Lấy thông tin chi tiết của một bounty"""
        bounty = self.bounties.get(bounty_id)
        if not bounty:
            raise Exception("Bounty not found.")
        return bounty

    @gl.public.view
    def get_bounty_count(self) -> u256:
        """Lấy tổng số lượng bounties đã tạo"""
        return self.bounty_count
