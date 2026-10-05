from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:

        answer = []
        holding = deque()
        left = 0
        
        for i in range(len(nums)):
            while holding and nums[holding[-1]] < nums[i]:
                holding.pop()
            holding.append(i)

            if left > holding[0]:
                holding.popleft()

            if ((i - left + 1) >= k):
                answer.append(nums[holding[0]])
                left += 1
        
        return answer
