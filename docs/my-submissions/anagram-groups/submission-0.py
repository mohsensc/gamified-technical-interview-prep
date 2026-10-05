class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        
        answers = {}

        for i in strs:
            counted = frozenset((Counter(i).items()))

            if counted in answers:
                answers[counted] += [i]
            else:
                answers[counted] = [i]
        
        returning = []

        for k in answers:
            returning.append(answers[k]) 
        
        return returning