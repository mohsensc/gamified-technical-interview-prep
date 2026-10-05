class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:

        zeroCols = set()
        zeroRows = set()
        
        for i in range(len(matrix)):
            for j in range(len(matrix[0])):
                if matrix[i][j] == 0:
                    zeroCols.add(j)
                    zeroRows.add(i)

        for i in range(len(matrix)):
            for j in range(len(matrix[0])):
                if i in zeroRows or j in zeroCols:
                    matrix[i][j] = 0
