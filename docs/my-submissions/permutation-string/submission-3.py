from collections import Counter

class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        d, l = Counter(s1), len(s1)
        second = Counter(s2[:l])

        if d == second:
            return True

        for i in range(l, len(s2)):
            second[s2[i]] += 1
            second[s2[i - l]] -= 1
            if d == second:
                return True
        
        return False