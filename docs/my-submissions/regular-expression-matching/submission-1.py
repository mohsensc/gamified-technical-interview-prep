class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        n, m, cache = len(s), len(p), {}

        def dfs(i, j):
            if (i,j) in cache:
                return cache[(i,j)]
            if i >= n and j >= m:
                return True
            if j >= m:
                return False
            
            checker = i < n and (s[i] == p[j] or p[j] == ".")

            if (j+1) < m and p[j+1] == "*":
                cache[(i,j)] = dfs(i, j+2) or (checker and dfs(i+1, j))
                return cache[(i,j)]
            
            elif checker:
                cache[(i,j)] = dfs(i+1,j+1)
                return cache[(i,j)]

            return False
        
        return dfs(0,0)
