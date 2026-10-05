class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:

        if prerequisites == []:
            return True

        courses = {i:[] for i in range(numCourses)}
        seen = set()

        for course, prereq in prerequisites:
            courses[course] = courses.get(course, []) + [prereq]
        
        print(courses)
        
        def dfs(currCourse):
            if currCourse in seen:
                return False
            if courses[currCourse] == []:
                return True
            
            seen.add(currCourse)

            for pre in courses[currCourse]:
                if not dfs(pre):
                    return False
            
            seen.remove(currCourse)
            courses[currCourse] = []
            
            return True
            
        for c in range(numCourses):
            if not dfs(c):
                return False
        return True