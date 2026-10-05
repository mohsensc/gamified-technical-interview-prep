class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        
        setnums = set(nums)
        biggest = 0

        for i in setnums:
            counter = 1
            curr = i
            if i-1 not in setnums:
                while True:
                    if curr+1 in setnums:
                        counter += 1
                    else:
                        if counter >= biggest:
                            biggest = counter
                        break
                    curr += 1

        return biggest


