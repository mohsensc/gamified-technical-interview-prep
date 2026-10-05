class Solution:
    def foreignDictionary(self, words: List[str]) -> str:
        adj = {c: set() for w in words for c in w}

        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i + 1]
            n = min(len(w1), len(w2))

            if len(w1) > len(w2) and w1[:n] == w2[:n]:
                return ""

            for j in range(n):
                if w1[j] != w2[j]:
                    adj[w1[j]].add(w2[j])
                    break

        seen, res = {}, []

        def dfs(c):
            if c in seen:
                return seen[c]

            seen[c] = True
            for nei in adj[c]:
                if dfs(nei):
                    return True
            seen[c] = False

            res.append(c)
            return False

        for c in adj:
            if dfs(c):
                return ""

        return "".join(res[::-1])
        
        