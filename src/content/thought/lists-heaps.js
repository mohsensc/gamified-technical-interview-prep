const items = [
  {
    id: 'thought:lists-heaps:reverse-linked-list',
    lc: 206,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'lists-heaps',
    skills: ['linked-list'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `You're given the head of a singly linked list. Reverse the list and return the new head.

Every node's .next pointer should end up aiming the opposite direction it did before, and the old tail becomes the new head.

Solve it in a single pass using O(1) extra space, not by copying values into an array and rebuilding the list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = []', output: '[]', explanation: 'an empty list reverses to itself' },
    ],
    constraints: ['0 <= number of nodes <= 5000', '-5000 <= Node.val <= 5000'],
    ds: {
      answer: 'three rolling pointers (prev, curr, next), no extra structure',
      choices: ['three rolling pointers (prev, curr, next), no extra structure', 'stack of nodes, popped to rebuild the list', 'array of values, rebuilt into new nodes', 'dd(list) adjacency + BFS over node ids'],
    },
    method: {
      answer: 'Iterative pointer flip: ==walk forward saving next before overwriting curr.next to point at prev==, then shift prev and curr both ahead one node',
      choices: [
        'Recursive: reverse the rest of the list first, then fix up the last node\'s next pointer on the way back up',
        'Iterative pointer flip: ==walk forward saving next before overwriting curr.next to point at prev==, then shift prev and curr both ahead one node',
        'Push every node onto a stack, then pop them off and relink next pointers in that order',
        'Copy every node\'s value into an array, reverse the array, then overwrite each node\'s value in place',
      ],
    },
    code: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head

        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt

        return prev`,
    blanks: [7, 8, 9],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], why: 'one pass over every node, relinking one pointer each' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only three pointer variables, no new nodes or array allocated' },
    sayIt: "I walk forward with ==prev/curr/next==, flipping each curr.next to point back at prev before advancing, O(n) time, O(1) space.",
    pitfall: 'Saving nxt = curr.next before overwriting curr.next, or you lose the rest of the list.',
  },
  {
    id: 'thought:lists-heaps:linked-list-cycle',
    lc: 141,
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    category: 'lists-heaps',
    skills: ['linked-list', 'two-pointers'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `Given the head of a linked list, determine if the list has a cycle in it: some node's next pointer eventually loops back to a node earlier in the list instead of ending at None.

You need to detect this using O(1) extra memory, which rules out storing every visited node in a set.

Return true if a cycle exists anywhere in the list, false if it terminates normally at None.`,
    examples: [
      { input: 'head = [3,2,0,-4], the tail connects back to index 1', output: 'true', explanation: "the -4 node's next points back to the node holding 2, forming a loop" },
      { input: 'head = [1], no cycle', output: 'false' },
    ],
    constraints: ['0 <= number of nodes <= 10^4', '-10^5 <= Node.val <= 10^5'],
    ds: {
      answer: 'two pointers moving at different speeds (Floyd\'s), no visited set',
      choices: ['two pointers moving at different speeds (Floyd\'s), no visited set', 'set of visited node references', 'dict mapping node id to visit count', 'stack of nodes pushed while walking'],
    },
    method: {
      answer: "Floyd's cycle detection: advance ==slow one step and fast two steps each loop==; if they ever land on the same node, a cycle exists, and a fast/fast.next hitting None proves there isn't one",
      choices: [
        "Floyd's cycle detection: advance ==slow one step and fast two steps each loop==; if they ever land on the same node, a cycle exists, and a fast/fast.next hitting None proves there isn't one",
        'Walk the list once adding every node to a visited set, flag a cycle the moment a node repeats',
        'Count total nodes visited and compare against a fixed cap, flagging a cycle if the cap is exceeded',
        'Advance two pointers at the same speed one step apart, checking if they ever meet',
      ],
    },
    code: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

            if slow == fast:
                return True

        return False`,
    blanks: [5, 6, 8],
    accept: { 8: ['if fast == slow:'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'], why: 'fast pointer covers the list at most twice before meeting slow or hitting None' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only two pointer variables, no visited set' },
    sayIt: "==Floyd's tortoise and hare==: slow moves 1, fast moves 2; if they meet there's a cycle, if fast runs off the end there isn't. O(n)/O(1).",
    pitfall: 'Checking fast.next before fast.next.next, or fast.next.next crashes on the last node.',
  },
  {
    id: 'thought:lists-heaps:merge-two-lists',
    lc: 21,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'lists-heaps',
    skills: ['linked-list'],
    companies: ['amazon', 'microsoft', 'apple'],
    statement: `You're given the heads of two sorted linked lists. Merge them into one sorted list by splicing the existing nodes together, and return the head of the merged list.

Don't build new nodes; reuse the nodes from both input lists, just rewire their next pointers.

Either list can be empty, and the merge should still work correctly in that case.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
    ],
    constraints: ['0 <= number of nodes in each list <= 50', '-100 <= Node.val <= 100', 'both lists are sorted in non-decreasing order'],
    ds: {
      answer: 'dummy head node + tail pointer, splice existing nodes',
      choices: ['dummy head node + tail pointer, splice existing nodes', 'min-heap of (val, node) pairs', 'array of all values, sorted then rebuilt into nodes', 'recursion with no explicit pointer tracking'],
    },
    method: {
      answer: 'Two-pointer merge: ==compare the current heads of both lists, splice the smaller one onto the tail==, and advance that list\'s pointer, repeating until one list is empty',
      choices: [
        'Two-pointer merge: ==compare the current heads of both lists, splice the smaller one onto the tail==, and advance that list\'s pointer, repeating until one list is empty',
        'Walk list1 fully first, then walk list2 fully, concatenating the two without comparing values',
        'Dump every value from both lists into one array, sort it, then rebuild fresh nodes from scratch',
        'Recursively merge by always taking from list1 first regardless of which value is smaller',
      ],
    },
    code: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                tail.next, list1 = list1, list1.next
            else:
                tail.next, list2 = list2, list2.next
            tail = tail.next

        tail.next = list1 or list2

        return dummy.next`,
    blanks: [7, 9, 12],
    accept: { 12: ['tail.next = list2 or list1'] },
    time: { answer: 'O(n + m)', choices: ['O(n + m)', 'O(n * m)', 'O((n + m) log(n + m))', 'O(1)'], why: 'one pointer walks each list exactly once' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n + m)', 'O(log(n + m))', 'O(n * m)'], why: 'existing nodes are relinked, no new nodes allocated' },
    sayIt: "Dummy head, ==splice the smaller of list1/list2 onto the tail each step==, then tack on whatever's left, O(n+m) time, O(1) space.",
    pitfall: 'Forgetting `tail.next = list1 or list2` to attach the remaining, non-empty list at the end.',
  },
  {
    id: 'thought:lists-heaps:add-two-numbers',
    lc: 2,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['linked-list', 'math'],
    companies: ['amazon', 'microsoft', 'bloomberg'],
    statement: `Two non-negative integers are stored as linked lists, each digit a node, with the digits in reverse order (the ones digit is the head). Add the two numbers and return the sum as a linked list in the same reversed format.

The lists can have different lengths, and the result may need one extra digit beyond the longer input if the final carry doesn't resolve.

Each node holds a single digit 0-9, and you shouldn't convert the lists to actual integers for large inputs since they could overflow a fixed-size int in other languages (Python handles it fine, but add digit by digit anyway).`,
    examples: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807, reversed as [7,0,8]' },
      { input: 'l1 = [9,9], l2 = [1]', output: '[0,0,1]', explanation: '99 + 1 = 100' },
    ],
    constraints: ['1 <= number of nodes in each list <= 100', '0 <= Node.val <= 9', 'no leading zeros except the number 0 itself'],
    ds: {
      answer: 'dummy head node + tail pointer + carry int',
      choices: ['dummy head node + tail pointer + carry int', 'convert both lists to Python ints, add, convert back', 'stack per list, popping digits from the end', 'array of digits, zip-padded to equal length'],
    },
    method: {
      answer: 'Simulate grade-school addition: at each position ==add both digits plus the running carry==, emit digit = total % 10, keep carrying total // 10, continue while either list or the carry still has something left',
      choices: [
        'Simulate grade-school addition: at each position ==add both digits plus the running carry==, emit digit = total % 10, keep carrying total // 10, continue while either list or the carry still has something left',
        'Convert each list to a Python int by joining digit strings in list order, add them, convert the sum back to a reversed digit list',
        'Pad the shorter list with None nodes to match lengths, then add position by position ignoring carry until the very end',
        'Reverse both lists first so the most significant digit is at the head, then add like standard written addition left to right',
      ],
    },
    code: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        carry = 0

        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next

            carry, digit = divmod(total, 10)
            tail.next = ListNode(digit)
            tail = tail.next

        return dummy.next`,
    blanks: [15, 16, 17],
    time: { answer: 'O(max(n, m))', choices: ['O(max(n, m))', 'O(n + m)', 'O(n * m)', 'O(min(n, m))'], why: 'loop runs once per digit of the longer number, plus maybe one extra for a final carry' },
    space: { answer: 'O(max(n, m))', choices: ['O(max(n, m))', 'O(1)', 'O(n * m)', 'O(log(max(n,m)))'], why: 'the output list has one node per digit of the result' },
    sayIt: "I simulate addition: ==total = carry + l1 digit + l2 digit==, split with divmod(total, 10), keep going while either list or carry remains. O(max(n,m)) time.",
    pitfall: 'Looping on `l1 or l2 or carry`, not just `l1 or l2` — a trailing carry needs one more node.',
  },
  {
    id: 'thought:lists-heaps:remove-nth-from-end',
    lc: 19,
    title: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['linked-list', 'two-pointers'],
    companies: ['amazon', 'microsoft', 'apple'],
    statement: `Given the head of a linked list, remove the nth node from the end of the list and return the head.

n is guaranteed valid (1 <= n <= length), and the node to remove might be the head itself, so handle that edge case without a special-case branch if you can.

Do it in one pass, without first walking the list to compute its length.`,
    examples: [
      { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
      { input: 'head = [1], n = 1', output: '[]' },
    ],
    constraints: ['the number of nodes is sz', '1 <= sz <= 30', '0 <= Node.val <= 100', '1 <= n <= sz'],
    ds: {
      answer: 'dummy head + two pointers kept n apart',
      choices: ['dummy head + two pointers kept n apart', 'array of node references, index from the end', 'stack of nodes pushed while walking once', 'single pointer, two full passes over the list'],
    },
    method: {
      answer: "Two-pointer gap trick: advance ==fast n steps ahead of slow first==, then move both one step at a time until fast falls off the end, leaving slow just before the node to delete",
      choices: [
        'Walk the list once to count total length, then walk a second time to the (length - n)th node and unlink it',
        "Two-pointer gap trick: advance ==fast n steps ahead of slow first==, then move both one step at a time until fast falls off the end, leaving slow just before the node to delete",
        'Push every node onto a stack while walking, pop n times, then unlink whatever is on top',
        'Reverse the list, walk forward n steps to find the node, remove it, then reverse back',
      ],
    },
    code: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        fast = slow = dummy

        for _ in range(n):
            fast = fast.next

        while fast.next:
            fast = fast.next
            slow = slow.next

        slow.next = slow.next.next

        return dummy.next`,
    blanks: [6, 10, 12],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'], why: 'fast walks n steps ahead, then both walk forward together, one pass total' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a dummy node and two pointers, no array or stack' },
    sayIt: "Dummy head, ==fast goes n steps ahead of slow first==, then both walk together until fast.next is None, so slow sits right before the node to cut. One pass, O(1) space.",
    pitfall: 'Using a dummy head is what makes removing the actual head itself not a special case.',
  },
  {
    id: 'thought:lists-heaps:reorder-list',
    lc: 143,
    title: 'Reorder List',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['linked-list', 'two-pointers'],
    companies: ['amazon', 'meta'],
    statement: `Given the head of a singly linked list L0 -> L1 -> ... -> Ln-1 -> Ln, reorder it in place to L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ..., weaving the front half and the reversed back half together.

You must do this by rewiring existing node pointers only, no copying values into a new list or array.

Think of it as three sub-problems back to back: find the middle, reverse the second half, then merge the two halves by alternating nodes.`,
    examples: [
      { input: 'head = [1,2,3,4]', output: '[1,4,2,3]' },
      { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]' },
    ],
    constraints: ['1 <= number of nodes <= 5 * 10^4', '1 <= Node.val <= 1000'],
    ds: {
      answer: 'slow/fast pointers for the middle, then in-place reversal, then two-pointer merge',
      choices: ['slow/fast pointers for the middle, then in-place reversal, then two-pointer merge', 'array of all node references, indexed front and back alternately', 'stack holding the second half, popped while walking the first half', 'deque of all nodes, popping from both ends alternately'],
    },
    method: {
      answer: "Three-phase rewiring: ==find the middle with slow/fast, reverse the second half, then splice the two halves together node by node==, alternating first-half and reversed-second-half nodes",
      choices: [
        "Three-phase rewiring: ==find the middle with slow/fast, reverse the second half, then splice the two halves together node by node==, alternating first-half and reversed-second-half nodes",
        'Copy every node value into an array, then overwrite node.val front-to-back using the zigzag index order into that array',
        'Reverse the entire list first, then interleave it with the original unreversed list from both heads',
        'Use a stack to hold every node from front to back, then pop the stack to always attach the largest-index node next',
      ],
    },
    code: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        slow = fast = head

        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        prev, curr = None, slow.next
        slow.next = None
        while curr:
            curr.next, prev, curr = prev, curr, curr.next

        first, second = head, prev
        while second:
            first.next, first = second, first.next
            second.next, second = first, second.next`,
    blanks: [9, 11, 16],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'each of the three phases (find middle, reverse, merge) is a single linear pass' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a handful of pointer variables, the same nodes are relinked in place' },
    sayIt: "Find the ==middle with slow/fast==, ==reverse the second half==, then ==alternate-merge the two halves==. All in-place, O(n) time, O(1) space.",
    pitfall: 'Forgetting to cut the first half from the second with `slow.next = None` before reversing, or you get an infinite loop.',
  },
  {
    id: 'thought:lists-heaps:copy-random-list',
    lc: 138,
    title: 'Copy List with Random Pointer',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['linked-list'],
    companies: ['amazon', 'microsoft', 'meta', 'bloomberg'],
    statement: `You're given a linked list where each node has a .next pointer and also a .random pointer, which can point to any node in the list (or None). Build a deep copy of the entire list.

The copy must be fully independent: none of its .next or .random pointers may point back into the original list, only into the new one.

Because .random pointers can point forward to nodes not created yet, you need some way to look up "the new node that corresponds to this old node" regardless of order.`,
    examples: [
      { input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: 'a deep copy with identical val/next/random shape', explanation: 'node i\'s .random index refers to the node at that position in the original list' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: ['0 <= number of nodes <= 1000', '-10^4 <= Node.val <= 10^4', 'Node.random is None or points to some node in the list'],
    ds: {
      answer: 'dict mapping original node -> new node (old-to-new)',
      choices: ['dict mapping original node -> new node (old-to-new)', 'array of new nodes indexed by position, random resolved by index', 'two stacks, one for next chain and one for random chain', 'set of visited nodes plus a single new-node pointer'],
    },
    method: {
      answer: 'Two-pass hashmap: ==first pass creates every new node and maps old node -> new node==, second pass walks the originals again wiring each new node\'s .next and .random via that same map',
      choices: [
        'Two-pass hashmap: ==first pass creates every new node and maps old node -> new node==, second pass walks the originals again wiring each new node\'s .next and .random via that same map',
        'Single pass creating new nodes and wiring .next and .random immediately, resolving forward .random references by creating placeholder nodes on demand without storing them anywhere',
        'Interleave each new node directly after its original (old1, new1, old2, new2, ...), copy random via old.random.next, then unweave; never storing a hashmap',
        'Recursively clone starting from .random pointers first, falling back to .next only once every random chain is exhausted',
      ],
    },
    code: `class Solution:
    def copyRandomList(self, head: Optional[Node]) -> Optional[Node]:
        if not head:
            return None

        oldToNew = {}

        curr = head
        while curr:
            oldToNew[curr] = Node(curr.val)
            curr = curr.next

        curr = head
        while curr:
            oldToNew[curr].next = oldToNew.get(curr.next)
            oldToNew[curr].random = oldToNew.get(curr.random)
            curr = curr.next

        return oldToNew[head]`,
    blanks: [9, 14, 15],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(1)'], why: 'two linear passes over the original list, O(1) hashmap lookups' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n^2)', 'O(log n)'], why: 'the old-to-new map holds one entry per original node' },
    sayIt: "First pass: ==build a new node per old node, map old -> new==. Second pass: wire ==.next and .random through that map==. O(n) time/space, every lookup is O(1).",
    pitfall: 'Wiring .next/.random during the first pass fails when .random points to a node not created yet — needs two passes.',
  },
  {
    id: 'thought:lists-heaps:lru-cache',
    lc: 146,
    title: 'LRU Cache',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['linked-list'],
    companies: ['amazon', 'microsoft', 'google', 'bloomberg'],
    statement: `Design a Least Recently Used (LRU) cache with a fixed capacity. It needs get(key) and put(key, value), both running in O(1) average time.

get returns the value for a key, or -1 if it isn't present, and counts as "using" that key, making it the most recently used. put inserts or updates a key's value, also marking it most recently used; if inserting a new key pushes the cache over capacity, evict the least recently used key first.

You need both fast key lookup and a way to track usage order that supports O(1) "move this key to the front" — a plain list can't do that part in O(1).`,
    examples: [
      { input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)', output: 'null, null, null, 1, null, -1, null, -1, 3, 4', explanation: 'put(3,3) evicts key 2 (least recently used); put(4,4) evicts key 1' },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key, value <= 10^4', 'at most 2*10^5 calls total to get and put'],
    ds: {
      answer: 'ordered dict acting as hashmap + doubly linked usage order',
      choices: ['ordered dict acting as hashmap + doubly linked usage order', 'plain dict + a separate list of keys sorted by recency', 'array of (key, value) pairs, linearly scanned on every get', 'min-heap of (lastUsedTime, key), re-heapified on every access'],
    },
    method: {
      answer: 'Hashmap + usage-ordered structure: ==move a key to the most-recently-used end on every get or put==, and when over capacity, ==evict from the least-recently-used end==, both O(1) with an ordered dict',
      choices: [
        'Hashmap + usage-ordered structure: ==move a key to the most-recently-used end on every get or put==, and when over capacity, ==evict from the least-recently-used end==, both O(1) with an ordered dict',
        'Plain dict for lookups, plus a Python list you re-sort by a lastUsed timestamp every single get and put',
        'Store a global counter incremented on every call, stamp each entry with it, and scan every entry for the minimum to evict',
        'Hashmap only, evicting a uniformly random key whenever the cache is over capacity instead of tracking recency',
      ],
    },
    code: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1

        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)

        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    blanks: [9, 16, 18],
    time: { answer: 'O(1)', choices: ['O(1)', 'O(log n)', 'O(capacity)', 'O(n)'], why: 'ordered dict gives O(1) lookup, move-to-end, and pop-from-front' },
    space: { answer: 'O(capacity)', choices: ['O(capacity)', 'O(1)', 'O(n)', 'O(capacity^2)'], why: 'the cache never holds more than capacity entries' },
    sayIt: "OrderedDict gives me a hashmap plus recency order in one structure: ==move_to_end on every access==, ==popitem(last=False) to evict the LRU key==. O(1) per op.",
    pitfall: 'Forgetting move_to_end on put when the key already exists — a cache hit must count as recent use too.',
  },
  {
    id: 'thought:lists-heaps:reverse-k-group',
    lc: 25,
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    category: 'lists-heaps',
    skills: ['linked-list'],
    companies: ['amazon', 'microsoft', 'google'],
    statement: `Given the head of a linked list, reverse the nodes k at a time and return the new head. k is a positive integer, and if the number of nodes left at the end isn't a multiple of k, leave that final partial group exactly as it is.

You can't just reverse nodes' values, the nodes themselves need to move.

Think of it recursively: reverse the first group of k nodes, then recurse on the rest of the list, and let whatever the recursive call returns become the new "next" of the just-reversed group's original head.`,
    examples: [
      { input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]' },
      { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]' },
    ],
    constraints: ['the number of nodes is n', '1 <= k <= n <= 5000', '0 <= Node.val <= 1000'],
    ds: {
      answer: 'recursion returning the new sub-head, in-place pointer reversal per group',
      choices: ['recursion returning the new sub-head, in-place pointer reversal per group', 'array of all node references, sliced into chunks of k and reversed', 'stack per group of k, popped to relink nodes', 'queue holding one group at a time, dequeued in reverse order'],
    },
    method: {
      answer: "Recursive grouping: ==first check k nodes exist ahead, returning head unchanged if not==, then recursively solve the rest of the list, then ==reverse this group's k pointers so they point into that recursive result==",
      choices: [
        "Recursive grouping: ==first check k nodes exist ahead, returning head unchanged if not==, then recursively solve the rest of the list, then ==reverse this group's k pointers so they point into that recursive result==",
        'Reverse the entire list first, then re-reverse it in chunks of k from the new head to undo the extra groups',
        'Collect every node into one big array, reverse the whole array, then slice it back into chunks of k',
        'Recursively reverse from the tail backward, grouping k nodes starting from the end instead of the start',
      ],
    },
    code: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        node = head
        for _ in range(k):
            if not node:
                return head
            node = node.next

        prev = self.reverseKGroup(node, k)
        curr = head
        for _ in range(k):
            curr.next, prev, curr = prev, curr, curr.next

        return prev`,
    blanks: [6, 8, 11],
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n * k)', 'O(n^2)'], why: 'every node is visited once during the existence check and once during its group\'s reversal' },
    space: { answer: 'O(n / k)', choices: ['O(n / k)', 'O(1)', 'O(n)', 'O(k)'], why: 'recursion depth is one call per group of k nodes' },
    sayIt: "I check ==k nodes exist ahead first==, recurse on the rest, then ==reverse this group's k links into whatever the recursion returned==. O(n) time, O(n/k) recursion depth.",
    pitfall: "Checking k nodes exist before reversing, so a trailing partial group is correctly left untouched.",
  },
  {
    id: 'thought:lists-heaps:merge-k-lists',
    lc: 23,
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    category: 'lists-heaps',
    skills: ['heap', 'linked-list'],
    companies: ['amazon', 'google', 'microsoft', 'meta'],
    statement: `You're given an array of k linked lists, each already sorted in ascending order. Merge all of them into one sorted linked list and return its head.

With k potentially large, repeatedly merging two lists at a time (pairwise) works but a min-heap lets you pick the overall smallest head node directly at every step.

Each list can be empty, and the total number of nodes across all lists can be large, so the approach needs to scale with total nodes, not blow up per merge.`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
    ],
    constraints: ['0 <= k <= 10^4', '0 <= number of nodes in each list <= 500', '-10^4 <= Node.val <= 10^4', 'total nodes across all lists <= 10^4'],
    ds: {
      answer: 'min-heap of (val, list index, node), dummy head + tail',
      choices: ['min-heap of (val, list index, node), dummy head + tail', 'array of all node values, sorted then rebuilt into nodes', 'merge the lists pairwise two at a time with no heap at all', 'dict mapping value to list of nodes sharing it'],
    },
    method: {
      answer: 'Heap-based k-way merge: seed the heap with each list\'s head, then repeatedly ==pop the smallest node, splice it onto the output, and push its successor== from the same list back onto the heap',
      choices: [
        'Heap-based k-way merge: seed the heap with each list\'s head, then repeatedly ==pop the smallest node, splice it onto the output, and push its successor== from the same list back onto the heap',
        'Concatenate all k lists together first, then sort the combined list with a single merge sort pass over the linked structure',
        'Compare the current heads of all k lists directly every step with a linear scan to find the minimum, no heap',
        'Recursively split the k lists in half, merge each half as one list with mergeTwoLists, no indexing into the heap by list',
      ],
    },
    code: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode()
        tail = dummy

        while heap:
            val, i, node = heapq.heappop(heap)
            tail.next = node
            tail = tail.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next`,
    blanks: [11, 12, 15],
    time: { answer: 'O(N log k)', choices: ['O(N log k)', 'O(N * k)', 'O(N log N)', 'O(N + k)'], why: 'N total nodes, each pushed/popped once from a heap of size up to k' },
    space: { answer: 'O(k)', choices: ['O(k)', 'O(N)', 'O(1)', 'O(N * k)'], why: 'the heap holds at most one entry per list at any time' },
    sayIt: "Min-heap seeded with every list's head, tagged with list index to break val ties. ==Pop smallest, extend output, push its successor==. O(N log k) time, O(k) heap space.",
    pitfall: 'Including the list index in the heap tuple so ties on equal node.val never try to compare ListNode objects directly.',
  },
  {
    id: 'thought:lists-heaps:kth-largest',
    lc: 215,
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['heap'],
    companies: ['amazon', 'meta', 'microsoft'],
    statement: `Given an integer array and an integer k, find the kth largest element in the array. That means the kth largest in sorted order, not the kth distinct value, so duplicates count individually.

You need something better than fully sorting the array when the array is large and k is small.

A min-heap capped at size k gives you exactly the kth largest sitting at the top once every element has been processed.`,
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' },
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    ds: {
      answer: 'min-heap capped at size k',
      choices: ['min-heap capped at size k', 'max-heap of every element, popped k times', 'sorted array (full sort), index from the end', 'dict counting occurrences, scanned from the largest key down'],
    },
    method: {
      answer: 'Bounded min-heap: push every number, and ==whenever the heap grows past size k, pop the smallest==, so only the k largest survive and the kth largest ends up at the top',
      choices: [
        'Bounded min-heap: push every number, and ==whenever the heap grows past size k, pop the smallest==, so only the k largest survive and the kth largest ends up at the top',
        'Push every number onto a max-heap, then pop k-1 times and return whatever pops on the kth call without ever bounding heap size',
        'Fully sort the array ascending, then index k from the start instead of from the end',
        'Use quickselect, partitioning around a pivot chosen as the first element every single time with no randomization',
      ],
    },
    code: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []

        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > k:
                heapq.heappop(heap)

        return heap[0]`,
    blanks: [5, 7, 9],
    time: { answer: 'O(n log k)', choices: ['O(n log k)', 'O(n log n)', 'O(n)', 'O(n * k)'], why: 'each of the n pushes/pops costs O(log k) against a heap bounded to size k' },
    space: { answer: 'O(k)', choices: ['O(k)', 'O(n)', 'O(1)', 'O(log k)'], why: 'the heap never holds more than k elements' },
    sayIt: "Min-heap bounded to size k: ==push every num, pop the smallest once size exceeds k==, leaving the kth largest on top. O(n log k) time, O(k) space.",
    pitfall: 'A min-heap, not a max-heap — popping the smallest is what keeps only the k largest.',
  },
  {
    id: 'thought:lists-heaps:last-stone-weight',
    lc: 1046,
    title: 'Last Stone Weight',
    difficulty: 'Easy',
    category: 'lists-heaps',
    skills: ['heap'],
    companies: ['amazon', 'google'],
    statement: `You have a pile of stones, each with a positive weight. Each turn, smash together the two heaviest stones: if they're equal, both are destroyed; if not, the lighter one is destroyed and the heavier one's weight becomes the difference.

Keep going until at most one stone remains, and return that stone's weight, or 0 if none remain.

Python's heapq is a min-heap only, so to repeatedly grab the two largest you need a trick to simulate a max-heap.`,
    examples: [
      { input: 'stones = [2,7,4,1,8,1]', output: '1', explanation: '8&7->1, 2&4->2, 2&1->1, 1&1->0; (order among equal picks may vary but 1 remains either way)' },
      { input: 'stones = [1]', output: '1' },
    ],
    constraints: ['1 <= stones.length <= 30', '1 <= stones[i] <= 1000'],
    ds: {
      answer: 'max-heap simulated by pushing negated weights',
      choices: ['max-heap simulated by pushing negated weights', 'sorted array, re-sorted fully after every smash', 'dict counting weight frequencies, scanned for the max each turn', 'two pointers over a pre-sorted array, one from each end'],
    },
    method: {
      answer: 'Negate-to-simulate-max-heap: heapify ==negated weights so the two actual heaviest pop first via heappop==, smash them, and if a positive difference remains push its negation back',
      choices: [
        'Negate-to-simulate-max-heap: heapify ==negated weights so the two actual heaviest pop first via heappop==, smash them, and if a positive difference remains push its negation back',
        'Sort the array once up front, then repeatedly pop the last two elements with .pop() and re-insert the difference with .append(), no re-sorting',
        'Build a min-heap of the raw (non-negated) weights and pop the two smallest each turn instead of the two largest',
        'Use a dict to count how many stones share each weight, always smashing the two most frequent weights together',
      ],
    },
    code: `class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        heap = [-s for s in stones]
        heapq.heapify(heap)

        while len(heap) > 1:
            first = -heapq.heappop(heap)
            second = -heapq.heappop(heap)
            if first != second:
                heapq.heappush(heap, -(first - second))

        return -heap[0] if heap else 0`,
    blanks: [2, 9, 11],
    time: { answer: 'O(n log n)', choices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], why: 'up to n smashes, each doing O(log n) heap pops/pushes' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(n log n)', 'O(log n)'], why: 'the heap holds up to n negated weights' },
    sayIt: "Heapq is min-only, so I ==negate every weight to fake a max-heap==, pop the two largest, push back the negated difference if nonzero. O(n log n).",
    pitfall: 'Remembering to re-negate both when popping and when pushing the difference back.',
  },
  {
    id: 'thought:lists-heaps:top-k-frequent',
    lc: 347,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['heap'],
    companies: ['amazon', 'meta', 'microsoft'],
    statement: `Given an integer array and an integer k, return the k most frequent elements, in any order.

The straightforward approach sorts all distinct values by frequency, which is O(n log n). A heap bounded to size k can do it in O(n log k) instead.

You can assume the answer (the set of k most frequent elements) is uniquely determined, so you don't need to worry about tie-breaking rules.`,
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'k is in range [1, number of distinct elements]'],
    ds: {
      answer: 'Counter for frequencies + min-heap of (freq, value) bounded to size k',
      choices: ['Counter for frequencies + min-heap of (freq, value) bounded to size k', 'Counter for frequencies, then a full sort of all distinct values by count', 'bucket array indexed by frequency, read off from the top bucket down', 'single max-heap of every raw array element, popped k times'],
    },
    method: {
      answer: 'Count then bound: ==Counter(nums) gets each value\'s frequency==, push (freq, value) pairs onto a heap, and ==pop the smallest once the heap exceeds size k==, leaving the k most frequent',
      choices: [
        'Count then bound: ==Counter(nums) gets each value\'s frequency==, push (freq, value) pairs onto a heap, and ==pop the smallest once the heap exceeds size k==, leaving the k most frequent',
        'Counter(nums) for frequencies, then Python\'s sorted() on all distinct values by frequency descending, slicing the first k',
        'Skip counting entirely; push every raw array element onto a max-heap and pop k times, returning whatever values come off',
        'Bucket sort by frequency into an array of size n+1, then read buckets from index 0 upward until k elements are collected',
      ],
    },
    code: `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        counts = Counter(nums)
        heap = []

        for num, freq in counts.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)

        return [num for freq, num in heap]`,
    blanks: [6, 8, 10],
    time: { answer: 'O(n log k)', choices: ['O(n log k)', 'O(n log n)', 'O(n)', 'O(n * k)'], why: 'Counter is O(n), then one heap push/pop per distinct value, each O(log k)' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(k)', 'O(1)', 'O(n log n)'], why: 'Counter can hold up to n distinct keys even though the heap itself stays at size k' },
    sayIt: "==Counter(nums)== for frequencies, then a heap bounded to size k by ==popping the smallest freq whenever it overflows==, leaving the k most frequent. O(n log k).",
    pitfall: 'Pushing (freq, num) in that order so the heap compares by frequency first.',
  },
  {
    id: 'thought:lists-heaps:k-closest-points',
    lc: 973,
    title: 'K Closest Points to Origin',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['heap'],
    companies: ['amazon', 'google', 'microsoft'],
    statement: `Given an array of points on the X-Y plane and an integer k, return the k points closest to the origin (0, 0), in any order.

Distance here is standard Euclidean distance, but since you only need to compare distances (not report them), you can skip the square root and compare squared distances instead.

Any ordering of the k closest points is accepted, so you just need the right set, not a specific order.`,
    examples: [
      { input: 'points = [[1,3],[-2,2]], k = 1', output: '[[-2,2]]', explanation: '(-2,2) has squared distance 8, versus 10 for (1,3)' },
      { input: 'points = [[3,3],[5,-1],[-2,4]], k = 2', output: '[[3,3],[-2,4]]' },
    ],
    constraints: ['1 <= k <= points.length <= 10^4', '-10^4 <= x, y <= 10^4'],
    ds: {
      answer: 'max-heap of (negated squared distance, x, y) bounded to size k',
      choices: ['max-heap of (negated squared distance, x, y) bounded to size k', 'min-heap of all n points by distance, popped k times from the bottom', 'sort all points by squared distance ascending, slice the first k', 'two pointers over points sorted by x-coordinate'],
    },
    method: {
      answer: 'Bounded max-heap via negation: push ==(-squaredDistance, x, y) for every point==, and once the heap exceeds size k, ==pop to evict the current farthest== among the kept points',
      choices: [
        'Bounded max-heap via negation: push ==(-squaredDistance, x, y) for every point==, and once the heap exceeds size k, ==pop to evict the current farthest== among the kept points',
        'Sort every point by its true Euclidean distance (with the square root) ascending, then slice the first k entries',
        'Push every point onto a min-heap keyed by squared distance, then pop (n - k) times from the front, keeping whatever popped last',
        'Partition points by whether x^2 + y^2 is above or below the median squared distance, recursing only into the closer half',
      ],
    },
    code: `class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []

        for x, y in points:
            dist = x * x + y * y
            heapq.heappush(heap, (-dist, x, y))
            if len(heap) > k:
                heapq.heappop(heap)

        return [[x, y] for dist, x, y in heap]`,
    blanks: [5, 6, 10],
    accept: { 5: ['dist = x ** 2 + y ** 2'] },
    time: { answer: 'O(n log k)', choices: ['O(n log k)', 'O(n log n)', 'O(n)', 'O(n * k)'], why: 'one push/pop per point against a heap bounded to size k' },
    space: { answer: 'O(k)', choices: ['O(k)', 'O(n)', 'O(1)', 'O(log k)'], why: 'the heap never holds more than k points' },
    sayIt: "Squared distance avoids sqrt. ==Negate it so a max-heap bounded to size k pops the farthest point== whenever it overflows, leaving the k closest. O(n log k).",
    pitfall: 'Comparing squared distances only works because distance is non-negative — never negate before squaring.',
  },
  {
    id: 'thought:lists-heaps:task-scheduler',
    lc: 621,
    title: 'Task Scheduler',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['heap', 'greedy'],
    companies: ['amazon', 'meta', 'bloomberg'],
    statement: `You're given a list of CPU tasks (letters) and a cooldown n: the same task letter must be separated by at least n other time units (idle or other tasks) between occurrences. Each unit of time runs exactly one task or sits idle.

Find the minimum total time units needed to finish all tasks while respecting the cooldown.

The greedy idea: always run whichever available task currently has the most remaining occurrences, since that's the one most likely to force idle time later if delayed.`,
    examples: [
      { input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', explanation: 'A B idle A B idle A B is one valid 8-unit schedule' },
      { input: 'tasks = ["A","A","A","B","B","B"], n = 0', output: '6', explanation: 'no cooldown needed, just run everything back to back' },
    ],
    constraints: ['1 <= tasks.length <= 10^4', 'tasks[i] is an uppercase English letter', '0 <= n <= 100'],
    ds: {
      answer: 'max-heap of remaining counts (negated) + a cooldown deque of (count, readyTime)',
      choices: ['max-heap of remaining counts (negated) + a cooldown deque of (count, readyTime)', 'sorted array of counts, re-sorted after every single tick', 'dict of counts only, with no structure tracking when a task becomes available again', 'queue holding every individual task instance in original input order'],
    },
    method: {
      answer: 'Greedy with a cooldown queue: each tick, ==run the task with the highest remaining count from the heap==, and if it still has remaining occurrences, ==park it in a cooldown queue until time + n==, then release ready tasks back onto the heap',
      choices: [
        'Greedy with a cooldown queue: each tick, ==run the task with the highest remaining count from the heap==, and if it still has remaining occurrences, ==park it in a cooldown queue until time + n==, then release ready tasks back onto the heap',
        'Compute total = len(tasks) + idle slots using only the max count formula, without ever simulating the heap tick by tick',
        'Run tasks in strict input order, inserting an idle slot reactively only once a repeat is detected too close to its last run',
        'Greedily always run the task with the fewest remaining occurrences first, saving the most frequent task for last',
      ],
    },
    code: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        counts = Counter(tasks)
        heap = [-c for c in counts.values()]
        heapq.heapify(heap)

        time = 0
        cooldown = deque()

        while heap or cooldown:
            time += 1
            if heap:
                count = 1 + heapq.heappop(heap)
                if count:
                    cooldown.append((count, time + n))

            if cooldown and cooldown[0][1] == time:
                heapq.heappush(heap, cooldown.popleft()[0])

        return time`,
    blanks: [12, 14, 17],
    accept: { 12: ['count = heapq.heappop(heap) + 1'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n * 26)'], why: 'the heap holds at most 26 letters, so each of the n ticks does O(log 26) = O(1) heap work' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(26)', 'O(n log n)'], why: 'counts, heap, and cooldown queue are all bounded by the 26-letter alphabet' },
    sayIt: "Max-heap of counts (negated), ==run the most frequent remaining task each tick==, ==park a used-up-but-not-done task in a cooldown queue== until time+n, then release it back. O(n) time.",
    pitfall: 'Still incrementing `time` even on ticks where the heap is briefly empty but the cooldown queue is not — the CPU can idle.',
  },
  {
    id: 'thought:lists-heaps:design-twitter',
    lc: 355,
    title: 'Design Twitter',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['heap'],
    companies: ['amazon', 'meta'],
    statement: `Design a simplified Twitter: postTweet(userId, tweetId) posts a new tweet, follow/unfollow(followerId, followeeId) manage the follow graph, and getNewsFeed(userId) returns the 10 most recent tweet ids from people the user follows plus the user's own tweets, most recent first.

Users can't follow themselves, and tweet ids should be considered most recent to least recent as posted.

Since only the 10 most recent tweets are ever needed, you don't need to sort every followee's entire tweet history, just their most recent handful.`,
    examples: [
      { input: 'postTweet(1,5), getNewsFeed(1), follow(1,2), postTweet(2,6), getNewsFeed(1), unfollow(1,2), getNewsFeed(1)', output: 'null, [5], null, null, [6,5], null, [5]' },
    ],
    constraints: ['1 <= userId, followerId, followeeId <= 500', '0 <= tweetId <= 10^4', 'all tweetId values are unique', 'at most 3*10^4 calls total'],
    ds: {
      answer: 'dict of userId -> list of (timestamp, tweetId) + dict of userId -> set of followees, merged via a bounded heap',
      choices: ['dict of userId -> list of (timestamp, tweetId) + dict of userId -> set of followees, merged via a bounded heap', 'single global list of all tweets ever posted, filtered by follow-set on every getNewsFeed call', 'dict of userId -> sorted list of tweetId only, with no timestamp tracked at all', 'graph adjacency list of follows, with tweets stored directly as node attributes mutated in place'],
    },
    method: {
      answer: 'Per-user tweet logs + heap merge: each tweet is stored with a ==global increasing timestamp so recency can be compared across users==, and getNewsFeed does a ==bounded k-way merge (size 10) over the last 10 tweets of every followee plus self==',
      choices: [
        'Per-user tweet logs + heap merge: each tweet is stored with a ==global increasing timestamp so recency can be compared across users==, and getNewsFeed does a ==bounded k-way merge (size 10) over the last 10 tweets of every followee plus self==',
        'Store tweets with no timestamp; getNewsFeed assumes each user\'s tweetId list is already naturally sorted by recency since tweetId values are unique',
        'Rebuild and fully sort one combined list of every followee\'s entire tweet history on every single getNewsFeed call',
        'Keep only the single most recent tweet per user and concatenate those across all followees, ignoring each user\'s earlier tweets entirely',
      ],
    },
    code: `class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId: int) -> List[int]:
        heap = []
        feedUsers = self.following[userId] | {userId}

        for user in feedUsers:
            for ts, tweetId in self.tweets[user][-10:]:
                heapq.heappush(heap, (ts, tweetId))
                if len(heap) > 10:
                    heapq.heappop(heap)

        return [tweetId for ts, tweetId in sorted(heap, reverse=True)]

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`,
    blanks: [7, 16, 20],
    time: { answer: 'O(F) per getNewsFeed', choices: ['O(F) per getNewsFeed', 'O(F log F) per getNewsFeed', 'O(1) per getNewsFeed', 'O(total tweets ever posted)'], why: 'F = number of followees, each contributing up to 10 tweets into a heap capped at size 10' },
    space: { answer: 'O(total tweets + total follows)', choices: ['O(total tweets + total follows)', 'O(1)', 'O(F)', 'O(10)'], why: 'every posted tweet and every follow edge is stored somewhere' },
    sayIt: "Each tweet gets a ==global timestamp for cross-user ordering==. getNewsFeed does a ==10-bounded heap merge over each followee's last 10 tweets plus my own==. O(F) per feed call.",
    pitfall: 'Only scanning each followee\'s last 10 tweets (tweets[user][-10:]) — older tweets can never make the top 10 anyway.',
  },
  {
    id: 'thought:lists-heaps:find-median-data-stream',
    lc: 295,
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    category: 'lists-heaps',
    skills: ['heap'],
    companies: ['amazon', 'google', 'apple', 'bloomberg'],
    statement: `Design a structure that supports adding integers one at a time (addNum) and, at any point, returning the median of all numbers seen so far (findMedian).

If the count so far is odd, the median is the single middle value; if even, it's the average of the two middle values.

Both operations need to be efficient, which rules out re-sorting everything from scratch on every findMedian call.`,
    examples: [
      { input: 'addNum(1), addNum(2), findMedian(), addNum(3), findMedian()', output: 'null, null, 1.5, null, 2.0' },
    ],
    constraints: ['-10^5 <= num <= 10^5', 'at most 5*10^4 calls total to addNum and findMedian'],
    ds: {
      answer: 'two heaps: max-heap for the smaller half, min-heap for the larger half',
      choices: ['two heaps: max-heap for the smaller half, min-heap for the larger half', 'single sorted list, re-sorted (or bisect.insort) on every addNum', 'single max-heap holding every number seen so far', 'balanced BST, walked in-order to the middle on every findMedian'],
    },
    method: {
      answer: "Two-heap balance: push every new number into ==the max-heap of smaller values, then always push its max back over into the min-heap of larger values==, finally ==rebalance by moving one element back== if the min-heap ever grows larger than the max-heap",
      choices: [
        "Two-heap balance: push every new number into ==the max-heap of smaller values, then always push its max back over into the min-heap of larger values==, finally ==rebalance by moving one element back== if the min-heap ever grows larger than the max-heap",
        'Push every new number into whichever of the two heaps currently has fewer elements, with no cross-heap comparison of values at all',
        'Maintain one sorted Python list and binary-search (bisect.insort) the correct insertion index for every new number',
        'Keep a running sum and count only, approximating the median as the mean of all numbers seen so far',
      ],
    },
    code: `class MedianFinder:
    def __init__(self):
        self.small = []
        self.large = []

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))

        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return -self.small[0]

        return (-self.small[0] + self.large[0]) / 2`,
    blanks: [7, 10, 16],
    time: { answer: 'O(log n) addNum, O(1) findMedian', choices: ['O(log n) addNum, O(1) findMedian', 'O(1) addNum, O(log n) findMedian', 'O(n) addNum, O(1) findMedian', 'O(log n) addNum, O(log n) findMedian'], why: 'each addNum does a couple of O(log n) heap ops; findMedian just peeks at both heap tops' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(sqrt(n))'], why: 'every number ever added lives in one of the two heaps' },
    sayIt: "Max-heap `small` (negated) for the lower half, min-heap `large` for the upper half. ==Push into small, shuffle its max into large, then rebalance if large overgrows==. O(log n) add, O(1) median.",
    pitfall: 'Always routing the new number through `small` first (even if it belongs in `large`) is what keeps the invariant simple — never push directly into `large`.',
  },
  {
    id: 'thought:lists-heaps:merge-intervals',
    lc: 56,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['intervals'],
    companies: ['google', 'amazon', 'meta', 'microsoft'],
    statement: `Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the input ranges.

Two intervals overlap if one starts at or before the other one ends (touching endpoints like [1,4] and [4,5] count as overlapping and should merge).

Sorting by start first turns this into a single linear pass where you only ever need to compare against the most recently merged interval.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'touching at 4 still counts as overlapping' },
    ],
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= start <= end <= 10^4'],
    ds: {
      answer: 'sort by start, then a result list holding only the last merged interval',
      choices: ['sort by start, then a result list holding only the last merged interval', 'sort by end, then a stack of intervals popped on overlap', 'min-heap of (start, end) pairs, popped one at a time with no merging logic', 'dict mapping every covered integer point to true, then scan for maximal runs'],
    },
    method: {
      answer: "Sort then sweep: ==sort intervals by start==, then for each one compare its start against the last merged interval's end — if it overlaps, ==extend that merged interval's end to the max of the two==, otherwise start a new merged interval",
      choices: [
        "Sort then sweep: ==sort intervals by start==, then for each one compare its start against the last merged interval's end — if it overlaps, ==extend that merged interval's end to the max of the two==, otherwise start a new merged interval",
        'Sort intervals by end only, then merge any interval whose start is less than the very first interval\'s end',
        'Compare every pair of intervals with a nested loop, merging any pair that overlaps, repeating until no pair overlaps',
        'Sort intervals by start, but extend the last merged end unconditionally to the new interval\'s end even when they do not overlap',
      ],
    },
    code: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda pair: pair[0])
        merged = [intervals[0]]

        for start, end in intervals[1:]:
            lastEnd = merged[-1][1]
            if start <= lastEnd:
                merged[-1][1] = max(lastEnd, end)
            else:
                merged.append([start, end])

        return merged`,
    blanks: [2, 8, 10],
    accept: { 2: ['intervals.sort(key=lambda interval: interval[0])'], 8: ['merged[-1][1] = max(end, lastEnd)'] },
    time: { answer: 'O(n log n)', choices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(n log n) time, O(log n) extra'], why: 'dominated by the initial sort; the sweep itself is a single O(n) pass' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the merged result can hold up to n intervals in the worst case (none overlap)' },
    sayIt: "==Sort by start==, then sweep once: if the next interval's start is within the last merged end, ==stretch that end to the max==, else append a fresh interval. O(n log n) total.",
    pitfall: '`start <= lastEnd`, not `<` — touching endpoints like [1,4],[4,5] must still merge.',
  },
  {
    id: 'thought:lists-heaps:insert-interval',
    lc: 57,
    title: 'Insert Interval',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['intervals'],
    companies: ['google', 'amazon', 'microsoft'],
    statement: `You're given a list of non-overlapping intervals already sorted by start time, plus one new interval to insert. Insert it into the list, merging with any existing intervals it overlaps, and return the resulting sorted, non-overlapping list.

Unlike Merge Intervals, you don't need to sort anything here — the input is already sorted, so you can do this in a single linear pass.

Split the work into three phases: intervals entirely before the new one (copy as-is), intervals that overlap the new one (fold into it), and intervals entirely after (copy as-is).`,
    examples: [
      { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' },
      { input: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', output: '[[1,2],[3,10],[12,16]]' },
    ],
    constraints: ['0 <= intervals.length <= 10^4', 'intervals is sorted by start and non-overlapping', 'newInterval.length == 2'],
    ds: {
      answer: 'single pointer sweep over the sorted array, no sorting needed',
      choices: ['single pointer sweep over the sorted array, no sorting needed', 're-sort intervals + newInterval together, then run the general merge-intervals routine', 'binary search for the insertion index, then shift every later element over by one', 'min-heap of all intervals plus the new one, popped in sorted order'],
    },
    method: {
      answer: 'Three-phase linear sweep: ==copy every interval that ends before newInterval starts==, then ==absorb every interval that overlaps by expanding newInterval\'s bounds==, then copy whatever is left untouched',
      choices: [
        'Three-phase linear sweep: ==copy every interval that ends before newInterval starts==, then ==absorb every interval that overlaps by expanding newInterval\'s bounds==, then copy whatever is left untouched',
        'Insert newInterval directly into the array at its sorted position, then run the full O(n log n) merge-intervals sort-and-sweep on the combined list',
        'Binary search for where newInterval.start belongs, insert it there, then only check the immediately adjacent interval on one side for overlap',
        'Append newInterval to the end of the list and merge it with intervals walking backward from the end only',
      ],
    },
    code: `class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        result = []
        i, n = 0, len(intervals)

        while i < n and intervals[i][1] < newInterval[0]:
            result.append(intervals[i])
            i += 1

        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1

        result.append(newInterval)
        result.extend(intervals[i:])

        return result`,
    blanks: [10, 11, 14],
    accept: { 10: ['newInterval[0] = min(intervals[i][0], newInterval[0])'], 11: ['newInterval[1] = max(intervals[i][1], newInterval[1])'] },
    time: { answer: 'O(n)', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], why: 'a single pointer sweeps through the array once, no sorting' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'the result list holds up to n+1 intervals' },
    sayIt: "No sort needed, input's already sorted. ==Copy intervals ending before newInterval starts==, then ==grow newInterval over every interval it overlaps==, then copy the rest. O(n) single pass.",
    pitfall: 'The overlap condition is `intervals[i][0] <= newInterval[1]`, using the growing newInterval bound, not the original.',
  },
  {
    id: 'thought:lists-heaps:non-overlapping-intervals',
    lc: 435,
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['intervals', 'greedy'],
    companies: ['amazon', 'google'],
    statement: `Given an array of intervals, find the minimum number of intervals you'd need to remove so that the rest of the intervals don't overlap each other.

Intervals that only touch at an endpoint (like [1,2] and [2,3]) do not count as overlapping.

Sort by end time, not start time: greedily keep whichever interval ends earliest among any overlapping group, since it leaves the most room for everything that comes after.`,
    examples: [
      { input: 'intervals = [[1,2],[2,3],[3,4],[1,3]]', output: '1', explanation: 'removing [1,3] leaves [1,2],[2,3],[3,4] fully non-overlapping' },
      { input: 'intervals = [[1,2],[1,2],[1,2]]', output: '2', explanation: 'keep just one of the three identical intervals' },
    ],
    constraints: ['1 <= intervals.length <= 10^5', '-5*10^4 <= start < end <= 5*10^4'],
    ds: {
      answer: 'sort by end time, track only the current interval\'s end',
      choices: ['sort by end time, track only the current interval\'s end', 'sort by start time, track only the current interval\'s start', 'min-heap of (end, start) pairs, popped one at a time with a visited set', 'dict mapping each interval to the count of others it overlaps'],
    },
    method: {
      answer: "Greedy earliest-end-first: ==sort by end time==, then for each interval, if its start is before the last kept interval's end it overlaps and must be removed, ==otherwise keep it and update the tracked end==",
      choices: [
        "Greedy earliest-end-first: ==sort by end time==, then for each interval, if its start is before the last kept interval's end it overlaps and must be removed, ==otherwise keep it and update the tracked end==",
        'Sort by start time, then greedily remove whichever interval in an overlapping cluster has the latest start instead of the latest end',
        'Count, for every interval, how many other intervals it overlaps, then repeatedly remove whichever single interval has the highest overlap count',
        'Sort by interval length (end minus start) ascending, keeping the shortest intervals first regardless of their end time',
      ],
    },
    code: `class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda pair: pair[1])
        removed = 0
        prevEnd = float('-inf')

        for start, end in intervals:
            if start >= prevEnd:
                prevEnd = end
            else:
                removed += 1

        return removed`,
    blanks: [2, 7, 10],
    accept: { 2: ['intervals.sort(key=lambda interval: interval[1])'] },
    time: { answer: 'O(n log n)', choices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(n log n) time, O(n) extra sort space'], why: 'dominated by sorting; the greedy scan afterward is a single O(n) pass' },
    space: { answer: 'O(1)', choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], why: 'only a running count and a tracked end value, beyond the sort itself' },
    sayIt: "==Sort by end time==, greedily keep an interval if its start doesn't overlap the last kept end, ==else count it as removed==. Earliest-end-first is what maximizes survivors. O(n log n).",
    pitfall: 'Sorting by end, not start — sorting by start can keep a long interval that blocks many short ones later.',
  },
  {
    id: 'thought:lists-heaps:meeting-rooms-ii',
    lc: 253,
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    category: 'lists-heaps',
    skills: ['intervals'],
    companies: ['google', 'amazon', 'microsoft', 'meta'],
    statement: `Given an array of meeting time intervals, find the minimum number of conference rooms required so that every meeting can be scheduled without two meetings using the same room at the same time.

A meeting ending exactly when another starts does not require a second room; they can share one.

Separating all the start times and all the end times into two sorted lists lets you sweep through both in lockstep and track how many rooms are simultaneously in use.`,
    examples: [
      { input: 'intervals = [[0,30],[5,10],[15,20]]', output: '2', explanation: 'the [5,10] and [15,20] meetings both need a room while [0,30] is still running, but never both at once' },
      { input: 'intervals = [[7,10],[2,4]]', output: '1', explanation: "[2,4] ends before [7,10] starts, so one room suffices" },
    ],
    constraints: ['1 <= intervals.length <= 10^4', '0 <= start < end <= 10^6'],
    ds: {
      answer: 'two separately sorted arrays: all start times, all end times',
      choices: ['two separately sorted arrays: all start times, all end times', 'min-heap of currently active meetings\' end times', 'single array of (time, +1 or -1) events, sorted by time', 'dict mapping each room number to its currently assigned meeting'],
    },
    method: {
      answer: "Two-pointer sweep: walk ==sorted starts== against ==sorted ends== in lockstep; each start that arrives ==before the earliest still-active end== needs a brand new room, otherwise it reuses the room that just freed up",
      choices: [
        "Two-pointer sweep: walk ==sorted starts== against ==sorted ends== in lockstep; each start that arrives ==before the earliest still-active end== needs a brand new room, otherwise it reuses the room that just freed up",
        'Min-heap of active end times: push each meeting\'s end on arrival, and only pop when the heap size exceeds a fixed room budget',
        'For every pair of meetings, check if they overlap with a nested loop, and count the maximum clique size of overlapping pairs',
        'Sort only by start time, then assign rooms in that order to the first room whose previous meeting also happens to come right before it in the sorted list'
      ],
    },
    code: `class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        starts = sorted(start for start, end in intervals)
        ends = sorted(end for start, end in intervals)

        rooms = 0
        endPtr = 0

        for start in starts:
            if start < ends[endPtr]:
                rooms += 1
            else:
                endPtr += 1

        return rooms`,
    blanks: [2, 9, 12],
    time: { answer: 'O(n log n)', choices: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(n log n) time, O(1) extra space'], why: 'dominated by sorting the two n-length arrays of starts and ends' },
    space: { answer: 'O(n)', choices: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], why: 'two new arrays of size n for the sorted starts and ends' },
    sayIt: "Split into ==sorted starts== and ==sorted ends==, sweep both: a start before the ==earliest active end== needs a new room, otherwise that freed room is reused. O(n log n).",
    pitfall: 'Using strict `<` for the overlap check — a meeting ending exactly at another\'s start can share the same room.',
  },
  {
    id: 'thought:lists-heaps:min-interval-include-query',
    lc: 1851,
    title: 'Minimum Interval to Include Each Query',
    difficulty: 'Hard',
    category: 'lists-heaps',
    skills: ['intervals', 'heap'],
    companies: ['google', 'amazon'],
    statement: `You're given a list of intervals and a list of queries. For each query, find the size of the smallest interval that contains that query value (start <= query <= end), or -1 if no interval contains it.

Both intervals and queries can be large in number, so checking every interval against every query would be too slow.

Process queries in sorted order: as the query value grows, activate every interval whose start has been reached, keep active intervals in a heap keyed by size, and discard ones that have already ended before the current query.`,
    examples: [
      { input: 'intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]', output: '[3,3,1,4]', explanation: 'for query 4, [4,4] has size 1 and contains it, the smallest such interval' },
      { input: 'intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]', output: '[2,-1,4,6]' },
    ],
    constraints: ['1 <= intervals.length, queries.length <= 10^5', 'intervals[i].length == 2', '1 <= start <= end <= 10^7', '1 <= queries[j] <= 10^7'],
    ds: {
      answer: 'min-heap of (size, end) for active intervals, intervals and queries both sorted',
      choices: ['min-heap of (size, end) for active intervals, intervals and queries both sorted', 'segment tree over the full value range, point query at each queries[j]', 'brute-force scan of all intervals for every query, no sorting or heap', 'dict mapping every covered integer in every interval to its minimum size'],
    },
    method: {
      answer: "Sweep queries in sorted order: ==activate every interval whose start has been reached, pushing (size, end) onto a heap==, then ==discard heap entries whose end is already behind the current query==, and the heap top is the answer",
      choices: [
        "Sweep queries in sorted order: ==activate every interval whose start has been reached, pushing (size, end) onto a heap==, then ==discard heap entries whose end is already behind the current query==, and the heap top is the answer",
        'Sort intervals by size ascending and, for each query independently, linearly scan from smallest interval upward until one contains it',
        'Build a heap of all intervals up front keyed by start time only, popping once per query regardless of whether that interval still contains it',
        'For each query, binary search the sorted intervals array for an exact start match, ignoring queries that fall strictly between two interval starts',
      ],
    },
    code: `class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        intervals.sort()
        result = {}
        heap = []
        i, n = 0, len(intervals)

        for q in sorted(queries):
            while i < n and intervals[i][0] <= q:
                start, end = intervals[i]
                heapq.heappush(heap, (end - start + 1, end))
                i += 1

            while heap and heap[0][1] < q:
                heapq.heappop(heap)

            result[q] = heap[0][0] if heap else -1

        return [result[q] for q in queries]`,
    blanks: [10, 14, 16],
    time: { answer: 'O((n + q) log n)', choices: ['O((n + q) log n)', 'O(n * q)', 'O(n + q)', 'O(n log n + q)'], why: 'sorting both arrays plus each interval/query pushed and popped from the heap at most once' },
    space: { answer: 'O(n + q)', choices: ['O(n + q)', 'O(1)', 'O(n)', 'O(n * q)'], why: 'the heap can hold up to n intervals, and result stores one entry per distinct query' },
    sayIt: "Sort queries, sweep forward: ==push every interval whose start we've reached as (size, end)==, ==pop stale entries whose end is behind the query==, heap top is the smallest covering interval. O((n+q) log n).",
    pitfall: 'Mapping answers back to the original query order via `result` since queries were processed sorted, not in input order.',
  },
]

export default {
  id: 'lists-heaps',
  title: 'Linked lists, heaps & intervals',
  icon: 'link',
  items,
}
