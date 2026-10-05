class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:

        intervals.sort()

        answer = 0
        
        last = intervals[0][1]

        for start, end in intervals[1:]:
            if start < last:
                answer += 1
                last = min(last, end)
            else:
                last = end
        
        return answer
