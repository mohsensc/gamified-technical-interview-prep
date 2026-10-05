class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:

        if s == "":
            return 0
        
        left = 0
        longest = 1
        current = set()

        for right in range(len(s)):
            if s[right] in current:
                while s[left] != s[right]:
                    current.remove(s[left])
                    left += 1
                left += 1
            
            current.add(s[right])
            longest = (right-left+1) if (right-left+1) > longest else longest

        return longest