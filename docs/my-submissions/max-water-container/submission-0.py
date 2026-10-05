class Solution:
    def maxArea(self, heights: List[int]) -> int:
        
        left, maxa = 0, 0
        right = len(heights) - 1

        while left < right:
            distance = right - left
            lefth = heights[left]
            righth = heights[right]
            if lefth > righth:
                area = righth * distance
                if area > maxa: maxa = area
                right -= 1
            else:
                area = lefth * distance
                if area > maxa: maxa = area
                left += 1
        
        return maxa