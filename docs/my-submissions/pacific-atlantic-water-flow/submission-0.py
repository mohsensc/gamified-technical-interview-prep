class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])
        pac, atl, answers = set(), set(), []

        def dfs(row, col, oceanSet, prevHeight):
            if (row,col) in oceanSet or row < 0 or row >= rows or col < 0 or col >= cols or heights[row][col] < prevHeight:
                return
            oceanSet.add((row,col)) 
            dfs(row+1, col, oceanSet, heights[row][col])
            dfs(row-1, col, oceanSet, heights[row][col])
            dfs(row, col+1, oceanSet, heights[row][col])
            dfs(row, col-1, oceanSet, heights[row][col])


        for r in range(rows):
            dfs(r, 0, pac, heights[r][0])
            dfs(r, cols-1, atl, heights[r][cols-1])
        
        for c in range(cols):
            dfs(0, c, pac, heights[0][c])
            dfs(rows-1, c, atl, heights[rows-1][c])

        for r in range(rows):
            for c in range(cols):
                if (r,c) in pac and (r,c) in atl:
                    answers.append([r,c])
        
        return answers