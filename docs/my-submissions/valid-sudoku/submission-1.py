from collections import defaultdict as dd

class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows, cols, squares = dd(set), dd(set), dd(set)

        for i in range(9):
            for j in range(9):
                value = board[i][j]

                if value == ".":
                    continue

                if (value in rows[i] or value in cols[j] or value in squares[(i//3,j//3)]):
                    return False
                rows[i].add(value)
                cols[j].add(value)
                squares[(i//3,j//3)].add(value)
        
        return True