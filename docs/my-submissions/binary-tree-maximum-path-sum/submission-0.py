# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        
        self.maxSum = float('-inf')

        def dfs(node):
            if not node:
                return 0
            left = max(0, dfs(node.left))
            right = max(0, dfs(node.right))
            currMax = node.val + left + right
            if currMax > self.maxSum:
                self.maxSum = currMax
            return node.val + max(left, right)
        
        dfs(root)

        return self.maxSum