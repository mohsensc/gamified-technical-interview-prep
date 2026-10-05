class CountSquares:

    def __init__(self):
        self.points = {}

    def add(self, point: List[int]) -> None:
        x, y = point[0], point[1]
        self.points[(x,y)] = self.points.get((x,y), 0) + 1

    def count(self, point: List[int]) -> int:

        x, y, total = point[0], point[1], 0

        for (px, py), val in list(self.points.items()):
            if abs(px-x) != abs(py-y) or px == x:
                continue
            total += val * self.points.get((x, py), 0) * self.points.get((px, y), 0)

        return total
        
        
