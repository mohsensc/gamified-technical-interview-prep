class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        
        nums[:] = set(nums)
        biggest = 0

        for i in nums:
            counter = 1
            curr = i
            if i-1 not in nums:
                while True:
                    if curr+1 in nums:
                        nums.remove(curr+1)
                        counter += 1
                    else:
                        if counter >= biggest:
                            biggest = counter
                        break
                    curr += 1

        return biggest


