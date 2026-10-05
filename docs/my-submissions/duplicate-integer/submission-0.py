class Solution:
    def hasDuplicate(self, nums: List[int]) -> bool:
        
        duplicates = set()

        for i in nums:
            if i in duplicates:
                return True
            duplicates.add(i)

        return False