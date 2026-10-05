const statements = [
  {
    id: 'statements-b:lc146',
    lc: 146,
    title: 'LRU Cache',
    difficulty: 'Medium',
    statement: `You're building the in-memory cache layer for a search ranking service. The cache can only hold a fixed number of entries at once, and when it's full, something has to go to make room for new data.

Design a data structure that implements a Least Recently Used (LRU) cache. It is initialized with a positive size capacity.

Implement get(key) that returns the value of the key if it exists in the cache, otherwise returns -1. Implement put(key, value) that updates the value of the key if it exists, or inserts the key-value pair if it does not. If inserting a new pair would exceed capacity, evict the least recently used key first. Both get and put count as a use of the key, which should count as the most recently used going forward.

Both functions must run in O(1) average time complexity.`,
    examples: [
      {
        input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]',
        output: '[null,null,null,1,null,-1,null,-1,3,4]',
        explanation: 'capacity 2: putting a third key evicts whichever of the first two was used least recently',
      },
    ],
    constraints: [
      '1 ≤ capacity ≤ 3000',
      '0 ≤ key, value ≤ 10^4',
      'at most 2·10^5 calls total to get and put',
      'both get and put must run in O(1) average time complexity',
    ],
    signature: {
      kind: 'class',
      className: 'LRUCache',
      methods: [
        { name: '__init__', params: [['capacity', 'int']], returns: 'None' },
        { name: 'get', params: [['key', 'int']], returns: 'int' },
        { name: 'put', params: [['key', 'int'], ['value', 'int']], returns: 'None' },
      ],
    },
    signals: [
      { phrase: 'Least Recently Used (LRU) cache', means: 'need eviction order plus O(1) lookup' },
      { phrase: 'evict the least recently used key', means: 'track recency on every access, not just insert' },
      { phrase: 'O(1) average time complexity', means: 'hashmap alone is not enough, order also needs O(1)' },
      { phrase: 'fixed number of entries', means: 'capacity bound forces an eviction policy' },
    ],
    keyInfo: {
      input: 'capacity int, then a stream of get/put calls',
      output: 'value for get calls (or -1), None for put',
      target: 'O(1) per operation since up to 2·10^5 calls forces it',
    },
    pattern: 'Hashmap + doubly linked list (or OrderedDict) for O(1) recency',
    ds: ['hashmap', 'linked-list'],
    time: 'O(1) per operation',
    space: 'O(capacity)',
    edgeCases: [
      'put on an existing key updates value and still refreshes recency',
      'capacity of 1 evicts on every new key',
      'get on a missing key returns -1 without affecting order',
      'put that overwrites the most recently used key should not evict anything',
    ],
    skills: ['ds-diagnosis', 'linked-list', 'communication'],
  },
  {
    id: 'statements-b:lc295',
    lc: 295,
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    statement: `You're streaming click-latency numbers off a production service one at a time, and a dashboard needs the running median updated after every single reading, not just at the end of the day.

Implement the MedianFinder class. The constructor initializes the data structure with no elements. addNum(num) adds an integer from the data stream to the structure. findMedian() returns the median of all elements seen so far.

If the number of elements is even, the median is the average of the two middle values once sorted; if odd, it is the single middle value. Both methods will be interleaved in any order and called frequently, so recomputing a full sort on every findMedian call would be too slow for a live dashboard.`,
    examples: [
      {
        input: '["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\n[[],[1],[2],[],[3],[]]',
        output: '[null,null,null,1.5,null,2.0]',
      },
    ],
    constraints: [
      '-10^5 ≤ num ≤ 10^5',
      'at most 5·10^4 calls total to addNum and findMedian',
      'findMedian will only be called after at least one call to addNum',
    ],
    signature: {
      kind: 'class',
      className: 'MedianFinder',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'addNum', params: [['num', 'int']], returns: 'None' },
        { name: 'findMedian', params: [], returns: 'float' },
      ],
    },
    signals: [
      { phrase: 'running median updated after every single reading', means: 'median needed after every insert, not batched' },
      { phrase: 'recomputing a full sort on every findMedian call would be too slow', means: 'avoid O(n log n) per query' },
      { phrase: 'average of the two middle values', means: 'handle even vs odd count split' },
      { phrase: 'interleaved in any order', means: 'support insert and query repeatedly, no fixed phase' },
    ],
    keyInfo: {
      input: 'stream of addNum(int) and findMedian() calls',
      output: 'float median after each findMedian',
      target: 'O(log n) insert / O(1) query, since re-sorting each time would not scale to 5·10^4 calls',
    },
    pattern: 'Two heaps: max-heap for the lower half, min-heap for the upper half',
    ds: ['heap'],
    time: 'O(log n) addNum, O(1) findMedian',
    space: 'O(n)',
    edgeCases: [
      'single element has median equal to itself',
      'two equal elements average to the same value',
      'heaps drift unbalanced if you forget to rebalance after every add',
      'negative and positive numbers mixed',
    ],
    skills: ['heap', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc155',
    lc: 155,
    title: 'Min Stack',
    difficulty: 'Medium',
    statement: `A calculator widget needs an undo-friendly stack of entered values, and one of its buttons shows the smallest value currently on the stack without disturbing anything.

Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

Implement the MinStack class: push(val) pushes the element val onto the stack. pop() removes the element on top of the stack. top() gets the top element of the stack. getMin() retrieves the minimum element in the stack.

You must implement a solution with O(1) time complexity for each function.`,
    examples: [
      {
        input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]',
        output: '[null,null,null,null,-3,null,0,-2]',
      },
    ],
    constraints: [
      '-2^31 ≤ val ≤ 2^31 - 1',
      'pop, top and getMin operations will always be called on a non-empty stack',
      'at most 3·10^4 calls will be made to push, pop, top, and getMin',
    ],
    signature: {
      kind: 'class',
      className: 'MinStack',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'push', params: [['val', 'int']], returns: 'None' },
        { name: 'pop', params: [], returns: 'None' },
        { name: 'top', params: [], returns: 'int' },
        { name: 'getMin', params: [], returns: 'int' },
      ],
    },
    signals: [
      { phrase: 'retrieving the minimum element in constant time', means: 'getMin must be O(1), not a scan' },
      { phrase: 'without disturbing anything', means: 'getMin must not mutate or reorder the stack' },
      { phrase: 'always be called on a non-empty stack', means: 'no need to guard pop/top/getMin for empty' },
      { phrase: 'O(1) time complexity for each function', means: 'track a running min per entry, not a global rescan' },
    ],
    keyInfo: {
      input: 'sequence of push/pop/top/getMin calls',
      output: 'None for push/pop, int for top/getMin',
      target: 'O(1) per call, since a single running-min variable breaks on pop',
    },
    pattern: 'Stack of (value, min-so-far) pairs',
    ds: ['stack'],
    time: 'O(1) per operation',
    space: 'O(n)',
    edgeCases: [
      'pushing a new global minimum updates the tracked min',
      'popping the current minimum must restore the previous one',
      'duplicate values equal to the current minimum',
      'stack of a single element',
    ],
    skills: ['stack', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc981',
    lc: 981,
    title: 'Time Based Key-Value Store',
    difficulty: 'Medium',
    statement: `You're adding versioning to a config service: every time a value is written for a key, it should be tagged with the timestamp it was written at, and readers should be able to ask what this key was set to at or before a given time.

Design a time-based key-value store that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the TimeMap class: TimeMap() initializes the object. set(key, value, timestamp) stores the key with the value at the given timestamp. get(key, timestamp) returns a value such that set was called previously, with the largest timestamp less than or equal to the given timestamp. If there are no values, it returns an empty string.

Timestamps for set calls on the same key are guaranteed to be strictly increasing.`,
    examples: [
      {
        input: '["TimeMap","set","get","get","set","get","get"]\n[[],["foo","bar",1],["foo",1],["foo",3],["foo","bar2",4],["foo",4],["foo",5]]',
        output: '[null,null,"bar","bar",null,"bar2","bar2"]',
      },
    ],
    constraints: [
      '1 ≤ key.length, value.length ≤ 100',
      'key and value consist of lowercase English letters and digits',
      '1 ≤ timestamp ≤ 10^7',
      'all the timestamps set are strictly increasing',
      'at most 2·10^5 calls total to set and get',
    ],
    signature: {
      kind: 'class',
      className: 'TimeMap',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'set', params: [['key', 'str'], ['value', 'str'], ['timestamp', 'int']], returns: 'None' },
        { name: 'get', params: [['key', 'str'], ['timestamp', 'int']], returns: 'str' },
      ],
    },
    signals: [
      { phrase: 'largest timestamp less than or equal to the given timestamp', means: 'need a lower-bound search, not an exact match' },
      { phrase: 'strictly increasing', means: 'timestamps per key are already sorted, enables binary search' },
      { phrase: 'If there are no values, it returns an empty string', means: 'handle a timestamp before the first set for that key' },
      { phrase: 'multiple values for the same key at different time stamps', means: 'store a list per key, not a single value' },
    ],
    keyInfo: {
      input: 'key/value/timestamp triples for set, key/timestamp pairs for get',
      output: 'string value, or empty string',
      target: 'O(log n) get, since a linear scan over up to 2·10^5 calls would be too slow',
    },
    pattern: 'Hashmap of key to a sorted (timestamp, value) list + binary search',
    ds: ['hashmap'],
    time: 'O(log n) get, O(1) set',
    space: 'O(n)',
    edgeCases: [
      'get called before any set for that key',
      'get with a timestamp exactly equal to a stored timestamp',
      'get with a timestamp larger than every stored timestamp',
      'two different keys never interfere with each other',
    ],
    skills: ['arrays-hashing', 'binary-search', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc359',
    lc: 359,
    title: 'Logger Rate Limiter',
    difficulty: 'Easy',
    statement: `You're writing the logging guard for a backend service that gets noisy under load: the same error message can fire thousands of times a second, and you only want to print it to the console once every 10 seconds at most.

Design a logger system that receives a stream of messages along with their timestamps. Each unique message should only be printed at most every 10 seconds, meaning a duplicate message printed in the last 10 seconds will be ignored.

Implement the Logger class: Logger() initializes the logger object. shouldPrintMessage(timestamp, message) returns true if the message should be printed, false otherwise. If this method returns false, the message is not printed.

Timestamps are given in seconds, and every timestamp will be passed in non-decreasing order.`,
    examples: [
      {
        input: '["Logger","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage"]\n[[],[1,"foo"],[2,"bar"],[3,"foo"],[8,"bar"],[10,"foo"],[11,"foo"]]',
        output: '[null,true,true,false,false,false,true]',
      },
    ],
    constraints: [
      '0 ≤ timestamp ≤ 10^9',
      '0 ≤ message.length ≤ 10',
      'every timestamp will be passed in non-decreasing order',
      'at most 10^4 calls will be made to shouldPrintMessage',
    ],
    signature: {
      kind: 'class',
      className: 'Logger',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'shouldPrintMessage', params: [['timestamp', 'int'], ['message', 'str']], returns: 'bool' },
      ],
    },
    signals: [
      { phrase: 'only be printed at most every 10 seconds', means: 'track last-printed time per message against a 10-second window' },
      { phrase: 'duplicate message printed in the last 10 seconds will be ignored', means: 'only exact repeats inside the window get blocked' },
      { phrase: 'non-decreasing order', means: 'no need to handle timestamps arriving out of order' },
      { phrase: 'receives a stream of messages along with their timestamps', means: 'state must be tracked per message, not globally' },
    ],
    keyInfo: {
      input: 'timestamp and message string per call',
      output: 'bool, whether to print',
      target: 'O(1) per call, a hashmap keyed by message text is enough since timestamps only move forward',
    },
    pattern: 'Hashmap of message to last-printed timestamp',
    ds: ['hashmap'],
    time: 'O(1) per call',
    space: 'O(distinct messages)',
    edgeCases: [
      'same message exactly 10 seconds later should print',
      'two different messages at the same timestamp both print',
      'a message seen for the first time always prints',
      'message repeated one second inside the window is blocked',
    ],
    skills: ['arrays-hashing', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc703',
    lc: 703,
    title: 'Kth Largest Element in a Stream',
    difficulty: 'Easy',
    statement: `A leaderboard service keeps receiving new scores one at a time and, after every new score comes in, needs to answer: what is the k-th largest score seen so far, counting duplicates separately?

Design a class to find the k-th largest element in a stream. Note that it is the k-th largest element in the sorted order, not the k-th distinct element.

Implement KthLargest: KthLargest(k, nums) initializes the object with the integer k and the stream of integers nums. add(val) appends val to the stream and returns the element representing the k-th largest element in the stream.

You are guaranteed there will be at least k elements in the array when you search for the k-th element.`,
    examples: [
      {
        input: '["KthLargest","add","add","add","add","add"]\n[[3,[4,5,8,2]],[3],[5],[10],[9],[4]]',
        output: '[null,4,5,5,8,8]',
      },
    ],
    constraints: [
      '1 ≤ k ≤ 10^4',
      '0 ≤ nums.length ≤ 10^4',
      '-10^4 ≤ nums[i], val ≤ 10^4',
      'at most 10^4 calls will be made to add',
      'there will always be at least k elements in the array when you search for the k-th element',
    ],
    signature: {
      kind: 'class',
      className: 'KthLargest',
      methods: [
        { name: '__init__', params: [['k', 'int'], ['nums', 'List[int]']], returns: 'None' },
        { name: 'add', params: [['val', 'int']], returns: 'int' },
      ],
    },
    signals: [
      { phrase: 'k-th largest element in the sorted order, not the k-th distinct element', means: 'duplicates count separately, no dedup' },
      { phrase: 'after every new score comes in', means: 'answer must update after each single add' },
      { phrase: 'at least k elements in the array when you search for the k-th element', means: 'no need to handle fewer than k elements' },
      { phrase: 'appends val to the stream and returns the element representing the k-th largest element in the stream', means: 'every add call must return the updated answer immediately' },
    ],
    keyInfo: {
      input: 'k, initial nums array, then a stream of add(val) calls',
      output: 'int, the current k-th largest after each add',
      target: 'O(log k) per add, since re-sorting the whole stream each time would not scale',
    },
    pattern: 'Min-heap of size k, the top of the heap is the answer',
    ds: ['heap'],
    time: 'O(log k) per add',
    space: 'O(k)',
    edgeCases: [
      'initial nums array has fewer elements than k',
      'duplicate values among the top k',
      'a new value smaller than everything in the heap',
      'k equals the total number of elements seen so far',
    ],
    skills: ['heap', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc208',
    lc: 208,
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    statement: `You're building the autocomplete backend for a search bar: as a user types, the system needs to instantly tell whether what they've typed so far is a prefix of some known word, or a complete known word itself.

A trie (pronounced as "try") is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class.

Trie() initializes the trie object. insert(word) inserts the string word into the trie. search(word) returns true if the string word is in the trie (was inserted before), and false otherwise. startsWith(prefix) returns true if there is a previously inserted string word that has the prefix prefix, and false otherwise.`,
    examples: [
      {
        input: '["Trie","insert","search","search","startsWith","insert","search"]\n[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]',
        output: '[null,null,true,false,true,null,true]',
      },
    ],
    constraints: [
      '1 ≤ word.length, prefix.length ≤ 2000',
      'word and prefix consist only of lowercase English letters',
      'at most 3·10^4 calls in total will be made to insert, search, and startsWith',
    ],
    signature: {
      kind: 'class',
      className: 'Trie',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'insert', params: [['word', 'str']], returns: 'None' },
        { name: 'search', params: [['word', 'str']], returns: 'bool' },
        { name: 'startsWith', params: [['prefix', 'str']], returns: 'bool' },
      ],
    },
    signals: [
      { phrase: 'returns true if the string word is in the trie', means: 'search needs a full-word match, not just a path' },
      { phrase: 'has the prefix prefix', means: 'startsWith only needs the path to exist, no end-of-word flag' },
      { phrase: 'store and retrieve keys in a dataset of strings', means: 'shared prefixes should share nodes, not duplicate storage' },
      { phrase: "instantly tell whether what they've typed so far is a prefix", means: 'prefix queries must be fast, not just exact word lookup' },
    ],
    keyInfo: {
      input: 'stream of insert/search/startsWith calls on words',
      output: 'None for insert, bool for search/startsWith',
      target: 'O(m) per call regardless of word count stored, since 3·10^4 calls rules out scanning every word',
    },
    pattern: 'Nested dict per node, with an end-of-word flag',
    ds: ['trie'],
    time: 'O(m) per call, m = word or prefix length',
    space: 'O(total characters inserted)',
    edgeCases: [
      'search for a prefix that was never inserted as a full word',
      'insert the same word twice',
      'empty-length edge of startsWith against a single-character word',
      'one word that is a prefix of another longer word',
    ],
    skills: ['trie', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc211',
    lc: 211,
    title: 'Design Add and Search Words Data Structure',
    difficulty: 'Medium',
    statement: `Same autocomplete system, but now the product wants a fuzzy search box: the user can type a pattern where a dot stands in for any single letter they don't remember, and the system should say whether any stored word matches that pattern.

Design a data structure that supports adding new words and finding if a string matches any previously added string.

Implement the WordDictionary class: WordDictionary() initializes the object. addWord(word) adds word to the data structure, it can be matched later. search(word) returns true if there is any string in the data structure that matches word, where word may contain dots where dots can be matched with any letter.

At most one dot per search call in the real-world usage pattern, but your solution should also handle more than one.`,
    examples: [
      {
        input: '["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]',
        output: '[null,null,null,null,false,true,true,true]',
      },
    ],
    constraints: [
      '1 ≤ word.length ≤ 25',
      'word in addWord consists of lowercase English letters',
      "word in search consists of lowercase English letters and the dot character '.'",
      'at most 10^4 calls will be made to addWord and search',
    ],
    signature: {
      kind: 'class',
      className: 'WordDictionary',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'addWord', params: [['word', 'str']], returns: 'None' },
        { name: 'search', params: [['word', 'str']], returns: 'bool' },
      ],
    },
    signals: [
      { phrase: 'a dot stands in for any single letter', means: 'the dot wildcard matches exactly one character, needs branching' },
      { phrase: 'matches any previously added string', means: 'exact structural match on length, not a loose substring check' },
      { phrase: 'At most one dot per search call in the real-world usage pattern, but your solution should also handle more than one', means: "don't special-case to exactly one wildcard" },
      { phrase: 'dots can be matched with any letter', means: 'each dot independently can be any of the 26 letters' },
    ],
    keyInfo: {
      input: 'stream of addWord and search calls, search words may contain dots',
      output: 'None for addWord, bool for search',
      target: 'O(26^d · m) worst case where d is the number of dots, since each dot forces trying every branch',
    },
    pattern: 'Trie with DFS branching on dot characters',
    ds: ['trie'],
    time: 'O(m) per search with no dots, up to O(26^m) worst case with many dots',
    space: 'O(total characters added)',
    edgeCases: [
      'search word longer than any stored word',
      'a word that is all dots',
      'search for a word with zero dots that was never added',
      'multiple dots in the same search call',
    ],
    skills: ['trie', 'backtracking', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc380',
    lc: 380,
    title: 'Insert Delete GetRandom O(1)',
    difficulty: 'Medium',
    statement: `You're implementing a lottery pool of unique ticket numbers: numbers can be added, numbers can be removed, and at any moment the system needs to hand back a uniformly random currently-active ticket, fast, no matter how large the pool has grown.

Implement the RandomizedSet class: RandomizedSet() initializes the RandomizedSet object. insert(val) inserts an item val into the set if not present, returning true if the item was not present, false otherwise. remove(val) removes an item val from the set if present, returning true if the item was present, false otherwise. getRandom() returns a random element from the current set of elements (it's guaranteed that at least one element exists when this method is called).

Each element must have the same probability of being returned. You must implement the functions of the class such that each function works in average O(1) time complexity.`,
    examples: [
      {
        input: '["RandomizedSet","insert","remove","insert","getRandom","remove","insert","getRandom"]\n[[],[1],[2],[2],[],[1],[2],[]]',
        output: '[null,true,false,true,2,true,false,2]',
      },
    ],
    constraints: [
      '-2^31 ≤ val ≤ 2^31 - 1',
      'at most 2·10^5 calls total will be made to insert, remove, and getRandom',
      'at least one element will exist when getRandom is called',
    ],
    signature: {
      kind: 'class',
      className: 'RandomizedSet',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'insert', params: [['val', 'int']], returns: 'bool' },
        { name: 'remove', params: [['val', 'int']], returns: 'bool' },
        { name: 'getRandom', params: [], returns: 'int' },
      ],
    },
    signals: [
      { phrase: 'uniformly random currently-active ticket', means: 'every remaining element is equally likely, not weighted' },
      { phrase: 'same probability of being returned', means: "can't pick a random key from a hashmap with holes" },
      { phrase: 'average O(1) time complexity', means: "array alone can't delete in O(1) without a swap-with-last trick" },
      { phrase: 'no matter how large the pool has grown', means: "getRandom can't scan or rebuild a list each call" },
    ],
    keyInfo: {
      input: 'sequence of insert/remove/getRandom calls',
      output: 'bool for insert/remove, int for getRandom',
      target: "O(1) average per call, since a pure hashmap can't getRandom and a pure array can't remove in O(1) alone",
    },
    pattern: 'Array of values + hashmap value→index, swap-with-last to delete',
    ds: ['array', 'hashmap'],
    time: 'O(1) average per call',
    space: 'O(n)',
    edgeCases: [
      'removing the last element in the array',
      'removing an element that is not present',
      'inserting a value that already exists',
      'getRandom with exactly one element in the set',
    ],
    skills: ['arrays-hashing', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc355',
    lc: 355,
    title: 'Design Twitter',
    difficulty: 'Medium',
    statement: `You're prototyping a stripped-down version of a social feed: users can post short updates, follow and unfollow each other, and each user's home timeline should show their most recent posts mixed with posts from people they follow.

Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the 10 most recent tweets in the user's news feed.

Implement the Twitter class: Twitter() initializes your twitter object. postTweet(userId, tweetId) composes a new tweet with ID tweetId by the user userId. getNewsFeed(userId) returns a list of the 10 most recent tweet IDs in the user's news feed, ordered from most recent to least recent, from people the user follows or the user themself. follow(followerId, followeeId) the user with ID followerId starts following the user with ID followeeId. unfollow(followerId, followeeId) the user with ID followerId stops following the user with ID followeeId.`,
    examples: [
      {
        input: '["Twitter","postTweet","getNewsFeed","follow","postTweet","getNewsFeed","unfollow","getNewsFeed"]\n[[],[1,5],[1],[1,2],[2,6],[1],[1,2],[1]]',
        output: '[null,null,[5],null,null,[6,5],null,[5]]',
      },
    ],
    constraints: [
      '1 ≤ userId, followerId, followeeId ≤ 500',
      '0 ≤ tweetId ≤ 10^4',
      'all the tweets have unique IDs',
      'at most 3·10^4 calls total will be made to postTweet, getNewsFeed, follow, and unfollow',
    ],
    signature: {
      kind: 'class',
      className: 'Twitter',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'postTweet', params: [['userId', 'int'], ['tweetId', 'int']], returns: 'None' },
        { name: 'getNewsFeed', params: [['userId', 'int']], returns: 'List[int]' },
        { name: 'follow', params: [['followerId', 'int'], ['followeeId', 'int']], returns: 'None' },
        { name: 'unfollow', params: [['followerId', 'int'], ['followeeId', 'int']], returns: 'None' },
      ],
    },
    signals: [
      { phrase: "10 most recent tweets in the user's news feed", means: 'feed caps at 10, merging user and followees' },
      { phrase: 'ordered from most recent to least recent', means: 'sort merged candidates by recency before taking the top 10' },
      { phrase: 'from people the user follows or the user themself', means: "feed always includes the user's own posts" },
      { phrase: 'the user with ID followerId starts following the user with ID followeeId', means: 'following is directional, not mutual' },
    ],
    keyInfo: {
      input: 'postTweet/follow/unfollow/getNewsFeed calls with user and tweet ids',
      output: 'list of up to 10 tweet ids for getNewsFeed, None otherwise',
      target: "O(k log k) per getNewsFeed (k = followee count), since re-sorting every tweet ever posted would not scale",
    },
    pattern: 'Per-user tweet list with timestamps + heap-merge across followees',
    ds: ['hashmap', 'heap'],
    time: 'O(k log k) per getNewsFeed, O(1) per post/follow/unfollow',
    space: 'O(total tweets + follow edges)',
    edgeCases: [
      'user with no tweets and no followees gets an empty feed',
      'unfollowing someone removes their tweets from future feeds',
      'following the same person twice should not duplicate their tweets in the feed',
      'fewer than 10 total tweets across everyone followed',
    ],
    skills: ['heap', 'arrays-hashing', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc1472',
    lc: 1472,
    title: 'Design Browser History',
    difficulty: 'Medium',
    statement: `You're implementing the back and forward buttons for a lightweight in-house browser. Visiting a brand-new page should wipe out whatever forward history existed before, exactly like a real browser.

You have a browser of one tab where you start on the homepage and you can visit another url, get back in the history number of steps or move forward in the history number of steps.

Implement the BrowserHistory class: BrowserHistory(homepage) initializes the object with the homepage of the browser. visit(url) visits url from the current page. It clears up all the forward history. back(steps) move steps back in history, returning the current url after moving back in history at most steps steps. If you can only return x steps in the history and steps > x, you will return only x steps. forward(steps) move steps forward in history, returning the current url after moving forward in history at most steps steps.`,
    examples: [
      {
        input:
          '["BrowserHistory","visit","visit","visit","back","back","forward","visit","forward","back","back"]\n' +
          '[["leetcode.com"],["google.com"],["facebook.com"],["youtube.com"],[1],[1],[1],["linkedin.com"],[2],[2],[7]]',
        output: '[null,null,null,null,"facebook.com","google.com","facebook.com",null,"linkedin.com","google.com","leetcode.com"]',
      },
    ],
    constraints: [
      '1 ≤ homepage.length, url.length ≤ 20',
      '1 ≤ steps ≤ 100',
      'at most 5000 calls total will be made to visit, back, and forward',
    ],
    signature: {
      kind: 'class',
      className: 'BrowserHistory',
      methods: [
        { name: '__init__', params: [['homepage', 'str']], returns: 'None' },
        { name: 'visit', params: [['url', 'str']], returns: 'None' },
        { name: 'back', params: [['steps', 'int']], returns: 'str' },
        { name: 'forward', params: [['steps', 'int']], returns: 'str' },
      ],
    },
    signals: [
      { phrase: 'clears up all the forward history', means: 'visiting from the middle of history discards everything ahead' },
      { phrase: 'If you can only return x steps in the history and steps > x, you will return only x steps', means: 'clamp steps to the available range instead of erroring' },
      { phrase: 'back and forward buttons', means: 'need a movable pointer within a sequence, not stack push/pop' },
      { phrase: 'start on the homepage', means: 'history begins seeded with the homepage as the first entry' },
    ],
    keyInfo: {
      input: 'homepage string, then visit/back/forward calls',
      output: 'current url string after each back/forward',
      target: 'O(1) amortized per call, since up to 5000 calls rules out rebuilding history each time',
    },
    pattern: 'Array of visited urls + a current-index pointer',
    ds: ['array'],
    time: 'O(1) amortized per call',
    space: 'O(number of visits)',
    edgeCases: [
      'back or forward steps larger than available history clamps instead of erroring',
      'visiting a new url after going back truncates forward history',
      'back called immediately after construction with no visits yet',
      'forward called with zero remaining forward steps',
    ],
    skills: ['ds-diagnosis', 'stack'],
  },
  {
    id: 'statements-b:lc362',
    lc: 362,
    title: 'Design Hit Counter',
    difficulty: 'Medium',
    statement: `You're building a rate-of-traffic widget for an API gateway dashboard: every incoming request calls in, and the dashboard needs to know, at any moment, how many requests landed in the last 300 seconds (5 minutes), not the all-time total.

Design a hit counter which counts the number of hits received in the past 5 minutes (i.e., the past 300 seconds).

Your system should accept a timestamp parameter (in seconds granularity), and you may assume that calls are being made to the system in chronological order (i.e., timestamp is monotonically increasing). Several hits may arrive roughly at the same time.

Implement the HitCounter class: HitCounter() initializes the object of the hit counter system. hit(timestamp) records a hit that happened at timestamp (in seconds). getHits(timestamp) returns the number of hits in the past 5 minutes from timestamp.`,
    examples: [
      {
        input: '["HitCounter","hit","hit","hit","getHits","hit","getHits","getHits"]\n[[],[1],[2],[3],[4],[300],[300],[301]]',
        output: '[null,null,null,null,3,null,4,3]',
      },
    ],
    constraints: [
      '1 ≤ timestamp ≤ 2·10^9',
      'all the calls are being made to the system in chronological order',
      'at most 300 calls will be made to hit and getHits',
    ],
    signature: {
      kind: 'class',
      className: 'HitCounter',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'hit', params: [['timestamp', 'int']], returns: 'None' },
        { name: 'getHits', params: [['timestamp', 'int']], returns: 'int' },
      ],
    },
    signals: [
      { phrase: 'requests landed in the last 300 seconds (5 minutes)', means: 'a sliding window of exactly 300 seconds, not all-time' },
      { phrase: 'chronological order (i.e., timestamp is monotonically increasing)', means: 'no need to handle out-of-order timestamps' },
      { phrase: 'Several hits may arrive roughly at the same time', means: "store counts per timestamp, don't assume one hit per second" },
      { phrase: 'past 5 minutes (i.e., the past 300 seconds)', means: 'sliding 300-second window anchored to each query call' },
    ],
    keyInfo: {
      input: 'hit(timestamp) and getHits(timestamp) calls',
      output: 'None for hit, int count for getHits',
      target: 'O(1) amortized per call, since at most 300 calls makes a simple queue plenty fast',
    },
    pattern: 'Queue of (timestamp, count) pairs, pop from the front while stale',
    ds: ['queue-deque'],
    time: 'O(1) amortized per call',
    space: 'O(distinct recent timestamps)',
    edgeCases: [
      'multiple hit calls at the exact same timestamp',
      'getHits called before any hit',
      'a hit exactly 300 seconds old should drop out of the window',
      'getHits called with no hits in the last 300 seconds',
    ],
    skills: ['queue-deque', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc1146',
    lc: 1146,
    title: 'Snapshot Array',
    difficulty: 'Medium',
    statement: `You're building an undo-history feature for a spreadsheet-like row of cells: at any point you can take a full snapshot of every cell's value, and later ask what cell i held at snapshot number k, without storing a full copy of the array on every single snapshot.

Implement a SnapshotArray that supports the following interface: SnapshotArray(length) initializes an array-like data structure with the given length. Initially, each element equals 0. set(index, val) sets the element at the given index to be equal to val. snap() takes a snapshot of the array and returns the snap_id: the total number of times we called snap() minus 1. get(index, snap_id) returns the value at the given index, at the time we took the snapshot with the given snap_id.`,
    examples: [
      {
        input: '["SnapshotArray","set","snap","set","get"]\n[[3],[0,5],[],[0,6],[0,0]]',
        output: '[null,null,0,null,5]',
      },
    ],
    constraints: [
      '1 ≤ length ≤ 5·10^4',
      '0 ≤ index < length',
      '0 ≤ val ≤ 10^9',
      '0 ≤ snap_id < number of times we call snap()',
      'at most 5·10^4 calls will be made to set, snap, and get',
    ],
    signature: {
      kind: 'class',
      className: 'SnapshotArray',
      methods: [
        { name: '__init__', params: [['length', 'int']], returns: 'None' },
        { name: 'set', params: [['index', 'int'], ['val', 'int']], returns: 'None' },
        { name: 'snap', params: [], returns: 'int' },
        { name: 'get', params: [['index', 'int'], ['snap_id', 'int']], returns: 'int' },
      ],
    },
    signals: [
      { phrase: 'without storing a full copy of the array on every single snapshot', means: "can't deep-copy the whole array on each snap" },
      { phrase: 'total number of times we called snap() minus 1', means: 'snap ids are just a counter, starting at 0' },
      { phrase: 'at the time we took the snapshot with the given snap_id', means: 'get needs the historical value, not the current one' },
      { phrase: 'Initially, each element equals 0', means: 'array starts zeroed, not uninitialized' },
    ],
    keyInfo: {
      input: 'length, then set/snap/get calls',
      output: 'None for set, int snap id for snap, int value for get',
      target: 'O(log k) get and O(1) set/snap (k = snapshots touching that index), since copying per snap would be O(length) each time',
    },
    pattern: 'Per-index list of (snap_id, value) pairs + binary search on get',
    ds: ['array', 'hashmap'],
    time: 'O(1) set, O(1) snap, O(log k) get',
    space: 'O(total set calls)',
    edgeCases: [
      'get on an index that was never set before any relevant snapshot',
      'multiple sets to the same index between two snaps keeps only the last value',
      'get with snap_id 0 before any set calls',
      'snap called with no set calls since the previous snap',
    ],
    skills: ['binary-search', 'arrays-hashing', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc460',
    lc: 460,
    title: 'LFU Cache',
    difficulty: 'Hard',
    statement: `Your team wants a smarter cache than plain LRU for a hot-path lookup table: instead of evicting whoever was touched longest ago, it should evict whoever was touched least often, and only break ties by recency.

Design and implement a data structure for a Least Frequently Used (LFU) cache.

Implement the LFUCache class: LFUCache(capacity) initializes the object with the capacity of the data structure. get(key) returns the value of the key if it exists in the cache, otherwise returns -1. put(key, value) updates the value of the key if present, or inserts the key if not present. When the cache reaches its capacity, it should invalidate and remove the least frequently used key before inserting a new item. For this problem, when there is a tie (i.e., two or more keys with the same frequency), the least recently used key should be invalidated.

To determine the least frequently used key, a use counter is maintained for each key in the cache. When a key is first inserted into the cache, its use counter is set to 1 (due to the put operation). The use counter for a key in the cache is incremented either a get or put operation is called on it.

The functions get and put must each run in O(1) average time complexity.`,
    examples: [
      {
        input: '["LFUCache","put","put","get","put","get","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[3],[4,4],[1],[3],[4]]',
        output: '[null,null,null,1,null,-1,3,null,-1,3,4]',
      },
    ],
    constraints: [
      '0 ≤ capacity ≤ 10^4',
      '0 ≤ key ≤ 10^5',
      '0 ≤ value ≤ 10^9',
      'at most 2·10^5 calls total will be made to get and put',
    ],
    signature: {
      kind: 'class',
      className: 'LFUCache',
      methods: [
        { name: '__init__', params: [['capacity', 'int']], returns: 'None' },
        { name: 'get', params: [['key', 'int']], returns: 'int' },
        { name: 'put', params: [['key', 'int'], ['value', 'int']], returns: 'None' },
      ],
    },
    signals: [
      { phrase: 'evict whoever was touched least often', means: 'eviction order is frequency first, not recency' },
      { phrase: 'the least recently used key should be invalidated', means: 'ties within the same frequency break by recency' },
      { phrase: 'incremented either a get or put operation is called on it', means: 'reads count toward frequency just like writes' },
      { phrase: 'O(1) average time complexity', means: 'a sorted-by-frequency structure would be too slow per call' },
    ],
    keyInfo: {
      input: 'capacity, then get/put calls',
      output: 'int value or -1 for get, None for put',
      target: 'O(1) per call, which rules out scanning for the minimum frequency on every eviction',
    },
    pattern: 'Hashmap key→(value, freq) + hashmap freq→ordered key list, tracking the min freq',
    ds: ['hashmap', 'linked-list'],
    time: 'O(1) average per operation',
    space: 'O(capacity)',
    edgeCases: [
      'capacity of 0 means nothing can ever be cached',
      'a tie in frequency between two keys breaks by recency',
      'get on a missing key does not create an entry or affect frequencies',
      'put on an existing key updates the value and bumps frequency without evicting',
    ],
    skills: ['ds-diagnosis', 'linked-list', 'communication'],
  },
  {
    id: 'statements-b:lc173',
    lc: 173,
    title: 'Binary Search Tree Iterator',
    difficulty: 'Medium',
    statement: `You're writing a lazy row-cursor for a database index backed by a binary search tree: callers want to pull out rows one at a time in ascending key order, without materializing the entire sorted list up front, since the tree could be huge.

Implement the BSTIterator class that represents an iterator over the in-order traversal of a binary search tree (BST).

BSTIterator(root) initializes an object of the BSTIterator class. The root of the BST is given as part of the constructor. The pointer should be initialized to a non-existent number smaller than any element in the BST. hasNext() returns true if there exists a number in the traversal to the right of the pointer, otherwise returns false. next() moves the pointer to the right, then returns the number at the pointer.

You may assume that next() calls will always be valid, that is, there will always be a next number in the in-order traversal when next() is called.`,
    examples: [
      {
        input: '["BSTIterator","next","next","hasNext","next","hasNext","next","hasNext","next","hasNext"]\n[[[7,3,15,null,null,9,20]],[],[],[],[],[],[],[],[],[]]',
        output: '[null,3,7,true,9,true,15,true,20,false]',
      },
    ],
    constraints: [
      'the number of nodes in the tree is in the range [1, 10^5]',
      '0 ≤ Node.val ≤ 10^6',
      'at most 10^5 calls will be made to hasNext and next',
    ],
    followUp: 'Could you implement next() and hasNext() to run in average O(1) time and use O(h) memory, where h is the height of the tree?',
    signature: {
      kind: 'class',
      className: 'BSTIterator',
      helperClasses: ['TreeNode'],
      methods: [
        { name: '__init__', params: [['root', 'Optional[TreeNode]']], returns: 'None' },
        { name: 'hasNext', params: [], returns: 'bool' },
        { name: 'next', params: [], returns: 'int' },
      ],
    },
    signals: [
      { phrase: 'without materializing the entire sorted list up front', means: "can't just precompute a full in-order array in the constructor" },
      { phrase: 'a number in the traversal to the right of the pointer', means: "next() must follow BST in-order order, not any order" },
      { phrase: 'next() calls will always be valid', means: 'no need to guard next() when hasNext() is false' },
      { phrase: 'non-existent number smaller than any element', means: 'first next() returns the minimum value in the tree' },
    ],
    keyInfo: {
      input: 'BST root, then next()/hasNext() calls',
      output: 'bool for hasNext, int for next',
      target: 'O(1) amortized next() and O(h) space with a controlled stack, so the follow-up rules out precomputing the full array',
    },
    pattern: 'Explicit stack simulating in-order DFS, pushing left children lazily',
    ds: ['stack', 'bst'],
    time: 'O(1) amortized per next(), O(h) for hasNext()',
    space: 'O(h), h = tree height',
    edgeCases: [
      'tree with a single node',
      'a fully left-skewed tree (worst case for stack size)',
      'calling hasNext() right after construction before any next()',
      'a tree with only right children, no left subtrees to push',
    ],
    skills: ['bst', 'tree-dfs', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc232',
    lc: 232,
    title: 'Implement Queue using Stacks',
    difficulty: 'Easy',
    statement: `As a warm-up for an interview about adapting one data structure's interface on top of another, your task is to build a FIFO queue using only the operations of two plain stacks, nothing else.

Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).

Implement the MyQueue class: push(x) pushes element x to the back of the queue. pop() removes the element from the front of the queue and returns it. peek() returns the element at the front of the queue. empty() returns true if the queue is empty, false otherwise.

Notice that you may only use standard operations of a stack, which means only push to top, peek/pop from top, size, and is empty operations are valid.`,
    examples: [
      {
        input: '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]',
        output: '[null,null,null,1,1,false]',
      },
    ],
    constraints: [
      '1 ≤ x ≤ 9',
      'at most 100 calls will be made to push, pop, peek, and empty',
      'all the calls to pop and peek are valid',
    ],
    followUp: 'Can you implement the queue such that each operation is amortized O(1) time complexity?',
    signature: {
      kind: 'class',
      className: 'MyQueue',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'push', params: [['x', 'int']], returns: 'None' },
        { name: 'pop', params: [], returns: 'int' },
        { name: 'peek', params: [], returns: 'int' },
        { name: 'empty', params: [], returns: 'bool' },
      ],
    },
    signals: [
      { phrase: 'using only the operations of two plain stacks, nothing else', means: 'no deque or list indexing, pure stack push/pop/peek only' },
      { phrase: 'all the calls to pop and peek are valid', means: 'no need to check emptiness before pop/peek' },
      { phrase: 'pushes element x to the back of the queue', means: 'push always appends, mirroring FIFO order' },
      { phrase: 'only push to top, peek/pop from top, size, and is empty operations are valid', means: 'no indexing or iterating the underlying stacks' },
    ],
    keyInfo: {
      input: 'push/pop/peek/empty calls',
      output: 'None for push, int for pop/peek, bool for empty',
      target: 'amortized O(1) per op per the follow-up, by reversing input into output only when output is empty',
    },
    pattern: 'Two stacks: input stack for push, output stack for pop/peek, reverse lazily',
    ds: ['stack', 'queue-deque'],
    time: 'amortized O(1) per operation',
    space: 'O(n)',
    edgeCases: [
      'pop immediately after a push with nothing in the output stack yet',
      'interleaved pushes and pops without draining the output stack between them',
      'empty() called right after construction',
      'peek does not remove the element, a following pop must still return it',
    ],
    skills: ['stack', 'queue-deque', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc705',
    lc: 705,
    title: 'Design HashSet',
    difficulty: 'Easy',
    statement: `You're asked to implement a hash set from first principles, without reaching for a language's built-in set, to show you understand what's happening underneath.

Design a HashSet without using any built-in hash table libraries.

Implement MyHashSet class: add(key) inserts the value key into the HashSet. contains(key) returns whether the value key exists in the HashSet or not. remove(key) removes the value key in the HashSet. If key does not exist in the HashSet, do nothing.`,
    examples: [
      {
        input: '["MyHashSet","add","add","contains","contains","add","contains","remove","contains"]\n[[],[1],[2],[1],[3],[2],[2],[2],[2]]',
        output: '[null,null,null,true,false,null,true,null,false]',
      },
    ],
    constraints: [
      '0 ≤ key ≤ 10^6',
      'at most 10^4 calls will be made to add, remove, and contains',
    ],
    signature: {
      kind: 'class',
      className: 'MyHashSet',
      methods: [
        { name: '__init__', params: [], returns: 'None' },
        { name: 'add', params: [['key', 'int']], returns: 'None' },
        { name: 'remove', params: [['key', 'int']], returns: 'None' },
        { name: 'contains', params: [['key', 'int']], returns: 'bool' },
      ],
    },
    signals: [
      { phrase: 'without using any built-in hash table libraries', means: "can't just wrap a built-in set or dict directly" },
      { phrase: 'If key does not exist in the HashSet, do nothing', means: 'remove on a missing key is a no-op' },
      { phrase: '0 ≤ key ≤ 10^6', means: 'key range is bounded, so a fixed-size bucket array works' },
      { phrase: "without reaching for a language's built-in set", means: 'must build the hashing/bucket logic manually' },
    ],
    keyInfo: {
      input: 'add/remove/contains calls with integer keys',
      output: 'None for add/remove, bool for contains',
      target: 'O(1) average per call with buckets sized well below the 10^6 key range',
    },
    pattern: 'Array of buckets (lists), index = key mod bucket count',
    ds: ['array'],
    time: 'O(1) average per operation',
    space: 'O(n + bucket count)',
    edgeCases: [
      'contains on a key that was never added',
      'remove then re-add the same key',
      'two keys that collide into the same bucket',
      'add the same key twice in a row',
    ],
    skills: ['arrays-hashing', 'ds-diagnosis'],
  },
  {
    id: 'statements-b:lc207',
    lc: 207,
    title: 'Course Schedule',
    difficulty: 'Medium',
    statement: `Registration season just opened and the university's course-planning tool needs a sanity check before students start enrolling: some courses require other courses to be completed first, and the tool must detect if the prerequisite chains make it actually impossible to ever finish the degree.

There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

For example, the pair [0, 1] indicates that to take course 0 you have to first take course 1.

Return true if you can finish all courses. Otherwise, return false.`,
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'take course 0 first, then course 1' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explanation: 'course 1 needs course 0, and course 0 needs course 1, a cycle' },
    ],
    constraints: [
      '1 ≤ numCourses ≤ 2000',
      '0 ≤ prerequisites.length ≤ 5000',
      'prerequisites[i].length == 2',
      '0 ≤ ai, bi < numCourses',
      'all the pairs prerequisites[i] are unique',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'canFinish',
      params: [['numCourses', 'int'], ['prerequisites', 'List[List[int]]']],
      returns: 'bool',
    },
    signals: [
      { phrase: 'make it actually impossible to ever finish the degree', means: 'detect whether any valid finishing order exists' },
      { phrase: 'you must take course bi first if you want to take course ai', means: 'edges point from prerequisite to dependent, direction matters' },
      { phrase: 'all the pairs prerequisites[i] are unique', means: 'no duplicate edges to dedupe' },
      { phrase: 'Return true if you can finish all courses', means: 'overall feasibility question, not producing an actual order' },
    ],
    keyInfo: {
      input: 'numCourses int, prerequisites list of [course, prereq] pairs',
      output: 'bool, whether all courses are finishable',
      target: 'O(V+E), since numCourses and prerequisites are both bounded under a few thousand',
    },
    pattern: 'Cycle detection in a directed graph (topological sort)',
    ds: ['graph'],
    time: 'O(V + E)',
    space: 'O(V + E)',
    edgeCases: [
      'a course that depends on itself',
      'a course with no prerequisites at all',
      'two courses that depend on each other directly (a 2-cycle)',
      'a long chain with no cycle should still return true',
    ],
    skills: ['graph-modeling', 'topo-sort', 'graph-dfs'],
  },
  {
    id: 'statements-b:lc417',
    lc: 417,
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    statement: `You're modeling rainfall drainage over a rectangular island represented as a grid of heights. The Pacific Ocean touches the island's left and top edges, and the Atlantic touches the right and bottom edges. Water on any cell can flow to a neighboring cell only if that neighbor's height is less than or equal to the current cell's height, moving up, down, left, or right.

Given an m x n integer matrix heights representing the height of each unit cell in a continent, find the cells where water can flow to both the Pacific and Atlantic ocean.

Return a 2D list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from cell (ri, ci) to both the Pacific and Atlantic oceans.`,
    examples: [
      {
        input: 'heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]',
        output: '[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]',
      },
    ],
    constraints: [
      'm == heights.length',
      'n == heights[r].length',
      '1 ≤ m, n ≤ 200',
      '0 ≤ heights[r][c] ≤ 10^5',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'pacificAtlantic',
      params: [['heights', 'List[List[int]]']],
      returns: 'List[List[int]]',
    },
    signals: [
      { phrase: 'flow to a neighboring cell only if that neighbor\'s height is less than or equal', means: 'flow direction is downhill or flat, never uphill' },
      { phrase: 'flow to both the Pacific and Atlantic ocean', means: 'a cell must satisfy both ocean conditions at once' },
      { phrase: "touches the island's left and top edges", means: "Pacific border is the entire first row and first column" },
      { phrase: '1 ≤ m, n ≤ 200', means: 'grid small enough that an O(m·n) multi-source traversal easily fits' },
    ],
    keyInfo: {
      input: 'm x n integer height grid',
      output: 'list of [row, col] cells that reach both oceans',
      target: "O(m·n), since reversing the flow from each ocean's border beats forward-flowing from every cell at O((mn)^2)",
    },
    pattern: "Multi-source DFS/BFS from each ocean's border, flowing uphill, then intersect",
    ds: ['grid'],
    time: 'O(m · n)',
    space: 'O(m · n)',
    edgeCases: [
      'a 1x1 grid always reaches both oceans',
      'a flat grid where every cell is the same height',
      'a corner cell touches both borders directly',
      'a plateau of equal-height cells visited once, not revisited',
    ],
    skills: ['grid', 'graph-dfs', 'graph-modeling'],
  },
  {
    id: 'statements-b:lc778',
    lc: 778,
    title: 'Swim in Rising Water',
    difficulty: 'Hard',
    statement: `You're simulating a flood-rescue scenario on an n x n grid of elevations: water starts at time 0 and the water level at time t is t everywhere. You start at the top-left cell at time 0 and must swim to the bottom-right cell, moving to any of the 4 adjacent cells.

You can swim from one square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most t. You can swim infinite distances in zero time. Of course, you must stay within the boundaries of the grid during your swim.

Return the least time until you can reach the bottom right square if you start at the top left square.`,
    examples: [
      {
        input: 'grid = [[0,2],[1,3]]',
        output: '3',
        explanation: 'at time 3, the water level is 3 and all four cells have elevation ≤ 3, so a path exists',
      },
    ],
    constraints: [
      'n == grid.length == grid[i].length',
      '1 ≤ n ≤ 50',
      '0 ≤ grid[i][j] < n^2',
      'each value grid[i][j] is unique',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'swimInWater',
      params: [['grid', 'List[List[int]]']],
      returns: 'int',
    },
    signals: [
      { phrase: 'water level at time t is t everywhere', means: 'time variable equals the flood threshold being solved' },
      { phrase: 'the elevation of both squares individually are at most t', means: 'path usable once t ≥ its max elevation' },
      { phrase: 'least time until you can reach the bottom right square', means: 'minimize the maximum elevation on the path, not path length' },
      { phrase: 'You can swim infinite distances in zero time', means: 'movement itself is free, only elevation threshold costs time' },
    ],
    keyInfo: {
      input: 'n x n grid of unique elevations',
      output: 'int, minimum t to connect top-left to bottom-right',
      target: 'O(n^2 log n) with a priority queue, since brute-forcing every t with a fresh flood fill would be O(n^4)',
    },
    pattern: 'Dijkstra-style priority queue, always expand the lowest-elevation frontier cell next',
    ds: ['grid', 'heap'],
    time: 'O(n^2 log n)',
    space: 'O(n^2)',
    edgeCases: [
      'starting cell itself has a very high elevation',
      '1x1 grid, answer is the single cell\'s elevation',
      'a detour through lower cells beats the direct path',
      'bottom-right cell has the maximum elevation in the whole grid',
    ],
    skills: ['heap', 'grid', 'graph-bfs'],
  },
  {
    id: 'statements-b:lc1970',
    lc: 1970,
    title: 'Last Day Where You Can Still Cross',
    difficulty: 'Hard',
    statement: `You're tracking a flood simulation on a row x col grid of land cells, where exactly one new cell becomes flooded (water) each day, in a known order given in advance. You need to find the last day it is still possible to walk from the top row to the bottom row, stepping only on land, moving up, down, left, or right.

You are given a 1-based coordinate matrix cells, where cells[i] = [ri, ci] represents that on the ith day, the cell on the row ri and column ci will be flooded. All the cells that are not flooded initially are land.

Return the last day where it is possible to walk from the top to the bottom by only walking on cells that are not flooded. You can start from any cell in the top row and end at any cell in the bottom row.`,
    examples: [
      {
        input: 'row = 2, col = 2, cells = [[1,1],[2,1],[1,2],[2,2]]',
        output: '2',
        explanation: 'after day 2 floods, a top-to-bottom path still exists; after day 3 it does not',
      },
    ],
    constraints: [
      '2 ≤ row, col ≤ 2·10^4',
      '4 ≤ row · col ≤ 2·10^4',
      'cells.length == row · col',
      '1 ≤ cells[i][0] ≤ row',
      '1 ≤ cells[i][1] ≤ col',
      'all the values of cells are unique',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'latestDayToCross',
      params: [['row', 'int'], ['col', 'int'], ['cells', 'List[List[int]]']],
      returns: 'int',
    },
    signals: [
      { phrase: 'exactly one new cell becomes flooded (water) each day, in a known order', means: 'flood schedule is fully given up front' },
      { phrase: 'last day it is still possible to walk from the top row to the bottom row', means: 'answer is monotonic, once crossing fails it stays failed' },
      { phrase: 'start from any cell in the top row and end at any cell in the bottom row', means: 'no fixed source/destination, use virtual super-source and super-sink' },
      { phrase: 'the ith day, the cell on the row ri and column ci will be flooded', means: 'flood order indexes days by the given cells array order' },
    ],
    keyInfo: {
      input: 'row, col ints, cells list of 1-based [row, col] flood order',
      output: 'int, last day a top-to-bottom path exists',
      target: 'O(row·col·log(row·col)) with binary search over the day plus a BFS/DFS check, beating independently re-scanning the grid for every day',
    },
    pattern: 'Binary search on the day + BFS/DFS flood-fill connectivity check',
    ds: ['grid', 'union-find'],
    time: 'O(row · col · log(row · col))',
    space: 'O(row · col)',
    edgeCases: [
      'the very first day already disconnects top from bottom',
      'day 0 (before any flooding) must always allow a path across',
      'a single-column grid where any one flood blocks the path',
      'row or col at the minimum allowed size (2)',
    ],
    skills: ['binary-search', 'grid', 'graph-bfs'],
  },
  {
    id: 'statements-b:lc2812',
    lc: 2812,
    title: 'Find the Safest Path in a Grid',
    difficulty: 'Medium',
    statement: `You're building a route-safety overlay for a delivery-robot grid map. Some cells contain thieves, and a cell's safeness factor is defined as the Manhattan distance from that cell to the nearest thief. You need to route the robot from the top-left cell to the bottom-right cell while maximizing the minimum safeness factor along the entire path.

You are given a 0-indexed 2D matrix grid of size n x n, where grid[r][c] = 1 indicates the presence of a thief in cell (r, c), and grid[r][c] = 0 indicates the cell is safe.

The safeness factor of a path is the minimum safeness factor among all the cells in the path. Return the maximum safeness factor of all paths leading to the destination cell (n-1, n-1), starting from (0, 0).`,
    examples: [
      {
        input: 'grid = [[1,0,0],[0,0,0],[0,0,1]]',
        output: '0',
        explanation: 'both the start and end cells are adjacent to a thief, so even the safest path still touches a cell of safeness 0',
      },
    ],
    constraints: [
      '1 ≤ grid.length == n ≤ 400',
      'grid[i].length == n',
      'grid[i][j] is either 0 or 1',
      'there is at least one thief in the grid',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'maximumSafenessFactor',
      params: [['grid', 'List[List[int]]']],
      returns: 'int',
    },
    signals: [
      { phrase: 'Manhattan distance from that cell to the nearest thief', means: 'distance to nearest thief, precomputed once per cell' },
      { phrase: 'maximizing the minimum safeness factor along the entire path', means: 'classic maximize-the-minimum, not a sum or average' },
      { phrase: 'the maximum safeness factor of all paths', means: 'compare across every possible path for the best worst-cell value' },
      { phrase: 'there is at least one thief in the grid', means: 'distance computation is always well-defined, never undefined' },
    ],
    keyInfo: {
      input: 'n x n binary grid marking thief cells',
      output: 'int, the maximum achievable minimum safeness along any path',
      target: 'O(n^2 log n) via multi-source BFS for distances plus a binary-search-or-heap pass, since checking every path directly is infeasible for n up to 400',
    },
    pattern: 'Multi-source BFS for per-cell safeness, then binary search on answer or a Dijkstra-style max-min heap',
    ds: ['grid', 'heap'],
    time: 'O(n^2 log n)',
    space: 'O(n^2)',
    edgeCases: [
      'a thief placed directly on the start or end cell',
      'only one thief in the entire grid',
      'start and end cell are the same when n is 1',
      'the safest path must zig-zag away from a straight line',
    ],
    skills: ['graph-bfs', 'grid', 'heap'],
  },
  {
    id: 'statements-b:lc994',
    lc: 994,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    statement: `A warehouse stores oranges in an m x n grid of bins. Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten too, and this spreads minute by minute until nothing new can rot.

You are given an m x n grid where each cell can have one of three values: 0 representing an empty cell, 1 representing a fresh orange, or 2 representing a rotten orange.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.`,
    examples: [
      { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
      { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1', explanation: 'the orange in the bottom-left corner is never reached by the rot' },
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 ≤ m, n ≤ 10',
      'grid[i][j] is 0, 1, or 2',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'orangesRotting',
      params: [['grid', 'List[List[int]]']],
      returns: 'int',
    },
    signals: [
      { phrase: 'becomes rotten too, and this spreads minute by minute', means: 'all rotten cells spread together each minute' },
      { phrase: 'If this is impossible, return -1', means: 'some fresh orange may be unreachable by any rotten one' },
      { phrase: 'minimum number of minutes that must elapse until no cell has a fresh orange', means: 'answer counts BFS layers, not cells' },
      { phrase: '4-directionally adjacent', means: 'diagonal neighbors never count, only up/down/left/right' },
    ],
    keyInfo: {
      input: 'm x n grid with 0/1/2 cell values',
      output: 'int minutes to rot everything, or -1',
      target: 'O(m·n) via BFS from every rotten cell at once (multi-source BFS)',
    },
    pattern: 'Multi-source BFS starting from every rotten cell simultaneously',
    ds: ['grid', 'queue-deque'],
    time: 'O(m · n)',
    space: 'O(m · n)',
    edgeCases: [
      'grid with no fresh oranges at all (answer is 0)',
      'grid with no rotten oranges and at least one fresh one (answer is -1)',
      'a fresh orange isolated by empty cells on all sides',
      'all oranges already rotten from the start',
    ],
    skills: ['graph-bfs', 'grid'],
  },
  {
    id: 'statements-b:lc127',
    lc: 127,
    title: 'Word Ladder',
    difficulty: 'Hard',
    statement: `You're building a word-game hint engine: given a start word and an end word, both the same length, and a dictionary of allowed words, the engine should find the fewest number of single-letter swaps needed to morph the start word into the end word, where every intermediate word along the way must also be in the dictionary.

A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter, every si for 1 ≤ i ≤ k is in wordList (note that beginWord does not need to be in wordList), and sk == endWord.

Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.`,
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '5',
        explanation: 'hit -> hot -> dot -> dog -> cog, which is 5 words long',
      },
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
        output: '0',
        explanation: 'endWord cog is not in wordList, so no valid sequence exists',
      },
    ],
    constraints: [
      '1 ≤ beginWord.length ≤ 10',
      'endWord.length == beginWord.length',
      '1 ≤ wordList.length ≤ 5000',
      'wordList[i].length == beginWord.length',
      'beginWord, endWord, and wordList[i] consist of lowercase English letters',
      'beginWord != endWord',
      'all the words in wordList are unique',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'ladderLength',
      params: [['beginWord', 'str'], ['endWord', 'str'], ['wordList', 'List[str]']],
      returns: 'int',
    },
    signals: [
      { phrase: 'fewest number of single-letter swaps', means: 'shortest path in an implicit graph, the pattern screams BFS' },
      { phrase: 'every adjacent pair of words differs by a single letter', means: 'edges are words one letter apart' },
      { phrase: 'every si for 1 ≤ i ≤ k is in wordList', means: 'every intermediate word must also be a dictionary word' },
      { phrase: 'beginWord does not need to be in wordList', means: 'the starting word is exempt from the dictionary membership requirement' },
    ],
    keyInfo: {
      input: 'beginWord, endWord strings, wordList of candidate words',
      output: 'int, shortest transformation length, or 0',
      target: 'O(n · L^2) (n = wordList size, L = word length), via generating one-letter variants per BFS level rather than comparing every pair of words',
    },
    pattern: 'BFS over an implicit graph where edges are one-letter-apart words',
    ds: ['graph', 'queue-deque'],
    time: 'O(n · L^2)',
    space: 'O(n · L)',
    edgeCases: [
      'endWord not present in wordList at all',
      'beginWord already one letter away from endWord',
      'wordList containing words not reachable from beginWord at all',
      'beginWord itself appearing in wordList',
    ],
    skills: ['graph-bfs', 'graph-modeling'],
  },
  {
    id: 'statements-b:lc1235',
    lc: 1235,
    title: 'Maximum Profit in Job Scheduling',
    difficulty: 'Hard',
    statement: `You're building a single-worker job scheduler for a freelance platform: the worker can only do one job at a time, each job has a fixed start time, end time, and payout, and overlapping jobs can't both be taken. The platform wants to know the maximum total payout the worker can earn.

We have n jobs, where every job is scheduled to start at startTime[i] and end at endTime[i], obtaining a profit of profit[i].

You're given the startTime, endTime and profit arrays. Return the maximum profit you can take such that there are no two jobs in the subset with overlapping time range. If you choose a job that ends at time X you will be able to start another job that starts at time X.`,
    examples: [
      {
        input: 'startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]',
        output: '120',
        explanation: 'take the job [1,3] with profit 50 and the job [3,6] with profit 70, total 120',
      },
    ],
    constraints: [
      '1 ≤ startTime.length == endTime.length == profit.length ≤ 5·10^4',
      '1 ≤ startTime[i] < endTime[i] ≤ 10^9',
      '1 ≤ profit[i] ≤ 10^4',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'jobScheduling',
      params: [['startTime', 'List[int]'], ['endTime', 'List[int]'], ['profit', 'List[int]']],
      returns: 'int',
    },
    signals: [
      { phrase: 'the worker can only do one job at a time', means: 'selected jobs must be pairwise non-overlapping' },
      { phrase: 'If you choose a job that ends at time X you will be able to start another job that starts at time X', means: "touching endpoints don't count as overlap" },
      { phrase: 'maximum total payout', means: 'optimize sum of profit, not count of jobs' },
      { phrase: 'no two jobs in the subset with overlapping time range', means: 'the overlap constraint applies pairwise across the whole chosen subset' },
    ],
    keyInfo: {
      input: 'startTime, endTime, profit parallel int arrays',
      output: 'int, maximum achievable profit',
      target: 'O(n log n) by sorting on end time and binary-searching the best prior non-overlapping job, since n up to 5·10^4 rules out an O(n^2) pairwise check',
    },
    pattern: 'Sort by end time; DP where dp[i] = max(skip job i, profit[i] + best dp ending ≤ start[i]) via binary search',
    ds: ['array'],
    time: 'O(n log n)',
    space: 'O(n)',
    edgeCases: [
      'all jobs overlap with each other, the best answer is the single highest-profit job',
      'jobs already sorted by end time',
      'a job that starts exactly when another ends, both should be takeable',
      'only one job total',
    ],
    skills: ['dp-1d', 'binary-search', 'greedy'],
  },
  {
    id: 'statements-b:lc76',
    lc: 76,
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    statement: `You're building a text-search feature that, given a long document s and a short required-characters string t, needs to find the shortest contiguous slice of the document that contains every character of t, including repeats, in any order.

Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string.

The testcases will be generated such that the answer is unique.`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'the substring "BANC" includes A, B, and C from string t' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""', explanation: 'both occurrences of a in t must be included, but there is only one a in s' },
    ],
    constraints: [
      'm == s.length',
      'n == t.length',
      '1 ≤ m, n ≤ 10^5',
      's and t consist of uppercase and lowercase English letters',
    ],
    followUp: 'Could you find an algorithm that runs in O(m + n) time?',
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'minWindow',
      params: [['s', 'str'], ['t', 'str']],
      returns: 'str',
    },
    signals: [
      { phrase: 'including repeats, in any order', means: 'match by character counts, not order' },
      { phrase: 'shortest contiguous slice', means: 'window must be a contiguous substring, not any subsequence' },
      { phrase: 'every character in t (including duplicates) is included in the window', means: 'duplicate letters in t each need their own match' },
      { phrase: 'testcases will be generated such that the answer is unique', means: 'no need to handle ties among multiple minimal windows' },
    ],
    keyInfo: {
      input: 'strings s and t',
      output: "shortest substring of s covering t's characters, or empty string",
      target: 'O(m + n) per the follow-up, since checking every substring directly would be O(m^2)',
    },
    pattern: 'Sliding window with a character-count map, expand right then shrink left while still valid',
    ds: ['hashmap'],
    time: 'O(m + n)',
    space: 'O(charset size)',
    edgeCases: [
      't longer than s, answer is the empty string',
      't with duplicate characters requiring multiple copies in the window',
      's equal to t exactly',
      'no valid window exists at all',
    ],
    skills: ['sliding-window', 'arrays-hashing'],
  },
  {
    id: 'statements-b:lc424',
    lc: 424,
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    statement: `You're compressing a log string for storage, and the compression scheme lets you flip up to k characters anywhere in the string to any other character before measuring the longest run of a single repeated character.

You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.`,
    examples: [
      { input: 's = "ABAB", k = 2', output: '4', explanation: "replace the two B's with two A's, or vice versa" },
      { input: 's = "AABABBA", k = 1', output: '4', explanation: 'replace one A in the middle with B, forming "AABBBBA", the substring "BBBB" has length 4' },
    ],
    constraints: [
      '1 ≤ s.length ≤ 10^5',
      's consists of only uppercase English letters',
      '0 ≤ k ≤ s.length',
    ],
    signature: {
      kind: 'function',
      className: 'Solution',
      method: 'characterReplacement',
      params: [['s', 'str'], ['k', 'int']],
      returns: 'int',
    },
    signals: [
      { phrase: 'flip up to k characters anywhere in the string', means: 'window valid if minority-letter count ≤ k' },
      { phrase: 'longest run of a single repeated character', means: 'every character in the window becomes the same letter' },
      { phrase: 'at most k times', means: 'k is an upper bound, using fewer replacements is fine' },
      { phrase: 'choose any character of the string and change it to any other uppercase English character', means: 'replacement can target any position in the window' },
    ],
    keyInfo: {
      input: 'string s, int k',
      output: 'int, longest achievable same-letter run',
      target: 'O(n) with a sliding window, since checking every substring and replacement set directly would be exponential',
    },
    pattern: 'Sliding window tracking the most frequent character count in the window',
    ds: ['hashmap'],
    time: 'O(n)',
    space: 'O(1), fixed 26-letter count',
    edgeCases: [
      'k equal to the full string length, answer is the string length',
      'k is 0, answer is the longest existing run with no changes',
      'a string of a single repeated character',
      'window shrinking without moving the left pointer back (a common bug)',
    ],
    skills: ['sliding-window', 'arrays-hashing'],
  },
]

export default { id: 'statements-b', statements }
