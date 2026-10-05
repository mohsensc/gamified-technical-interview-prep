class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        
        if amount == 0:
            return 0

        setCoins = set(coins)
        
        coinCount = {}

        for i in range(0,amount+1):
            coinCount[i] = math.inf

            if i in setCoins:
                coinCount[i] = 1
            
            for c in coins: 
                if i - c >= 0:
                    coinCount[i] = min(coinCount[i], 1 + coinCount[i-c])
        
        return coinCount[amount] if coinCount[amount] != math.inf else -1