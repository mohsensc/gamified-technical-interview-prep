class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        
        unique = set(s)
        maximum = 0

        for c in unique:
            l = count = 0
            for r in range(len(s)):
                if s[r] == c:
                    count += 1
                while r-l-count+1 > k:
                    if s[l] == c:
                        count -= 1
                    l += 1
                
                maximum = max(r-l+1, maximum)
        
        return maximum

