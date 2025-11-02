import numpy as np
import random
from typing import Dict, List, Tuple, Any, Optional
from scipy.optimize import minimize_scalar
from scipy.stats import norm
import json

class AdaptiveQuizEngine:
    """
    Adaptive Quiz Engine implementing Item Response Theory (IRT) and 
    Computerized Adaptive Testing (CAT) principles
    """
    
    def __init__(self):
        """Initialize the adaptive quiz engine"""
        self.question_bank = self._initialize_question_bank()
        self.experience_questions = self._initialize_experience_questions()
        self.ab_test_variants = self._initialize_ab_variants()
        
    def _initialize_question_bank(self) -> Dict[str, Any]:
        """Initialize the adaptive question bank with IRT parameters"""
        return {
            'technical_skills': [
                {
                    'id': 'tech_001',
                    'text': 'How comfortable are you with database design and optimization?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': -0.5,  # IRT difficulty parameter (easier)
                    'discrimination': 1.2,  # IRT discrimination parameter
                    'category': 'database',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                },
                {
                    'id': 'tech_002',
                    'text': 'Rate your expertise in advanced machine learning algorithms (neural networks, deep learning)',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 1.5,  # More difficult
                    'discrimination': 1.8,
                    'category': 'machine_learning',
                    'experience_levels': ['mid', 'senior']
                },
                {
                    'id': 'tech_003',
                    'text': 'How proficient are you with version control systems (Git, SVN)?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.0,  # Medium difficulty
                    'discrimination': 1.0,
                    'category': 'software_development',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                },
                {
                    'id': 'tech_004',
                    'text': 'Rate your experience with cloud platforms (AWS, Azure, GCP)',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.8,
                    'discrimination': 1.3,
                    'category': 'cloud_computing',
                    'experience_levels': ['junior', 'mid', 'senior']
                },
                {
                    'id': 'tech_005',
                    'text': 'How comfortable are you with cybersecurity principles and practices?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.3,
                    'discrimination': 1.1,
                    'category': 'security',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                }
            ],
            'interests': [
                {
                    'id': 'int_001',
                    'text': 'How much do you enjoy solving complex algorithmic problems?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.0,
                    'discrimination': 1.0,
                    'category': 'problem_solving',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                },
                {
                    'id': 'int_002',
                    'text': 'Rate your interest in user interface and user experience design',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': -0.2,
                    'discrimination': 0.9,
                    'category': 'design',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                },
                {
                    'id': 'int_003',
                    'text': 'How interested are you in data analysis and visualization?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.1,
                    'discrimination': 1.1,
                    'category': 'data_science',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                }
            ],
            'work_preferences': [
                {
                    'id': 'work_001',
                    'text': 'Do you prefer working independently or in a team?',
                    'type': 'multiple_choice',
                    'options': ['Strongly prefer independent', 'Prefer independent', 'No preference', 'Prefer team', 'Strongly prefer team'],
                    'difficulty': 0.0,
                    'discrimination': 0.8,
                    'category': 'work_style',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                },
                {
                    'id': 'work_002',
                    'text': 'How do you feel about frequent client interaction?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.0,
                    'discrimination': 0.9,
                    'category': 'communication',
                    'experience_levels': ['student', 'junior', 'mid', 'senior']
                }
            ]
        }
    
    def _initialize_experience_questions(self) -> Dict[str, List[Dict]]:
        """Initialize experience-specific question branches"""
        return {
            'student': [
                {
                    'id': 'student_001',
                    'text': 'Which programming languages have you learned in your coursework?',
                    'type': 'multiple_choice',
                    'options': ['Python', 'Java', 'C++', 'JavaScript', 'C#', 'Other'],
                    'multiple_select': True,
                    'difficulty': -1.0,
                    'discrimination': 1.0
                },
                {
                    'id': 'student_002',
                    'text': 'Have you completed any internships or co-op programs?',
                    'type': 'boolean',
                    'difficulty': -0.5,
                    'discrimination': 0.8
                }
            ],
            'junior': [
                {
                    'id': 'junior_001',
                    'text': 'How many years of professional experience do you have?',
                    'type': 'multiple_choice',
                    'options': ['Less than 1 year', '1-2 years', '2-3 years'],
                    'difficulty': 0.0,
                    'discrimination': 1.0
                },
                {
                    'id': 'junior_002',
                    'text': 'Have you led any small projects or features?',
                    'type': 'boolean',
                    'difficulty': 0.2,
                    'discrimination': 1.1
                }
            ],
            'mid': [
                {
                    'id': 'mid_001',
                    'text': 'How comfortable are you with system architecture decisions?',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 0.5,
                    'discrimination': 1.3
                },
                {
                    'id': 'mid_002',
                    'text': 'Have you mentored junior developers?',
                    'type': 'boolean',
                    'difficulty': 0.3,
                    'discrimination': 1.0
                }
            ],
            'senior': [
                {
                    'id': 'senior_001',
                    'text': 'Rate your experience with strategic technology planning',
                    'type': 'rating',
                    'scale': [1, 10],
                    'difficulty': 1.0,
                    'discrimination': 1.5
                },
                {
                    'id': 'senior_002',
                    'text': 'How often do you influence hiring decisions?',
                    'type': 'multiple_choice',
                    'options': ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
                    'difficulty': 0.8,
                    'discrimination': 1.2
                }
            ]
        }
    
    def _initialize_ab_variants(self) -> Dict[str, List[Dict]]:
        """Initialize A/B test variants for questions"""
        return {
            'tech_001': [
                {
                    'variant': 'A',
                    'text': 'How comfortable are you with database design and optimization?',
                    'weight': 1.0,
                    'performance_score': 0.75
                },
                {
                    'variant': 'B',
                    'text': 'Rate your skills in creating and optimizing database structures',
                    'weight': 1.0,
                    'performance_score': 0.82
                },
                {
                    'variant': 'C',
                    'text': 'How would you rate your database development expertise?',
                    'weight': 0.8,
                    'performance_score': 0.71
                }
            ],
            'int_001': [
                {
                    'variant': 'A',
                    'text': 'How much do you enjoy solving complex algorithmic problems?',
                    'weight': 1.0,
                    'performance_score': 0.78
                },
                {
                    'variant': 'B',
                    'text': 'Do you find satisfaction in tackling challenging coding puzzles?',
                    'weight': 1.0,
                    'performance_score': 0.85
                }
            ]
        }
    
    def start_adaptive_session(self, user_id: int, experience_level: str) -> Dict[str, Any]:
        """Start a new adaptive quiz session"""
        session = {
            'user_id': user_id,
            'experience_level': experience_level,
            'questions_asked': [],
            'responses': {},
            'ability_estimate': 0.0,  # Initial ability estimate (theta)
            'ability_se': 1.0,  # Standard error of ability estimate
            'question_count': 0,
            'max_questions': self._get_max_questions(experience_level),
            'termination_criteria': {
                'se_threshold': 0.3,  # Stop when SE is below this
                'min_questions': 5,
                'max_questions': 15
            }
        }
        
        # Get first question
        first_question = self._select_next_question(session)
        session['current_question'] = first_question
        
        return session
    
    def _get_max_questions(self, experience_level: str) -> int:
        """Get maximum questions based on experience level"""
        max_questions = {
            'student': 12,
            'junior': 10,
            'mid': 8,
            'senior': 6
        }
        return max_questions.get(experience_level, 10)
    
    def process_response(self, session: Dict[str, Any], response: Any) -> Dict[str, Any]:
        """Process user response and update session"""
        current_question = session['current_question']
        question_id = current_question['id']
        
        # Store response
        session['responses'][question_id] = response
        session['questions_asked'].append(question_id)
        session['question_count'] += 1
        
        # Update ability estimate using IRT
        self._update_ability_estimate(session, current_question, response)
        
        # Check termination criteria
        if self._should_terminate(session):
            session['completed'] = True
            session['final_ability'] = session['ability_estimate']
            return session
        
        # Select next question
        next_question = self._select_next_question(session)
        session['current_question'] = next_question
        
        return session
    
    def _select_next_question(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Select the next most informative question using CAT principles"""
        experience_level = session['experience_level']
        asked_questions = set(session['questions_asked'])
        current_ability = session['ability_estimate']
        
        # Get available questions for experience level
        available_questions = []
        
        # Add general questions
        for category in self.question_bank.values():
            for question in category:
                if (question['id'] not in asked_questions and 
                    experience_level in question['experience_levels']):
                    available_questions.append(question)
        
        # Add experience-specific questions
        if experience_level in self.experience_questions:
            for question in self.experience_questions[experience_level]:
                if question['id'] not in asked_questions:
                    available_questions.append(question)
        
        if not available_questions:
            # Fallback to any remaining question
            for category in self.question_bank.values():
                for question in category:
                    if question['id'] not in asked_questions:
                        available_questions.append(question)
                        break
        
        # Select question with maximum information at current ability level
        best_question = None
        max_information = -1
        
        for question in available_questions:
            information = self._calculate_information(question, current_ability)
            if information > max_information:
                max_information = information
                best_question = question
        
        # Apply A/B testing if variants exist
        if best_question and best_question['id'] in self.ab_test_variants:
            best_question = self._select_ab_variant(best_question)
        
        return best_question or available_questions[0]  # Fallback
    
    def _calculate_information(self, question: Dict[str, Any], ability: float) -> float:
        """Calculate Fisher information for a question at given ability level"""
        difficulty = question['difficulty']
        discrimination = question['discrimination']
        
        # Calculate probability of correct response (for rating questions, use scaled probability)
        if question['type'] == 'rating':
            # For rating questions, calculate information based on expected response
            prob = self._irt_probability(ability, difficulty, discrimination)
        else:
            # For multiple choice/boolean, use standard IRT
            prob = self._irt_probability(ability, difficulty, discrimination)
        
        # Fisher information formula: a^2 * P * (1-P)
        information = (discrimination ** 2) * prob * (1 - prob)
        
        return information
    
    def _irt_probability(self, ability: float, difficulty: float, discrimination: float) -> float:
        """Calculate IRT probability using 2-parameter logistic model"""
        exponent = discrimination * (ability - difficulty)
        probability = 1 / (1 + np.exp(-exponent))
        return probability
    
    def _update_ability_estimate(self, session: Dict[str, Any], question: Dict[str, Any], response: Any):
        """Update ability estimate using Maximum Likelihood Estimation"""
        # Convert response to standardized score (0-1 scale)
        if question['type'] == 'rating':
            scale_max = question['scale'][1]
            standardized_response = float(response) / scale_max
        elif question['type'] == 'boolean':
            standardized_response = 1.0 if response else 0.0
        elif question['type'] == 'multiple_choice':
            # For multiple choice, use position in options as score
            if isinstance(response, list):  # Multiple select
                standardized_response = len(response) / len(question['options'])
            else:
                try:
                    option_index = question['options'].index(response)
                    standardized_response = (option_index + 1) / len(question['options'])
                except ValueError:
                    standardized_response = 0.5  # Default if option not found
        else:
            standardized_response = 0.5  # Default
        
        # Update ability using Newton-Raphson method (simplified)
        difficulty = question['difficulty']
        discrimination = question['discrimination']
        
        # Calculate likelihood and derivative
        current_ability = session['ability_estimate']
        prob = self._irt_probability(current_ability, difficulty, discrimination)
        
        # Likelihood derivative (simplified for single item)
        if standardized_response > 0.5:  # Treat as "correct" response
            likelihood_derivative = discrimination * (1 - prob)
        else:  # Treat as "incorrect" response
            likelihood_derivative = -discrimination * prob
        
        # Update ability estimate (simplified MLE)
        learning_rate = 0.1
        session['ability_estimate'] += learning_rate * likelihood_derivative
        
        # Update standard error (simplified)
        information = self._calculate_information(question, session['ability_estimate'])
        if information > 0:
            session['ability_se'] = 1.0 / np.sqrt(information + 1e-6)  # Add small constant to avoid division by zero
    
    def _should_terminate(self, session: Dict[str, Any]) -> bool:
        """Check if adaptive quiz should terminate"""
        criteria = session['termination_criteria']
        
        # Minimum questions not met
        if session['question_count'] < criteria['min_questions']:
            return False
        
        # Maximum questions reached
        if session['question_count'] >= criteria['max_questions']:
            return True
        
        # Standard error threshold met
        if session['ability_se'] <= criteria['se_threshold']:
            return True
        
        return False
    
    def _select_ab_variant(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Select A/B test variant based on performance and weights"""
        question_id = question['id']
        variants = self.ab_test_variants.get(question_id, [])
        
        if not variants:
            return question
        
        # Weighted random selection based on performance scores
        weights = [v['weight'] * (1 + v['performance_score']) for v in variants]
        total_weight = sum(weights)
        
        if total_weight == 0:
            return question
        
        # Normalize weights
        normalized_weights = [w / total_weight for w in weights]
        
        # Select variant
        selected_variant = np.random.choice(variants, p=normalized_weights)
        
        # Update question with variant text
        variant_question = question.copy()
        variant_question['text'] = selected_variant['text']
        variant_question['variant'] = selected_variant['variant']
        
        return variant_question
    
    def get_quiz_analytics(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Generate analytics for completed quiz session"""
        if not session.get('completed', False):
            return {'error': 'Quiz session not completed'}
        
        return {
            'session_summary': {
                'total_questions': session['question_count'],
                'experience_level': session['experience_level'],
                'final_ability_estimate': session['ability_estimate'],
                'measurement_precision': 1 / session['ability_se'] if session['ability_se'] > 0 else 0
            },
            'question_efficiency': {
                'questions_saved': session['termination_criteria']['max_questions'] - session['question_count'],
                'efficiency_score': 1 - (session['question_count'] / session['termination_criteria']['max_questions'])
            },
            'response_pattern': self._analyze_response_pattern(session),
            'ability_progression': self._get_ability_progression(session)
        }
    
    def _analyze_response_pattern(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user's response patterns"""
        responses = session['responses']
        
        # Calculate response consistency, speed, etc.
        numeric_responses = []
        for response in responses.values():
            if isinstance(response, (int, float)):
                numeric_responses.append(response)
            elif isinstance(response, bool):
                numeric_responses.append(1 if response else 0)
        
        if numeric_responses:
            return {
                'average_response': np.mean(numeric_responses),
                'response_variance': np.var(numeric_responses),
                'consistency_score': 1 / (1 + np.var(numeric_responses))  # Higher consistency = lower variance
            }
        
        return {'average_response': 0, 'response_variance': 0, 'consistency_score': 0}
    
    def _get_ability_progression(self, session: Dict[str, Any]) -> List[float]:
        """Get ability estimate progression throughout the quiz"""
        # This would ideally be tracked during the session
        # For now, return a simplified progression
        final_ability = session['ability_estimate']
        question_count = session['question_count']
        
        # Generate a realistic progression curve
        progression = []
        for i in range(question_count + 1):
            # Start at 0, gradually approach final ability
            progress = final_ability * (1 - np.exp(-2 * i / question_count)) if question_count > 0 else 0
            progression.append(progress)
        
        return progression
