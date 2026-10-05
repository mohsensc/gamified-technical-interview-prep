class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:

        s, e = newInterval
        prev = i = 0
        total = []
        
        while i < len(intervals):
            start, end = intervals[i]
            if start > e:
                total.append(newInterval)
                return total + intervals[i:]
            elif end < s:
                total.append([start, end])
                i += 1
                continue
            else:
                s, e = min(s, start), max(e, end)
                newInterval = [min(s, start), max(e, end)]
                i += 1
        
        total.append(newInterval)
        
        return total
            
            
