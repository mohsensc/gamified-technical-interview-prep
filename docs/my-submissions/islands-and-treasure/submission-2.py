class Solution:
    def islandsAndTreasure(self, grid: List[List[int]]) -> None:

        m, n = len(grid), len(grid[0])

        treasure = collections.deque()

        for i in range(m):
            for j in range(n):
                if grid[i][j] == 0:
                    treasure.append([i,j])

        while treasure:
            r,c = treasure.popleft()
            d = grid[r][c] + 1

            for row, col in [(r+1,c), (r-1,c), (r,c+1), (r,c-1)]:
                if 0 <= row < m and 0 <= col < n and grid[row][col] == 2147483647:
                    grid[row][col] = d
                    treasure.append((row, col))
                