class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key = lambda i: i[0])

        stack = collections.deque()

        last = -1
        
        for start, end in intervals:
            if start <= last:
                new = stack.pop()
                new[1] = max(end, new[1])
                stack.append(new)
                last = new[1]
            else:
                stack.append([start,end])
                last = end
        

        return list(stack)