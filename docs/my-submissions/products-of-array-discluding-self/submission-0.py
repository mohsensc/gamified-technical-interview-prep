class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:

        output = [1 for _ in range(len(nums))]

        for i in range(1, len(nums)):
            output[i] = output[i-1] * nums[i-1]
        
        suffix = 1
        for i in range(len(nums)-2, -1, -1):
            suffix *= nums[i+1]
            output[i] *= suffix
        
        return output


        
        