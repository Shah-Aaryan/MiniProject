"""
Skill Assessments Engine
Timed micro-challenges with plagiarism and LLM-assist detection
"""
import re
import hashlib
from typing import Dict, List, Any
from datetime import datetime, timedelta

class AssessmentEngine:
    """Assessment engine with plagiarism detection"""
    
    def __init__(self):
        self.llm_patterns = self._initialize_llm_patterns()
        self.plagiarism_threshold = 0.85  # 85% similarity threshold
    
    def _initialize_llm_patterns(self) -> List[str]:
        """Initialize patterns that indicate LLM assistance"""
        return [
            r'here.*(?:i|we|let me|i will|i can|to answer|to solve)',
            r'certainly|absolutely|definitely|undoubtedly',
            r'following.*(?:approach|solution|method)',
            r'let.*break.*down',
            r'first.*second.*third',
            r'analyzing.*given.*problem',
            r'step.*by.*step',
            r'key.*points.*to.*consider',
            r'important.*note|note.*that',
            r'conclusion.*summary',
            r'(?:here|there).*(?:solution|answer|code|implementation)',
            r'(?:i|we).*(?:can|will|should).*(?:see|note|observe)',
            r'(?:this|these).*(?:approach|method|solution|technique)',
            r'(?:allows|enables|ensures).*(?:us|you|the)',
            r'(?:similarly|likewise|additionally|furthermore|moreover)',
            r'(?:in.*conclusion|to.*summarize|in.*summary)',
            r'as.*an.*ai|i.*am.*ai|as.*a.*language.*model',
            r'(?:great|excellent|perfect|ideal).*(?:question|problem|scenario)',
            r'(?:i.*hope|i.*trust|i.*believe).*(?:helps|useful|clear)',
            r'begin.*by|start.*by|first.*we|initially'
        ]
    
    def check_plagiarism(self, user_answer: str, reference_sources: List[str] = None) -> Dict[str, Any]:
        """Check for plagiarism in user's answer"""
        if not user_answer:
            return {
                'plagiarism_score': 0.0,
                'is_plagiarized': False,
                'similarity_sources': [],
                'confidence': 0.0
            }
        
        plagiarism_score = 0.0
        similarity_sources = []
        
        # Check against reference sources if provided
        if reference_sources:
            for source in reference_sources:
                similarity = self._calculate_similarity(user_answer, source)
                if similarity > self.plagiarism_threshold:
                    similarity_sources.append({
                        'source': source[:100] + '...' if len(source) > 100 else source,
                        'similarity': similarity
                    })
                    plagiarism_score = max(plagiarism_score, similarity)
        
        # Check for exact copy-paste patterns
        copy_paste_patterns = self._detect_copy_paste(user_answer)
        if copy_paste_patterns:
            plagiarism_score = max(plagiarism_score, 0.9)
        
        is_plagiarized = plagiarism_score > self.plagiarism_threshold
        
        return {
            'plagiarism_score': plagiarism_score,
            'is_plagiarized': is_plagiarized,
            'similarity_sources': similarity_sources,
            'copy_paste_detected': len(copy_paste_patterns) > 0,
            'confidence': plagiarism_score,
            'warnings': self._generate_plagiarism_warnings(plagiarism_score, similarity_sources)
        }
    
    def detect_llm_assist(self, user_answer: str) -> Dict[str, Any]:
        """Detect if answer was generated with LLM assistance"""
        if not user_answer:
            return {
                'llm_assist_detected': False,
                'confidence': 0.0,
                'indicators': [],
                'pattern_matches': 0
            }
        
        pattern_matches = 0
        indicators = []
        
        answer_lower = user_answer.lower()
        
        # Check for LLM patterns
        for pattern in self.llm_patterns:
            matches = len(re.findall(pattern, answer_lower, re.IGNORECASE))
            if matches > 0:
                pattern_matches += matches
                indicators.append({
                    'pattern': pattern,
                    'matches': matches,
                    'severity': 'high' if matches > 2 else 'medium'
                })
        
        # Calculate confidence
        total_patterns = len(self.llm_patterns)
        match_ratio = pattern_matches / total_patterns if total_patterns > 0 else 0
        
        # Higher confidence if multiple patterns match
        confidence = min(1.0, match_ratio * 2)
        
        # Additional checks
        structure_score = self._check_structure_indicators(user_answer)
        confidence = max(confidence, structure_score)
        
        llm_assist_detected = confidence > 0.6 or pattern_matches > 5
        
        return {
            'llm_assist_detected': llm_assist_detected,
            'confidence': confidence,
            'indicators': indicators[:10],  # Top 10 indicators
            'pattern_matches': pattern_matches,
            'structure_indicators': structure_score > 0.5,
            'warnings': self._generate_llm_warnings(llm_assist_detected, confidence, indicators)
        }
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        # Simple similarity using word overlap
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union) if union else 0.0
        
        # Also check for substring matches (for code)
        if len(text1) > 50 and len(text2) > 50:
            # Check for long common substrings
            common_length = self._longest_common_substring(text1, text2)
            substring_similarity = (common_length * 2) / (len(text1) + len(text2))
            similarity = max(similarity, substring_similarity)
        
        return similarity
    
    def _longest_common_substring(self, s1: str, s2: str) -> int:
        """Find longest common substring length"""
        m = len(s1)
        n = len(s2)
        max_len = 0
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                    max_len = max(max_len, dp[i][j])
        
        return max_len
    
    def _detect_copy_paste(self, text: str) -> List[str]:
        """Detect copy-paste patterns"""
        patterns = []
        
        # Check for formatting artifacts
        formatting_artifacts = [
            r'\[.*?\]',  # Markdown links
            r'<a.*?>.*?</a>',  # HTML links
            r'http[s]?://',  # URLs
            r'```[\s\S]*?```',  # Code blocks
        ]
        
        for pattern in formatting_artifacts:
            matches = re.findall(pattern, text)
            if matches:
                patterns.extend(matches)
        
        # Check for suspiciously perfect formatting
        if text.count('\n') > text.count('.') * 2:
            patterns.append('Suspicious formatting')
        
        return patterns
    
    def _check_structure_indicators(self, text: str) -> float:
        """Check for structural indicators of LLM-generated content"""
        score = 0.0
        
        # Check for overly structured content
        structure_patterns = [
            r'(?:1\.|2\.|3\.)',  # Numbered lists
            r'(?:first|second|third|finally)',
            r'(?:in conclusion|to summarize|in summary)',
        ]
        
        for pattern in structure_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                score += 0.15
        
        # Check for length (LLM often generates longer responses)
        if len(text) > 500:
            score += 0.1
        
        # Check for perfect grammar/completeness
        if text.count('...') == 0 and len(text.split('.')) > 3:
            score += 0.1
        
        return min(1.0, score)
    
    def _generate_plagiarism_warnings(self, score: float, sources: List[Dict]) -> List[str]:
        """Generate plagiarism warnings"""
        warnings = []
        
        if score > 0.9:
            warnings.append("High similarity detected - answer appears to be copied")
        elif score > 0.75:
            warnings.append("Moderate similarity detected - ensure original work")
        
        if sources:
            warnings.append(f"Similar content found in {len(sources)} source(s)")
        
        return warnings
    
    def _generate_llm_warnings(self, detected: bool, confidence: float, indicators: List[Dict]) -> List[str]:
        """Generate LLM assist warnings"""
        warnings = []
        
        if detected:
            warnings.append(f"LLM assistance detected with {confidence*100:.1f}% confidence")
            
            if indicators:
                high_severity = [ind for ind in indicators if ind['severity'] == 'high']
                if high_severity:
                    warnings.append(f"{len(high_severity)} high-confidence indicators found")
        else:
            if confidence > 0.4:
                warnings.append("Some indicators of AI assistance found, but below threshold")
        
        return warnings
    
    def grade_assessment(self, user_answers: Dict[str, Any], correct_answers: Dict[str, Any], assessment_type: str) -> Dict[str, Any]:
        """Grade an assessment"""
        total_score = 0.0
        max_score = 0.0
        question_scores = {}
        
        if assessment_type == 'mcq':
            for question_id, user_answer in user_answers.items():
                correct_answer = correct_answers.get(question_id)
                max_score += 1
                
                if user_answer == correct_answer:
                    score = 1.0
                    total_score += 1.0
                else:
                    score = 0.0
                
                question_scores[question_id] = {
                    'user_answer': user_answer,
                    'correct_answer': correct_answer,
                    'score': score,
                    'max_score': 1.0
                }
        
        elif assessment_type == 'coding':
            # Code assessment requires more complex grading
            for question_id, user_code in user_answers.items():
                test_cases = correct_answers.get(question_id, {}).get('test_cases', [])
                max_score += len(test_cases)
                
                passed_tests = 0
                for test_case in test_cases:
                    # In production, execute code and test
                    # For now, use placeholder logic
                    if self._test_code(user_code, test_case):
                        passed_tests += 1
                        total_score += 1.0
                
                question_scores[question_id] = {
                    'passed_tests': passed_tests,
                    'total_tests': len(test_cases),
                    'score': passed_tests,
                    'max_score': len(test_cases)
                }
        
        percentage_score = (total_score / max_score * 100) if max_score > 0 else 0
        
        return {
            'total_score': total_score,
            'max_score': max_score,
            'percentage_score': percentage_score,
            'question_scores': question_scores,
            'passed': percentage_score >= 70,  # 70% passing threshold
            'grade': self._calculate_grade(percentage_score)
        }
    
    def _test_code(self, user_code: str, test_case: Dict) -> bool:
        """Test user code against test case"""
        # In production, this would execute the code safely
        # For now, return placeholder
        return False
    
    def _calculate_grade(self, percentage: float) -> str:
        """Calculate letter grade"""
        if percentage >= 90:
            return 'A'
        elif percentage >= 80:
            return 'B'
        elif percentage >= 70:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'

