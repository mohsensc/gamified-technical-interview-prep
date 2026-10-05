# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        
        def recSwap(node):
            if not node:
                return
            
            temp = node.left
            node.left = node.right
            node.right = temp

            recSwap(node.right)
            recSwap(node.left)
            return node

        return recSwap(root)

            