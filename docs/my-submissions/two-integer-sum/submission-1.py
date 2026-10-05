class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        
        dicts = {}

        for i in range(len(nums)):
            minus = target - nums[i]

            index = dicts.get(minus, math.inf)
            
            if index != math.inf:
                return [index, i]
            
            dicts[nums[i]] = i
        
        return ("Didn't work")
        