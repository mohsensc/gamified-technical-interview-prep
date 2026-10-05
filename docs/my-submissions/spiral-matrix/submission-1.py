class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:

        output = [matrix[0][0]]
        visited = set([(0,0)])
        
        m, n = len(matrix), len(matrix[0])

        i = j = 0

        while len(output) < (m * n):
            # right
            while j+1 < n and (i,j+1) not in visited:
                j += 1
                visited.add((i,j))
                output.append(matrix[i][j])

            # down
            while i+1 < m and (i+1,j) not in visited:
                i += 1
                visited.add((i,j))
                output.append(matrix[i][j])

            # left
            while j-1 >= 0 and (i,j-1) not in visited:
                j -= 1
                visited.add((i,j))
                output.append(matrix[i][j])

            # up
            while i-1 >= 0 and (i-1,j) not in visited:
                i -= 1
                visited.add((i,j))
                output.append(matrix[i][j])
        
        return output