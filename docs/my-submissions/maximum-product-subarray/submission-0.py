class Solution:
    def maxProduct(self, nums: List[int]) -> int:

        maxArray = [nums[0]]
        minArray = [nums[0]]
        maxVal = nums[0]

        for i in range(1, len(nums)):
            maxArray.append(max(nums[i], maxArray[i-1]*nums[i], minArray[i-1]*nums[i]))
            minArray.append(min(nums[i], maxArray[i-1]*nums[i], minArray[i-1]*nums[i]))

            if maxArray[i] > maxVal: maxVal = maxArray[i]

        return maxVal

        