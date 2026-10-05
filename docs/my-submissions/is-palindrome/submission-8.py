class Solution:
    def isPalindrome(self, s: str) -> bool:
        
        joined = (''.join(c for c in s if c.isalnum())).lower()

        if len(joined) <= 1: return True

        left = 0
        right = len(joined)-1

        while left < right:
            if joined[left] != joined[right]:
                return False
            left += 1
            right -= 1
        
        return True