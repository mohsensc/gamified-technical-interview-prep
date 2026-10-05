class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0": return "0"

        res = [0] * (len(num1) + len(num2))
        num1, num2 = num1[::-1], num2[::-1]

        for i in range(len(num1)):
            for j in range(len(num2)):
                digit = int(num1[i]) * int(num2[j])
                res[i + j] += digit
                res[i + j+ 1] += res[i + j] // 10
                res[i + j] = res[i + j] % 10

        res = res[::-1]

        if res[0] == 0: res = res[1:]

        return "".join(map(str, res))

        