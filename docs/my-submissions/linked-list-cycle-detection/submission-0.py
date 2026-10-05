# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        
        self.been = set([])

        def checker(node):
            if node == None or node.next == None:
                return False
            if node.next.val in self.been:
                return True
            self.been.add(node.next.val)
            return checker(node.next)

        
        return checker(head)