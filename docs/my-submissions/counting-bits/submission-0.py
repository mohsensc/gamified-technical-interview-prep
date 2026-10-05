class Solution:
    def countBits(self, n: int) -> List[int]:

        answer = []
        
        def counter(num):
            res = 0
            while num:
                res += num % 2
                num = num >> 1
            return res
        
        for i in range(n+1):
            answer.append(counter(i))
        
        return answer