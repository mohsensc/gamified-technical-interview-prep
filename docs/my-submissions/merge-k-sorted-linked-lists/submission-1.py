class ListNode:
    def __init__ (self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists):
        if not lists:
            return None
        
        while len(lists) > 1:
            mergedLists = []
            
            for i in range(0, len(lists), 2):

                first = lists[i]
                second = lists[i+1] if (i+1) < len(lists) else None
                mergedLists.append(self.mergeList(first, second))
            
            lists = mergedLists
        
        return lists[0]
    

    def mergeList(self, s, t):
        dummy = ListNode()
        tail = dummy

        while s and t:
            if s.val < t.val:
                tail.next = s
                s = s.next
            else:
                tail.next = t
                t = t.next
            tail = tail.next
        
        if s:
            tail.next = s
        if t:
            tail.next = t
        
        return dummy.next
