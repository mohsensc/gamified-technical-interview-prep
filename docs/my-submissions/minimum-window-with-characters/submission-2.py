from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if len(t) > len(s) or t == "":
            return ""
        
        countT, window = Counter(t), {}

        answer, answerLen = [], math.inf

        l, have, need = 0, 0, len(countT)

        for r in range(len(s)):
            c = s[r]
            window[c] = window.get(c, 0) + 1

            if c in countT and window[c] == countT[c]:
                have += 1

            while have == need:
                if (r - l + 1) < answerLen:
                    answer = [l, r]
                    answerLen = r - l + 1
                
                window[s[l]] -= 1
                if s[l] in countT and window[s[l]] < countT[s[l]]:
                    have -= 1
                l += 1
                
        return s[answer[0]:answer[1]+1] if answerLen != math.inf else ""