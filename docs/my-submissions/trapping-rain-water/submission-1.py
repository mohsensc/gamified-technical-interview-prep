class Solution:
    def trap(self, height: List[int]) -> int:
        
        total = 0

        preMax = [0] * len(height)
        postMax = [0] * len(height)

        for i in range(1, len(height)):
            preMax[i] = max(height[i-1], preMax[i-1])
        
        for i in range(len(height)-2, -1, -1):
            postMax[i] = max(height[i+1], postMax[i+1])

        for i in range(1, len(height) - 1):
            total += max((min(preMax[i], postMax[i]) - height[i]), 0)
        
        return total