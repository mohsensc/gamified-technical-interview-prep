# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Codec:
    
    # Encodes a tree to a single string.
    def serialize(self, root: Optional[TreeNode]) -> str:

        string = []

        def dfs(node):
            if not node:
                string.append("N")
                return
            
            string.append(f"{node.val}")
            dfs(node.left)
            dfs(node.right)
        
        dfs(root)

        return ",".join(string)


        
    # Decodes your encoded data to tree.
    def deserialize(self, data: str) -> Optional[TreeNode]:

        self.index = 0

        def dfs(string):

            if string[self.index] == "N":
                self.index += 1
                return None

            root = TreeNode(int(string[self.index]))
            self.index += 1
            root.left = dfs(string)
            root.right = dfs(string)

            return root
        
        return dfs(data.split(","))




