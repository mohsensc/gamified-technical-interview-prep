class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        
        if not grid:
            return 0

        rows, cols, visited = len(grid), len(grid[0]), 0

        def dfs(row, col):
            grid[row][col] = "0"

            if (row + 1) < rows and grid[row+1][col] == "1":
                dfs(row+1, col)
            if (row-1) >= 0 and grid[row-1][col] == "1":
                dfs(row-1, col)
            if (col + 1) < cols and grid[row][col+1] == "1":
                dfs(row, col+1)
            if (col-1) >= 0 and grid[row][col-1] == "1":
                dfs(row, col-1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    dfs(r,c)
                    visited += 1

        
        return visited