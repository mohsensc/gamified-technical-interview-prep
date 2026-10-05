class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:

        result = [0] * len(temperatures)
        stack = collections.deque()

        for i in range(len(temperatures)):
            temp = temperatures[i]
            while stack and temp > stack[-1][1]:
                index = stack.pop()[0]
                result[index] = i-index
            stack.append([i,temp])
        
        return result