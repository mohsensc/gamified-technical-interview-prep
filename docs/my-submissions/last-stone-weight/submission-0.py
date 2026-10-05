import heapq

class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:

        heap = []

        for i in stones:
            heap.append(i * -1)

        heapq.heapify(heap)

        while heap:
            if len(heap) == 1:
                return (heap[0] * -1)
            a = heapq.heappop(heap) * -1
            b = heapq.heappop(heap) * -1
            result = a-b
            if result > 0:
                heapq.heappush(heap, (result * -1))
            
        return 0