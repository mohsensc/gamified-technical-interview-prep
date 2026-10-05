from collections import deque

class Solution:
    def isValid(self, s: str) -> bool:
        
        stack = deque()
        combos = {')':'(', '}':'{', ']':'['}

        for i in s:
            if i in combos:
                if not stack:
                    return False
                if stack.pop() != combos.get(i, 0):
                    return False
            else:
                stack.append(i)
        
        return False if stack else True