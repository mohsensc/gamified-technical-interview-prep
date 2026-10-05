class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:

        intervals.sort()

        answer = 0
        
        last = intervals[0][1]

        for i in range(1, len(intervals)):
            if intervals[i][0] < last:
                answer += 1
                last = last if intervals[i][1] > last else intervals[i][1]
                continue
            else:
                last = intervals[i][1]
        
        return answer
