class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]

        def maximum(num):
            if len(num) == 1:
                return num[0]
            
            dp = [num[0], max(num[0], num[1])]

            for i in range(2, len(num)):
                dp.append(max(dp[i-2]+num[i], dp[i-1]))
            
            return dp[-1]
        
        return max(maximum(nums[1:]), maximum(nums[:-1]))