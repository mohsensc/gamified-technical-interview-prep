class TrieNode:
    def __init__ (self):
        self.child = {}
        self.endOfWord = False

class WordDictionary:

    def __init__(self):
        self.root = TrieNode()
        

    def addWord(self, word: str) -> None:
        node = self.root

        for c in word:
            if c not in node.child:
                node.child[c] = TrieNode()
            node = node.child[c]

        node.endOfWord = True

    def search(self, word: str) -> bool:

        def dfs(j, root):

            node = root

            for i in range(j, len(word)):
                c = word[i]
                if c != ".":
                    if c not in node.child:
                        return False
                    node = node.child[c]
                else:
                    for kid in node.child.values():
                        if dfs(i+1, kid):
                            return True
                    return False
            
            return node.endOfWord

        return dfs(0, self.root)
        
