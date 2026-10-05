from collections import Counter

class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        d, l = Counter(s1), len(s1)

        for i in range(l, len(s2)+1):
            if d == Counter(s2[i-l:i]):
                return True
        
        return False