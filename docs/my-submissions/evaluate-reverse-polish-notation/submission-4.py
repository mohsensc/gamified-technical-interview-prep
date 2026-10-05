class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = collections.deque()
        ops = {'+': lambda a,b: int(a+b)
        , '-': lambda a,b: int(a-b)
        , '*': lambda a,b: int(a*b)
        , '/': lambda a,b: int(a/b)}

        for i in tokens:
            if i in ops:
                second = stack.pop()
                first = stack.pop()
                stack.append(ops[i](first,second))
            else:
                stack.append(int(i))
        
        return stack[0]