from collections import deque

class MinStack:

    def __init__(self):
        self.stack = deque()

    def push(self, val: int) -> None:
        if self.stack:
            minVal = min(self.stack[-1][1], val)
        else:
            minVal = val
        self.stack.append((val, minVal))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]

        
