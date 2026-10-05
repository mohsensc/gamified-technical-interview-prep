from collections import deque

class MinStack:

    def __init__(self):
        self.stack = deque()

    def push(self, val: int) -> None:
        self.stack.append(val)

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        answer = self.stack.pop()
        self.stack.append(answer)

        return answer

    def getMin(self) -> int:
        return min(self.stack)

        
