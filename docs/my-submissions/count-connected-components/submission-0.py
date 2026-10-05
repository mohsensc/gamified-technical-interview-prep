class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        
        parent = [i for i in range(n)]
        rank = [1] * n
        result = n

        def find(node):

            result = node

            while parent[result] != result:
                parent[result] = parent[parent[result]]
                result = parent[result]
            
            return result

        
        def union(n1, n2):

            p1, p2 = find(n1), find(n2)

            if p1 == p2:
                return 0
            
            if rank[p1] > rank[p2]:
                parent[p2] = p1
                rank[p1] += 1
            else:
                parent[p1] = p2
                rank[p2] += 1
            return 1
        

        for a, b in edges:
            result -= union(a,b)
        
        return result
