"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""

class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        
        oldToNew = {}

        def dfs(root):
            if root in oldToNew:
                return oldToNew[root]
            
            clone = Node(root.val)
            oldToNew[root] = clone
            for i in root.neighbors:
                clone.neighbors.append(dfs(i))
            
            return clone
        
        return dfs(node) if node else None