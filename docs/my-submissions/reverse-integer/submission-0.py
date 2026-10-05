class Solution:
    def reverse(self, x: int) -> int:
        val = x
        x = abs(x)
        result = int(str(x)[::-1])

        result = -result if val < 0 else result
        return 0 if result < -(1 << 31) or result > (1 << 31) - 1 else result