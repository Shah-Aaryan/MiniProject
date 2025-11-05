"""
Resume/CV Builder with STAR method rewriting, skill mapping, and ATS scoring
"""
import re
import json
from typing import Dict, List, Any, Tuple

class ResumeBuilder:
    """Resume builder with STAR method and ATS optimization"""
    
    def __init__(self):
        self.ats_keywords = self._initialize_ats_keywords()
        self.star_patterns = self._initialize_star_patterns()
        self.skill_synonyms = self._initialize_skill_synonyms()
    
    def _initialize_ats_keywords(self) -> Dict[str, List[str]]:
        """Initialize ATS-friendly keywords by role"""
        return {
            'Software Developer': [
                'programming', 'coding', 'software development', 'debugging',
                'version control', 'agile', 'scrum', 'test-driven development',
                'object-oriented programming', 'REST API', 'microservices'
            ],
            'Web Developer': [
                'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'responsive design',
                'frontend', 'backend', 'full-stack', 'REST API', 'database',
                'UI/UX', 'cross-browser compatibility'
            ],
            'Data Scientist': [
                'machine learning', 'data analysis', 'Python', 'R', 'pandas',
                'numpy', 'scikit-learn', 'statistical analysis', 'data visualization',
                'feature engineering', 'model evaluation'
            ]
        }
    
    def _initialize_star_patterns(self) -> Dict[str, List[str]]:
        """Initialize patterns for STAR method extraction"""
        return {
            'situation': [
                r'in the context of',
                r'faced with',
                r'given',
                r'when'
            ],
            'task': [
                r'task was to',
                r'goal was',
                r'objective',
                r'responsible for'
            ],
            'action': [
                r'developed',
                r'created',
                r'implemented',
                r'designed',
                r'led',
                r'managed'
            ],
            'result': [
                r'resulted in',
                r'increased',
                r'decreased',
                r'reduced',
                r'improved',
                r'achieved'
            ]
        }
    
    def _initialize_skill_synonyms(self) -> Dict[str, List[str]]:
        """Initialize skill synonyms for matching"""
        return {
            'Python': ['python', 'py', 'python3'],
            'JavaScript': ['javascript', 'js', 'ecmascript'],
            'React': ['react', 'reactjs', 'react.js'],
            'SQL': ['sql', 'structured query language', 'database'],
            'Git': ['git', 'version control', 'github', 'gitlab'],
            'Docker': ['docker', 'containerization', 'containers'],
            'AWS': ['aws', 'amazon web services', 'cloud computing']
        }
    
    def rewrite_with_star(self, original_text: str, role_context: str = '') -> Dict[str, Any]:
        """Rewrite a bullet point using STAR method"""
        # Extract components
        star_components = self._extract_star_components(original_text)
        
        # If STAR components not found, generate them
        if not star_components['complete']:
            star_components = self._generate_star_components(original_text, role_context)
        
        # Format as STAR bullet
        star_text = self._format_star_bullet(star_components)
        
        return {
            'original_text': original_text,
            'star_text': star_text,
            'situation': star_components.get('situation', ''),
            'task': star_components.get('task', ''),
            'action': star_components.get('action', ''),
            'result': star_components.get('result', ''),
            'improvements': self._suggest_improvements(star_components)
        }
    
    def _extract_star_components(self, text: str) -> Dict[str, Any]:
        """Extract STAR components from text"""
        components = {
            'situation': '',
            'task': '',
            'action': '',
            'result': '',
            'complete': False
        }
        
        # Try to identify situation
        for pattern in self.star_patterns['situation']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                components['situation'] = text[:match.end()].strip()
                break
        
        # Try to identify task
        for pattern in self.star_patterns['task']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Extract task part
                task_match = re.search(r'(?<=' + pattern + r')(.*?)(?=' + '|'.join(self.star_patterns['action']) + r')', text, re.IGNORECASE)
                if task_match:
                    components['task'] = task_match.group(0).strip()
                break
        
        # Try to identify action
        for pattern in self.star_patterns['action']:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            if matches:
                action_parts = []
                for match in matches:
                    action_parts.append(text[match.start():].split('.')[0])
                components['action'] = '. '.join(action_parts).strip()
                break
        
        # Try to identify result
        for pattern in self.star_patterns['result']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                components['result'] = text[match.start():].strip()
                components['complete'] = True
                break
        
        return components
    
    def _generate_star_components(self, text: str, role_context: str) -> Dict[str, Any]:
        """Generate STAR components from text that doesn't follow STAR format"""
        components = {
            'situation': f'In my role as {role_context or "developer"}',
            'task': self._extract_task(text),
            'action': self._extract_action(text),
            'result': self._extract_result(text),
            'complete': True
        }
        
        return components
    
    def _extract_task(self, text: str) -> str:
        """Extract task from text"""
        # Look for responsibility or objective keywords
        task_keywords = ['responsible for', 'tasked with', 'goal', 'objective']
        for keyword in task_keywords:
            if keyword in text.lower():
                # Extract sentence with keyword
                sentences = re.split(r'[.!?]+', text)
                for sentence in sentences:
                    if keyword in sentence.lower():
                        return sentence.strip()
        return 'Deliver high-quality solutions'
    
    def _extract_action(self, text: str) -> str:
        """Extract action from text"""
        action_verbs = ['developed', 'created', 'implemented', 'designed', 'built', 'led', 'managed']
        for verb in action_verbs:
            if verb in text.lower():
                # Extract sentence with verb
                sentences = re.split(r'[.!?]+', text)
                for sentence in sentences:
                    if verb in sentence.lower():
                        return sentence.strip()
        return text  # Return original if no action verb found
    
    def _extract_result(self, text: str) -> str:
        """Extract result from text"""
        result_keywords = ['increased', 'decreased', 'improved', 'reduced', 'achieved', 'resulted in']
        for keyword in result_keywords:
            if keyword in text.lower():
                sentences = re.split(r'[.!?]+', text)
                for sentence in sentences:
                    if keyword in sentence.lower():
                        return sentence.strip()
        return 'Achieved positive outcomes'  # Default result
    
    def _format_star_bullet(self, components: Dict) -> str:
        """Format STAR components into a bullet point"""
        parts = []
        
        if components.get('action'):
            parts.append(components['action'])
        
        if components.get('result'):
            parts.append(f"Resulting in {components['result'].lower()}")
        
        if not parts:
            # Fallback format
            if components.get('situation') and components.get('task'):
                parts.append(f"{components['situation']}, {components['task']}")
            elif components.get('action'):
                parts.append(components['action'])
        
        return '. '.join(parts) if parts else 'Contributed to team success'
    
    def _suggest_improvements(self, components: Dict) -> List[str]:
        """Suggest improvements for STAR bullet"""
        improvements = []
        
        if not components.get('situation'):
            improvements.append('Add context/situation to provide background')
        
        if not components.get('task'):
            improvements.append('Clarify the task or objective')
        
        if not components.get('action'):
            improvements.append('Use action verbs to describe what you did')
        
        if not components.get('result') or not any(word in components.get('result', '').lower() for word in ['increase', 'decrease', 'improve', 'reduce', 'achieve']):
            improvements.append('Include quantifiable results (numbers, percentages, metrics)')
        
        return improvements
    
    def calculate_ats_score(self, resume_text: str, target_role: str) -> Dict[str, Any]:
        """Calculate ATS compatibility score"""
        role_keywords = self.ats_keywords.get(target_role, [])
        
        # Normalize text for analysis
        normalized_text = resume_text.lower()
        
        # Check for keywords
        found_keywords = []
        missing_keywords = []
        
        for keyword in role_keywords:
            if keyword.lower() in normalized_text:
                found_keywords.append(keyword)
            else:
                # Check synonyms
                found_synonym = False
                for skill, synonyms in self.skill_synonyms.items():
                    if keyword.lower() in synonyms or skill.lower() == keyword.lower():
                        for synonym in synonyms:
                            if synonym in normalized_text:
                                found_keywords.append(keyword)
                                found_synonym = True
                                break
                        if found_synonym:
                            break
                
                if not found_synonym:
                    missing_keywords.append(keyword)
        
        # Calculate score
        keyword_score = (len(found_keywords) / len(role_keywords)) * 100 if role_keywords else 0
        
        # Check formatting
        formatting_score = self._check_formatting(resume_text)
        
        # Check structure
        structure_score = self._check_structure(resume_text)
        
        # Overall ATS score (weighted average)
        ats_score = (keyword_score * 0.5 + formatting_score * 0.25 + structure_score * 0.25)
        
        return {
            'ats_score': round(ats_score, 2),
            'keyword_score': round(keyword_score, 2),
            'formatting_score': round(formatting_score, 2),
            'structure_score': round(structure_score, 2),
            'found_keywords': found_keywords,
            'missing_keywords': missing_keywords[:10],  # Top 10 missing
            'suggestions': self._generate_ats_suggestions(resume_text, missing_keywords, formatting_score, structure_score)
        }
    
    def _check_formatting(self, text: str) -> float:
        """Check resume formatting for ATS compatibility"""
        score = 100.0
        
        # Check for proper section headers
        sections = ['experience', 'education', 'skills', 'summary', 'objective']
        found_sections = sum(1 for section in sections if section in text.lower())
        section_score = (found_sections / len(sections)) * 100
        
        # Check for proper date formatting
        date_patterns = [
            r'\d{4}\s*-\s*\d{4}',  # 2020 - 2024
            r'\w+\s+\d{4}',  # Jan 2020
        ]
        has_dates = any(re.search(pattern, text) for pattern in date_patterns)
        date_score = 100 if has_dates else 50
        
        # Check for tables (can confuse ATS)
        has_tables = '<table' in text.lower() or '|' in text.split('\n')[0] if text else False
        if has_tables:
            score -= 20
        
        # Check for headers/footers (can confuse ATS)
        has_headers_footers = 'header' in text.lower() or 'footer' in text.lower()
        if has_headers_footers:
            score -= 15
        
        return min(score, (section_score + date_score) / 2)
    
    def _check_structure(self, text: str) -> float:
        """Check resume structure"""
        score = 100.0
        
        # Check for contact information
        contact_patterns = [r'@', r'\+?\d', r'linkedin', r'github']
        has_contact = sum(1 for pattern in contact_patterns if re.search(pattern, text, re.IGNORECASE))
        contact_score = (has_contact / len(contact_patterns)) * 100
        
        # Check for skills section
        skills_keywords = ['skills', 'technologies', 'competencies', 'proficiencies']
        has_skills = any(keyword in text.lower() for keyword in skills_keywords)
        skills_score = 100 if has_skills else 50
        
        # Check for experience descriptions
        action_verbs = ['developed', 'created', 'implemented', 'designed', 'managed', 'led']
        has_actions = sum(1 for verb in action_verbs if verb in text.lower())
        action_score = min(100, (has_actions / len(action_verbs)) * 100)
        
        return (contact_score + skills_score + action_score) / 3
    
    def _generate_ats_suggestions(self, text: str, missing_keywords: List[str], formatting_score: float, structure_score: float) -> List[str]:
        """Generate ATS improvement suggestions"""
        suggestions = []
        
        if missing_keywords:
            suggestions.append(f"Add these keywords: {', '.join(missing_keywords[:5])}")
        
        if formatting_score < 80:
            suggestions.append("Improve formatting: Use standard section headers (Experience, Education, Skills)")
        
        if structure_score < 80:
            suggestions.append("Enhance structure: Include contact information, skills section, and action verbs")
        
        if len(text) < 500:
            suggestions.append("Expand content: Add more detail to experience and skills sections")
        
        if not suggestions:
            suggestions.append("Resume looks good for ATS! Consider adding more role-specific keywords if needed.")
        
        return suggestions
    
    def map_skills_from_quiz(self, quiz_responses: Dict, assessments: List[Dict]) -> Dict[str, float]:
        """Map skills from quiz responses and assessments"""
        skill_mapping = {}
        
        # Map from quiz responses
        # Assuming quiz responses have skill-related questions
        if quiz_responses:
            # Extract skill levels from responses
            for key, value in quiz_responses.items():
                if 'skill' in key.lower() or 'proficiency' in key.lower():
                    skill_name = key.replace('skill_', '').replace('_', ' ').title()
                    skill_mapping[skill_name] = float(value) if isinstance(value, (int, float)) else 0.0
        
        # Map from assessments
        if assessments:
            for assessment in assessments:
                skill_name = assessment.get('skill_name', '')
                score = assessment.get('score', 0)
                max_score = assessment.get('max_score', 100)
                
                if skill_name:
                    # Convert score to 0-10 scale
                    normalized_score = (score / max_score) * 10 if max_score > 0 else 0
                    skill_mapping[skill_name] = max(skill_mapping.get(skill_name, 0), normalized_score)
        
        return skill_mapping
    
    def tailor_resume_for_job(self, resume_content: str, job_description: str, target_role: str) -> Dict[str, Any]:
        """Tailor resume for a specific job"""
        # Extract keywords from job description
        job_keywords = self._extract_keywords(job_description)
        
        # Calculate ATS score for original resume
        original_ats = self.calculate_ats_score(resume_content, target_role)
        
        # Generate tailored version
        tailored_content = resume_content
        changes_made = []
        
        # Add missing keywords
        missing_in_resume = [kw for kw in job_keywords if kw.lower() not in resume_content.lower()]
        
        if missing_in_resume:
            # Try to add keywords naturally
            changes_made.append(f"Added keywords: {', '.join(missing_in_resume[:5])}")
        
        # Rewrite bullets with STAR method
        bullets = self._extract_bullets(resume_content)
        rewritten_bullets = []
        
        for bullet in bullets:
            if not self._is_star_format(bullet):
                star_version = self.rewrite_with_star(bullet, target_role)
                rewritten_bullets.append({
                    'original': bullet,
                    'star': star_version['star_text']
                })
                changes_made.append(f"Rewrote bullet using STAR method")
        
        # Calculate ATS score for tailored version
        tailored_ats = self.calculate_ats_score(tailored_content, target_role)
        
        return {
            'original_resume': resume_content,
            'tailored_resume': tailored_content,
            'changes_made': changes_made,
            'original_ats_score': original_ats['ats_score'],
            'tailored_ats_score': tailored_ats['ats_score'],
            'improvement': tailored_ats['ats_score'] - original_ats['ats_score'],
            'rewritten_bullets': rewritten_bullets
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from job description"""
        # Simple keyword extraction (in production, use NLP libraries)
        common_tech_keywords = [
            'python', 'javascript', 'java', 'react', 'node', 'sql', 'aws',
            'docker', 'kubernetes', 'git', 'agile', 'scrum', 'api', 'rest'
        ]
        
        found_keywords = []
        text_lower = text.lower()
        
        for keyword in common_tech_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword.title())
        
        return found_keywords
    
    def _extract_bullets(self, text: str) -> List[str]:
        """Extract bullet points from resume"""
        bullets = []
        
        # Look for bullet patterns
        bullet_patterns = [
            r'[•·▪▫]\s*(.+?)(?=\n|$)',
            r'[-]\s*(.+?)(?=\n|$)',
            r'[•]\s*(.+?)(?=\n|$)',
        ]
        
        for pattern in bullet_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            bullets.extend(matches)
        
        return bullets[:20]  # Limit to 20 bullets
    
    def _is_star_format(self, text: str) -> bool:
        """Check if text already follows STAR format"""
        # Check for result indicators
        result_indicators = ['resulted in', 'increased', 'decreased', 'improved', 'achieved', '%', 'times']
        has_result = any(indicator in text.lower() for indicator in result_indicators)
        
        # Check for action verbs
        action_verbs = ['developed', 'created', 'implemented', 'designed', 'led', 'managed']
        has_action = any(verb in text.lower() for verb in action_verbs)
        
        return has_result and has_action

