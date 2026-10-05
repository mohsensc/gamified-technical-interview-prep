class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:

        if not grid:
            return 0
        
        rows, cols, biggest = len(grid), len(grid[0]), 0

        def dfs(row, col):
            if row >= rows or row < 0 or col >= cols or col < 0 or grid[row][col] == 0:
                return 0
            
            grid[row][col] = 0

            return (1 + dfs(row+1, col) + dfs(row, col+1) + dfs(row-1, col) + dfs(row, col-1))
            

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    biggest = max(biggest, dfs(r,c))


        return biggest
        