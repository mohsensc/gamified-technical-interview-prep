class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        
        curr = best = nums[0]

        for i in nums[1:]:
            curr = max(i, curr + i)
            best = max(curr, best)

        return best