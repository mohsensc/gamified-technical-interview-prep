class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        
        longest = [1] * len(nums)
        maximum = 1

        for i in range(len(nums)-1, -1, -1):
            for j in range(i, len(nums)):
                if nums[j] > nums[i]:
                    longest[i] = max(longest[i], 1+ longest[j])
                    if longest[i] > maximum: maximum = longest[i]
        
        return maximum