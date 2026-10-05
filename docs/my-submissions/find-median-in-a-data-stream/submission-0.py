import bisect

class MedianFinder:

    def __init__(self):
        self.arr = []

    def addNum(self, num: int) -> None:
        bisect.insort(self.arr, num)

    def findMedian(self) -> float:
        length = len(self.arr)
        if length % 2 == 0:
            return (self.arr[length//2] + self.arr[(length//2)-1]) / 2
        
        return self.arr[length//2]
        
        