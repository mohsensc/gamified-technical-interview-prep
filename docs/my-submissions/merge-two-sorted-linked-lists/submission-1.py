# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        
        if list1 == None: return list2
        if list2 == None: return list1
        
        if list1.val > list2.val:
            list1, list2 = list2, list1
        
        prev, curr1, curr2 = list1, list1.next, list2
        while curr1 and curr2:
            if curr1.val < curr2.val:
                prev, curr1 = curr1, curr1.next
            else:
                temp = curr2.next
                prev.next = curr2
                curr2.next = curr1
                prev, curr2 = curr2, temp
        
        if curr2: prev.next = curr2

        return list1
        