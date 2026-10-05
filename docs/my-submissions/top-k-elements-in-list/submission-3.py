from collections import Counter

class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:

        counted = Counter(nums).items()

        buckets = [[] for _ in range(len(nums) + 1)]
        for digit, freq in counted:
            buckets[freq].append(digit)
        
        answers = []

        for i in range(len(buckets)-1, 0, -1):
            for num in buckets[i]:
                answers.append(num)
                k -= 1
                if k == 0:
                    return answers
