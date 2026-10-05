class Solution:
    def search(self, nums: List[int], target: int) -> int:

        left, right = 0, len(nums) - 1

        if nums[0] == target:
                return 0

        while left < right:
            if nums[left] == target:
                return left
            if nums[right] == target:
                return right

            mid = (right + left) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] > target:
                right = mid
            else:
                left = mid + 1
        
        return -1