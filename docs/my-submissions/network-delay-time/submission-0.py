import heapq

class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:

        nodes = {i: [] for i in range(1, n+1)}

        for u, v, w in times:
            nodes[u].append([v, w])
        
        seen = set()
        heap = [(0, k)]
        t = 0

        while heap:
            length, node = heapq.heappop(heap)
            if node in seen:
                continue
            seen.add(node)
            t = max(t, length)

            for n1, w in nodes[node]:
                if n1 not in seen:
                    heapq.heappush(heap, (length + w, n1))
        
        return t if len(seen) == n else -1



        