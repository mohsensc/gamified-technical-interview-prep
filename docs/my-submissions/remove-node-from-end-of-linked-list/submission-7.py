# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        behind = ahead = head
        
        for _ in range(n):
            ahead = ahead.next
        
        if ahead is None:
            return head.next
        
        while ahead.next:
            ahead = ahead.next
            behind = behind.next
        

        behind.next = behind.next.next

        return head
        