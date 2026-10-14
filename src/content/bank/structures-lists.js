const rotate = (choices, answer, shift) => {
  const n = choices.length
  const rotated = choices.map((_, j) => choices[(j + shift) % n])
  return { choices: rotated, answer: ((answer - shift) % n + n) % n }
}

const mcqRows = [
  ['linked-list', 2, 'Intersection of Two Linked Lists (find the shared tail node): the two-pointer trick works because…', null, ['Both lists are sorted', 'Switching to the other list\'s head when a pointer hits None equalizes the remaining distance, so both reach the intersection together', 'It sorts both lists first', 'It uses a hashmap of values'], 1, 'pointerA walks A then B, pointerB walks B then A: both travel lenA+lenB total steps, meeting exactly at the intersection (or both at None).'],
  ['linked-list', 2, 'Copy List with Random Pointer: the O(n) time, O(1) extra space trick (excluding output) interleaves what?', null, ['Two separate copied lists', 'A cloned node directly after each original node, then detaches them after wiring random pointers', 'Every node into a hashmap', 'Nothing, it needs O(n) space minimum'], 1, 'old1 -> new1 -> old2 -> new2 ... lets new.random be set as old.random.next, then the two lists are split apart.'],
  ['linked-list', 1, 'Copy List with Random Pointer, simplest correct approach?', null, ['Copy node.next pointers only', 'Hashmap: old node -> new node, then wire next and random using the map', 'Sort nodes by random pointer', 'Impossible without O(n^2) time'], 1, 'One pass builds all new nodes and the map; a second pass wires next/random by looking up old pointers in the map.'],
  ['linked-list', 2, 'Flatten a Multilevel Doubly Linked List: when a node has a child pointer, what happens?', null, ['The child is discarded', "The child list is spliced in between the node and its original next, recursively flattened first", 'The child becomes a sibling at the end', 'An error is raised'], 1, 'Depth-first: flatten the child first, insert it right after the current node, then reconnect to the original next.'],
  ['linked-list', 2, 'Rotate List right by k: first step after handling the empty/single-node case?', null, ['Reverse the whole list', 'Compute the length, then k %= length (k can exceed the list size)', 'Jump directly to rotating', 'Sort the list'], 1, 'k can be larger than the list length, so take k modulo length first, and handle k==0 as a no-op.'],
  ['linked-list', 2, 'Partition List (values < x before values >= x, stable relative order): approach?', null, ['One pass swapping values in place', 'Build two separate chains with dummy heads (less, greaterEq), then join less.tail.next = greaterEq.head', 'Sort the whole list by value', 'Use a stack'], 1, 'Two separate dummy-headed lists collect each half in original relative order, then get linked together.'],
  ['linked-list', 1, 'Swap Nodes in Pairs (1->2->3->4 becomes 2->1->4->3): why use a dummy node?', null, ['Not needed here', 'The head itself gets swapped out, so a dummy avoids a special case for the new head', 'To detect cycles', 'To count nodes'], 1, 'Since node 1 (the original head) moves to position 2, a dummy.next starting point avoids special-casing the very first swap.'],
  ['linked-list', 2, 'Palindrome Linked List in O(1) extra space: outline?', null, ['Copy to an array, then two-pointer check', 'Find the middle (fast/slow), reverse the second half, compare against the first half', 'Use a stack of all values', 'Recursively compare head and tail'], 1, 'Reversing only the second half in place avoids any extra array or stack.'],
  ['linked-list', 2, 'Sort List (merge sort on a singly linked list) time and space?', null, ['O(n log n) time, O(1) extra space with a bottom-up iterative merge', 'O(n^2) time, O(1) space', 'O(n log n) time, O(n) space always', 'O(n) time, O(n) space'], 0, 'A bottom-up (iterative) merge sort on linked lists needs no extra array and no recursion stack: true O(1) extra space.'],
  ['linked-list', 2, 'Odd Even Linked List (group all odd-indexed nodes, then all even-indexed, 1-indexed): required space?', null, ['O(n), needs a new list', 'O(1): relink in place with two running tails (odd, even) plus a saved evenHead', 'O(log n)', 'O(n^2)'], 1, 'Splitting by rewiring .next pointers needs only a few extra pointers.'],
  ['linked-list', 1, 'Remove Duplicates from Sorted List (keep one copy of each value): core loop condition to delete a node?', null, ['curr.val != curr.next.val', 'curr.next and curr.val == curr.next.val: skip it, otherwise advance', 'curr.next is None', 'curr.val > curr.next.val'], 1, 'Since the list is sorted, equal neighbors are always adjacent; skip forward past them without advancing curr when a match is found.'],
  ['linked-list', 3, 'Remove Duplicates from Sorted List II (delete ALL nodes that have any duplicate, none survive): why a dummy node here?', null, ['Not needed, same as part I', "The original head itself might be one of the duplicated values and get fully removed", 'To detect a cycle', 'To count the list length'], 1, 'If nums[0] repeats, the head itself must be dropped, so prev must start before head: dummy.next = head.'],
  ['linked-list', 2, 'Add Two Numbers II (digits stored most-significant-first, add like elementary addition): simplest linked-list approach?', null, ['Traverse and add digit by digit left to right directly', 'Reverse both lists (or use two stacks), add like the right-to-left version, then reverse the result', 'Convert each to a Python int directly, ignoring the lists', 'It cannot be solved without converting to arrays'], 1, 'Reversing (or stacking) turns it into the familiar least-significant-first addition with a carry.'],
  ['linked-list', 2, 'Linked List Cycle II (return the node where the cycle begins): after slow and fast meet inside the cycle, next step?', null, ['Return the meeting node directly', 'Reset one pointer to head; move both one step at a time until they meet again — that node is the cycle start', 'Restart fast from meeting point at double speed', 'The meeting node is never useful'], 1, 'The math works out so that distance from head to cycle start equals distance from the meeting point to the cycle start, moving at equal speed.'],
  ['linked-list', 1, 'Convert Binary Number in a Linked List to Integer (each node is a bit, most significant first): simplest approach?', null, ['Reverse the list first', 'Walk once, doing result = result * 2 + node.val at each node', 'Use recursion only, no iteration possible', 'Convert to a string first, always'], 1, 'Each new bit shifts the accumulated value left by one (multiply by 2) and adds the new bit.'],
]

const mcqs = mcqRows.map(([skill, difficulty, q, code, choices, answer, why], i) => {
  const shift = (i * 2 + 1) % choices.length
  return { id: `bank-structures:mcq:linkedlist:${i + 1}`, skills: [skill], difficulty, q, ...(code ? { code } : {}), ...rotate(choices, answer, shift), why }
})

const clozes = [
  { id: 'bank-structures:cloze:linkedlist:1', skills: ['linked-list'], title: 'Intersection of Two Linked Lists', code: `def getIntersectionNode(headA, headB):
    a, b = headA, headB

    while a is not b:
        a = a.next if a else [[headB]]
        b = b.next if b else [[headA]]

    return [[a]]` },
  { id: 'bank-structures:cloze:linkedlist:2', skills: ['linked-list'], title: 'Palindrome Linked List', code: `def isPalindrome(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    prev = None
    while slow:
        slow.next, prev, slow = prev, slow, [[slow.next]]

    left, right = head, prev
    while right:
        if left.val != [[right.val]]:
            return False
        left, right = left.next, right.[[next]]

    return [[True]]` },
  { id: 'bank-structures:cloze:linkedlist:3', skills: ['linked-list'], title: 'Copy List with Random Pointer (hashmap)', code: `def copyRandomList(head):
    if not head:
        return None

    oldToNew = {}
    curr = head
    while curr:
        oldToNew[curr] = Node([[curr.val]])
        curr = curr.next

    curr = head
    while curr:
        oldToNew[curr].next = oldToNew.get(curr.next)
        oldToNew[curr].random = oldToNew.get(curr.[[random]])
        curr = curr.next

    return [[oldToNew[head]]]` },
  { id: 'bank-structures:cloze:linkedlist:4', skills: ['linked-list'], title: 'Odd Even Linked List', code: `def oddEvenList(head):
    if not head:
        return head

    odd, even = head, head.next
    evenHead = even

    while even and even.next:
        odd.next = even.next
        odd = [[odd.next]]
        even.next = odd.next
        even = [[even.next]]

    odd.next = [[evenHead]]
    return head` },
  { id: 'bank-structures:cloze:linkedlist:5', skills: ['linked-list'], title: 'Rotate List', code: `def rotateRight(head, k: int):
    if not head or not head.next:
        return head

    length = 1
    tail = head
    while tail.next:
        tail = tail.next
        length += 1

    k %= [[length]]
    if k == 0:
        return head

    tail.next = [[head]]
    stepsToNewTail = length - k
    newTail = head
    for _ in range(stepsToNewTail - 1):
        newTail = newTail.next

    newHead = newTail.[[next]]
    newTail.next = [[None]]
    return newHead` },
  { id: 'bank-structures:cloze:linkedlist:6', skills: ['linked-list'], title: 'Reverse Nodes in k-Group (length check)', code: `def reverseKGroup(head, k):
    node = head
    for _ in range(k):
        if not node:
            return [[head]]
        node = node.next

    prev = reverseKGroup(node, k)
    curr = head

    for _ in range(k):
        temp = curr.next
        curr.next = [[prev]]
        prev = curr
        curr = [[temp]]

    return prev` },
]

const parsons = [
  { id: 'bank-structures:parsons:linkedlist:1', skills: ['linked-list'], title: 'Palindrome Linked List', lines: [
    'slow = fast = head',
    'while fast and fast.next:',
    '    slow = slow.next',
    '    fast = fast.next.next',
    'prev = None',
    'while slow:',
    '    slow.next, prev, slow = prev, slow, slow.next',
    'left, right = head, prev',
    'while right:',
    '    if left.val != right.val:',
    '        return False',
    '    left, right = left.next, right.next',
    'return True',
  ], distractors: ['    fast = fast.next', 'return False'] },
  { id: 'bank-structures:parsons:linkedlist:2', skills: ['linked-list'], title: 'Odd Even Linked List', lines: [
    'odd, even = head, head.next',
    'evenHead = even',
    'while even and even.next:',
    '    odd.next = even.next',
    '    odd = odd.next',
    '    even.next = odd.next',
    '    even = even.next',
    'odd.next = evenHead',
    'return head',
  ], distractors: ['even.next = odd.next.next'] },
  { id: 'bank-structures:parsons:linkedlist:3', skills: ['linked-list'], title: 'Linked List Cycle II (find the start)', lines: [
    'slow = fast = head',
    'while fast and fast.next:',
    '    slow = slow.next',
    '    fast = fast.next.next',
    '    if slow is fast:',
    '        pointer = head',
    '        while pointer is not slow:',
    '            pointer = pointer.next',
    '            slow = slow.next',
    '        return pointer',
    'return None',
  ], distractors: ['        pointer = fast'] },
]

const cardData = [
  ['linked-list', 'Intersection of two lists trick', "Walk A then B, and B then A, with two pointers of length lenA+lenB each; they land on the intersection together (or both None)."],
  ['linked-list', 'Copy List with Random Pointer, hashmap approach', 'Map old node -> new node in one pass, then wire next/random with .get(oldPointer) in a second pass.'],
  ['linked-list', 'Copy List with Random Pointer, O(1) space approach', 'Interleave copies directly after originals, set randoms via old.random.next, then split the two lists apart.'],
  ['linked-list', 'Flatten Multilevel Doubly Linked List', 'Recursively flatten the child first, splice it in after the current node, reconnect to the saved original next.'],
  ['linked-list', 'Rotate List: k can exceed length', 'Always do k %= length first; k == 0 (or length <= 1) is a no-op.'],
  ['linked-list', 'Partition List approach', 'Two dummy-headed chains (less, greaterEq) collect nodes in original order, then link less.tail.next to greaterEq.head.'],
  ['linked-list', 'Sort List in O(1) extra space', 'Bottom-up iterative merge sort: merge runs of size 1, then 2, 4, 8... no recursion stack, no array.'],
  ['linked-list', 'Remove Duplicates from Sorted List II', 'All copies of a repeated value are deleted, none survive. Needs a dummy since the head itself may be removed.'],
  ['linked-list', 'Add Two Numbers II strategy', 'Numbers are most-significant-digit first. Reverse both lists (or push to two stacks) to turn it into the familiar carry-from-the-right addition.'],
  ['linked-list', 'Reverse Nodes in k-Group pre-check', 'Walk k nodes ahead first; if you fall off the end, leave that final short group untouched.'],
  ['linked-list', 'Detecting a cycle with a plain set of VALUES', 'Breaks on duplicate values with no cycle — store node identities (or use Floyd\'s fast/slow) instead.'],
  ['linked-list', 'Recursive linked-list functions on huge inputs', "Python's default recursion limit (~1000) turns a 10^5-node recursive solution into a RecursionError; prefer iterative."],
]

const flashcards = cardData.map(([skill, front, back, code], i) => ({ id: `bank-structures:card:linkedlist:${i + 1}`, skills: [skill], front, back, ...(code ? { code } : {}) }))

export default {
  mcqs,
  clozes,
  parsons,
  flashcards,
}
