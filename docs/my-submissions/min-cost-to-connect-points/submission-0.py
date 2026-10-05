import heapq

class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n, seen, heap, total = len(points), set(), [(0, 0)], 0

        while len(seen) < n:
            value = heapq.heappop(heap)
            if value[1] in seen:
                continue
            x, y = points[value[1]]
            closest = math.inf
            total += value[0]
            seen.add(value[1])

            for i in range(len(points)):
                if i not in seen:
                    distance = (abs(points[i][0] - x) + abs(points[i][1] - y))
                    if distance < closest:
                        closest = distance
                    heapq.heappush(heap, (distance, i))
        
        return total
        