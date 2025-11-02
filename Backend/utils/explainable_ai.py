import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.calibration import calibration_curve
import joblib
import os
from typing import Dict, List, Tuple, Any

class ExplainableAI:
    """
    Advanced ML utilities for explainable AI features including:
    - Feature importance analysis
    - Counterfactual explanations
    - Model calibration analysis
    """
    
    def __init__(self, model_path: str = None):
        """Initialize with trained model"""
        if model_path:
            self.model = joblib.load(model_path)
        else:
            # Default model path
            model_path = os.path.join(os.path.dirname(__file__), '../ml_models/dtmodel.pkl')
            self.model = joblib.load(model_path)
        
        # Feature names mapping
        self.feature_names = [
            'Database Fundamentals', 'Computer Architecture', 'Distributed Computing',
            'Cyber Security', 'Networking', 'Software Development', 'Programming Skills',
            'Project Management', 'Computer Forensics', 'Autonomous Systems',
            'Machine Learning', 'Information Systems', 'Software Engineering',
            'Business Analysis', 'Communication Skills', 'Data Science',
            'Troubleshooting', 'Graphics Designing', 'Technical Writing'
        ]
        
        # Career role mapping
        self.job_role_mapping = {
            0: 'Applications Developer',
            1: 'CRM Technical Developer', 
            2: 'Database Developer',
            3: 'Mobile Applications Developer',
            4: 'Network Security Engineer',
            5: 'Software Developer',
            6: 'Software Engineer',
            7: 'Software Quality Assurance (QA) / Testing',
            8: 'Systems Security Administrator',
            9: 'Technical Support',
            10: 'UX Designer',
            11: 'Web Developer'
        }

    def get_feature_importance(self, user_responses: List[float], prediction: int) -> Dict[str, Any]:
        """
        Calculate feature importance for a specific user's prediction
        
        Args:
            user_responses: List of user's quiz responses
            prediction: Predicted career role (numeric)
            
        Returns:
            Dictionary containing feature importance analysis
        """
        try:
            # Convert responses to numpy array
            X_user = np.array(user_responses).reshape(1, -1)
            
            # Get prediction probabilities for all classes
            probabilities = self.model.predict_proba(X_user)[0]
            
            # Calculate feature importance using permutation importance
            # We'll use a small dataset around the user's responses for efficiency
            X_synthetic = self._generate_synthetic_data_around_user(user_responses, n_samples=100)
            y_synthetic = self.model.predict(X_synthetic)
            
            # Calculate permutation importance
            perm_importance = permutation_importance(
                self.model, X_synthetic, y_synthetic, 
                n_repeats=10, random_state=42
            )
            
            # Create feature importance dictionary
            feature_importance = {}
            for i, feature_name in enumerate(self.feature_names):
                importance_score = perm_importance.importances_mean[i]
                user_value = user_responses[i]
                
                feature_importance[feature_name] = {
                    'importance_score': float(importance_score),
                    'user_value': float(user_value),
                    'impact_level': self._categorize_impact(importance_score),
                    'explanation': self._generate_feature_explanation(
                        feature_name, user_value, importance_score, prediction
                    )
                }
            
            # Sort by importance score
            sorted_features = sorted(
                feature_importance.items(), 
                key=lambda x: x[1]['importance_score'], 
                reverse=True
            )
            
            return {
                'predicted_role': self.job_role_mapping[prediction],
                'confidence': float(probabilities[prediction]),
                'feature_importance': dict(sorted_features[:10]),  # Top 10 features
                'top_contributing_factors': [
                    {
                        'feature': feature,
                        'score': data['importance_score'],
                        'explanation': data['explanation']
                    }
                    for feature, data in sorted_features[:5]
                ]
            }
            
        except Exception as e:
            return {'error': f'Feature importance calculation failed: {str(e)}'}

    def generate_counterfactual_tips(self, user_responses: List[float], 
                                   target_role: str = None) -> List[Dict[str, Any]]:
        """
        Generate counterfactual explanations - what changes would lead to different predictions
        
        Args:
            user_responses: Current user responses
            target_role: Desired target role (optional)
            
        Returns:
            List of counterfactual suggestions
        """
        try:
            current_prediction = self.model.predict([user_responses])[0]
            current_probabilities = self.model.predict_proba([user_responses])[0]
            
            counterfactual_tips = []
            
            # If target role specified, focus on that
            if target_role:
                target_class = self._get_role_class(target_role)
                if target_class is not None:
                    tips = self._generate_tips_for_target(user_responses, target_class)
                    counterfactual_tips.extend(tips)
            else:
                # Generate tips for top 3 alternative roles
                sorted_probs = sorted(enumerate(current_probabilities), key=lambda x: x[1], reverse=True)
                for class_idx, prob in sorted_probs[1:4]:  # Skip current prediction
                    tips = self._generate_tips_for_target(user_responses, class_idx)
                    counterfactual_tips.extend(tips)
            
            # Sort by impact potential
            counterfactual_tips.sort(key=lambda x: x['impact_score'], reverse=True)
            
            return counterfactual_tips[:10]  # Return top 10 tips
            
        except Exception as e:
            return [{'error': f'Counterfactual generation failed: {str(e)}'}]

    def calculate_calibration_data(self, user_responses: List[float]) -> Dict[str, Any]:
        """
        Calculate model calibration data for confidence visualization
        
        Args:
            user_responses: User's quiz responses
            
        Returns:
            Calibration plot data and reliability metrics
        """
        try:
            # Generate synthetic data for calibration analysis
            X_synthetic = self._generate_synthetic_data_around_user(user_responses, n_samples=1000)
            y_true = self.model.predict(X_synthetic)
            y_prob = self.model.predict_proba(X_synthetic)
            
            # Calculate calibration curve for each class
            calibration_data = {}
            
            for class_idx, role_name in self.job_role_mapping.items():
                if class_idx < y_prob.shape[1]:  # Ensure class exists
                    y_binary = (y_true == class_idx).astype(int)
                    prob_true, prob_pred = calibration_curve(
                        y_binary, y_prob[:, class_idx], n_bins=10
                    )
                    
                    calibration_data[role_name] = {
                        'prob_true': prob_true.tolist(),
                        'prob_pred': prob_pred.tolist(),
                        'reliability_score': self._calculate_reliability_score(prob_true, prob_pred)
                    }
            
            # User-specific prediction confidence
            user_prediction = self.model.predict([user_responses])[0]
            user_probabilities = self.model.predict_proba([user_responses])[0]
            
            return {
                'calibration_curves': calibration_data,
                'user_prediction': {
                    'role': self.job_role_mapping[user_prediction],
                    'confidence': float(user_probabilities[user_prediction]),
                    'all_probabilities': {
                        role: float(prob) 
                        for role, prob in zip(self.job_role_mapping.values(), user_probabilities)
                    }
                },
                'confidence_bands': self._generate_confidence_bands(user_probabilities)
            }
            
        except Exception as e:
            return {'error': f'Calibration calculation failed: {str(e)}'}

    def _generate_synthetic_data_around_user(self, user_responses: List[float], 
                                           n_samples: int = 100) -> np.ndarray:
        """Generate synthetic data points around user's responses for analysis"""
        user_array = np.array(user_responses)
        
        # Add noise to create variations
        noise_std = 0.5  # Standard deviation for noise
        synthetic_data = []
        
        for _ in range(n_samples):
            # Add random noise to each feature
            noisy_response = user_array + np.random.normal(0, noise_std, len(user_array))
            
            # Clip values to valid ranges (assuming 0-10 scale for most features)
            noisy_response = np.clip(noisy_response, 0, 10)
            
            # Handle categorical features (questions 7 and 8)
            if len(noisy_response) >= 7:
                noisy_response[6] = user_array[6]  # Keep question 7 unchanged
            if len(noisy_response) >= 8:
                noisy_response[7] = user_array[7]  # Keep question 8 unchanged
                
            synthetic_data.append(noisy_response)
        
        return np.array(synthetic_data)

    def _categorize_impact(self, importance_score: float) -> str:
        """Categorize feature importance into impact levels"""
        if importance_score > 0.1:
            return 'High'
        elif importance_score > 0.05:
            return 'Medium'
        else:
            return 'Low'

    def _generate_feature_explanation(self, feature_name: str, user_value: float, 
                                    importance_score: float, prediction: int) -> str:
        """Generate human-readable explanation for feature importance"""
        role_name = self.job_role_mapping[prediction]
        impact_level = self._categorize_impact(importance_score)
        
        explanations = {
            'High': f"Your {feature_name} score ({user_value}/10) is a major factor in predicting {role_name}. This skill strongly influences the recommendation.",
            'Medium': f"Your {feature_name} score ({user_value}/10) moderately contributes to the {role_name} prediction.",
            'Low': f"Your {feature_name} score ({user_value}/10) has minimal impact on the {role_name} prediction."
        }
        
        return explanations.get(impact_level, "This feature contributes to your career prediction.")

    def _get_role_class(self, role_name: str) -> int:
        """Get numeric class for role name"""
        for class_idx, name in self.job_role_mapping.items():
            if name.lower() == role_name.lower():
                return class_idx
        return None

    def _generate_tips_for_target(self, user_responses: List[float], 
                                target_class: int) -> List[Dict[str, Any]]:
        """Generate specific tips to move toward target role"""
        tips = []
        
        # Test each feature modification
        for feature_idx, feature_name in enumerate(self.feature_names):
            current_value = user_responses[feature_idx]
            
            # Skip categorical features
            if feature_idx in [6, 7]:  # Questions 7 and 8 are categorical
                continue
            
            # Test increasing the feature value
            modified_responses = user_responses.copy()
            modified_responses[feature_idx] = min(10, current_value + 2)
            
            new_prediction = self.model.predict([modified_responses])[0]
            new_probabilities = self.model.predict_proba([modified_responses])[0]
            
            if new_prediction == target_class or new_probabilities[target_class] > 0.3:
                improvement = new_probabilities[target_class] - self.model.predict_proba([user_responses])[0][target_class]
                
                tips.append({
                    'feature': feature_name,
                    'current_value': current_value,
                    'suggested_value': modified_responses[feature_idx],
                    'target_role': self.job_role_mapping[target_class],
                    'impact_score': improvement,
                    'tip': f"Improve your {feature_name} skills from {current_value}/10 to {modified_responses[feature_idx]}/10 to increase your chances for {self.job_role_mapping[target_class]} by {improvement*100:.1f}%"
                })
        
        return tips

    def _calculate_reliability_score(self, prob_true: np.ndarray, prob_pred: np.ndarray) -> float:
        """Calculate reliability score for calibration"""
        if len(prob_true) == 0 or len(prob_pred) == 0:
            return 0.0
        
        # Calculate Expected Calibration Error (ECE)
        ece = np.mean(np.abs(prob_true - prob_pred))
        reliability_score = max(0, 1 - ece)  # Convert to 0-1 scale
        
        return float(reliability_score)

    def _generate_confidence_bands(self, probabilities: np.ndarray) -> Dict[str, Any]:
        """Generate confidence bands for visualization"""
        sorted_probs = sorted(enumerate(probabilities), key=lambda x: x[1], reverse=True)
        
        return {
            'high_confidence': [
                {'role': self.job_role_mapping[idx], 'probability': float(prob)}
                for idx, prob in sorted_probs if prob > 0.7
            ],
            'medium_confidence': [
                {'role': self.job_role_mapping[idx], 'probability': float(prob)}
                for idx, prob in sorted_probs if 0.3 <= prob <= 0.7
            ],
            'low_confidence': [
                {'role': self.job_role_mapping[idx], 'probability': float(prob)}
                for idx, prob in sorted_probs if prob < 0.3
            ]
        }
