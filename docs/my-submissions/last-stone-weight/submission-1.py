import heapq

class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:

        heap = [-i for i in stones]

        heapq.heapify(heap)

        while len(heap) > 1:
            a = heapq.heappop(heap) * -1
            b = heapq.heappop(heap) * -1
            result = a-b
            if result > 0:
                heapq.heappush(heap, (result * -1))
            
        return heap[0] * -1 if heap else 0