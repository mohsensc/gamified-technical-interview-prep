class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:

        if nums == []:
            return [[]]

        result = []

        perms = self.permute(nums[1:])

        for p in perms:
            for i in range(len(p)+1):
                copy = p.copy()
                copy.insert(i, nums[0])
                result.append(copy)
        
        return result