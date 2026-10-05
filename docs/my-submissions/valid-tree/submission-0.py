class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        
        if not n:
            return True

        if len(edges) != n-1:
            return False
        
        edgedict = {i:[] for i in range(n)}

        for a, b in edges:
            edgedict[a].append(b)
            edgedict[b].append(a)
        
        seen = set()
        
        def dfs(node, prev):
            if node in seen:
                return False
            
            seen.add(node)
            
            for j in edgedict[node]:
                if j == prev:
                    continue
                
                if not dfs(j, node):
                    return False
            
            return True
        
        return dfs(0, -1) and len(seen) == n
