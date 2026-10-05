class Solution:
    def climbStairs(self, n: int) -> int:

        if n == 1: return 1
        if n == 2: return 2

        dp = [1,2]

        i = 2

        while i < n:
            dp.append(dp[i-1] + dp[i-2])
            i += 1
        
        return dp[n-1]
        