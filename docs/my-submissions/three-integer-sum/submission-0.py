class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        starts = set()
        answers = []

        for i in range(len(nums)-2):
            target = 0 - nums[i]
            if target not in starts:
                starts.add(target)
                left = i+1
                right = len(nums) - 1

                while left < right:
                    total = nums[left] + nums[right]
                    if total == target:
                        answers.append([nums[i], nums[left], nums[right]])
                        left += 1
                        right -= 1
                        while left < right and nums[left] == nums[left-1]:
                            left += 1
                    elif total > target:
                        right -= 1
                    else:
                        left += 1
        
        return answers
                    
