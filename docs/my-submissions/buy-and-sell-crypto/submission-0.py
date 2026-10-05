class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        
        lowestPrice = prices[0]
        maxProfit = 0

        for i in prices:
            profit = i - lowestPrice
            if profit > maxProfit: maxProfit = profit
            if i < lowestPrice: lowestPrice = i
        
        return maxProfit
