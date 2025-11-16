import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random

class LearningPathGenerator:
    """
    Generates personalized learning paths based on career predictions,
    current skills, and user preferences
    """
    
    def __init__(self):
        """Initialize the learning path generator with curriculum data"""
        self.role_curricula = self._initialize_role_curricula()
        self.skill_prerequisites = self._initialize_skill_prerequisites()
        self.resource_database = self._initialize_resource_database()
        
    def _initialize_role_curricula(self) -> Dict[str, Dict]:
        """Initialize curriculum templates for each career role"""
        return {
            'Software Developer': {
                'core_skills': [
                    'Programming Fundamentals', 'Data Structures & Algorithms',
                    'Object-Oriented Programming', 'Version Control (Git)',
                    'Testing & Debugging', 'Software Design Patterns'
                ],
                'advanced_skills': [
                    'System Design', 'Performance Optimization',
                    'Code Review', 'Agile Development'
                ],
                'tools': ['IDE Proficiency', 'Build Tools', 'CI/CD'],
                'estimated_weeks': {'beginner': 24, 'intermediate': 16, 'advanced': 8}
            },
            'Web Developer': {
                'core_skills': [
                    'HTML/CSS', 'JavaScript', 'Responsive Design',
                    'Frontend Frameworks', 'Backend Development',
                    'Database Integration', 'API Development'
                ],
                'advanced_skills': [
                    'Performance Optimization', 'SEO', 'Security',
                    'Progressive Web Apps', 'Microservices'
                ],
                'tools': ['Browser Dev Tools', 'Package Managers', 'Bundlers'],
                'estimated_weeks': {'beginner': 20, 'intermediate': 14, 'advanced': 8}
            },
            'Data Scientist': {
                'core_skills': [
                    'Statistics & Probability', 'Python/R Programming',
                    'Data Manipulation', 'Data Visualization',
                    'Machine Learning Basics', 'SQL'
                ],
                'advanced_skills': [
                    'Deep Learning', 'Feature Engineering',
                    'Model Deployment', 'Big Data Technologies',
                    'A/B Testing', 'MLOps'
                ],
                'tools': ['Jupyter Notebooks', 'Pandas/NumPy', 'Scikit-learn', 'TensorFlow/PyTorch'],
                'estimated_weeks': {'beginner': 28, 'intermediate': 20, 'advanced': 12}
            },
            'UX Designer': {
                'core_skills': [
                    'User Research', 'Wireframing', 'Prototyping',
                    'Visual Design', 'Interaction Design',
                    'Usability Testing', 'Information Architecture'
                ],
                'advanced_skills': [
                    'Design Systems', 'Advanced Prototyping',
                    'Accessibility Design', 'Design Leadership',
                    'Business Strategy'
                ],
                'tools': ['Figma/Sketch', 'Adobe Creative Suite', 'Prototyping Tools'],
                'estimated_weeks': {'beginner': 22, 'intermediate': 16, 'advanced': 10}
            },
            'Database Developer': {
                'core_skills': [
                    'SQL Fundamentals', 'Database Design', 'Normalization',
                    'Indexing', 'Query Optimization', 'Stored Procedures'
                ],
                'advanced_skills': [
                    'Database Administration', 'Performance Tuning',
                    'Backup & Recovery', 'Security', 'NoSQL Databases'
                ],
                'tools': ['RDBMS Systems', 'Database Tools', 'Monitoring Tools'],
                'estimated_weeks': {'beginner': 18, 'intermediate': 12, 'advanced': 8}
            },
            'Network Security Engineer': {
                'core_skills': [
                    'Network Fundamentals', 'Security Principles',
                    'Firewalls & VPNs', 'Intrusion Detection',
                    'Risk Assessment', 'Incident Response'
                ],
                'advanced_skills': [
                    'Penetration Testing', 'Security Architecture',
                    'Compliance & Governance', 'Threat Intelligence',
                    'Security Automation'
                ],
                'tools': ['Security Tools', 'Network Analyzers', 'SIEM Systems'],
                'estimated_weeks': {'beginner': 26, 'intermediate': 18, 'advanced': 12}
            },
            'Mobile Applications Developer': {
                'core_skills': [
                    'Mobile Development Basics', 'Platform-Specific Development',
                    'UI/UX for Mobile', 'API Integration',
                    'Local Storage', 'Testing on Devices'
                ],
                'advanced_skills': [
                    'Performance Optimization', 'Security',
                    'App Store Optimization', 'Cross-Platform Development',
                    'Push Notifications'
                ],
                'tools': ['Development IDEs', 'Emulators', 'Analytics Tools'],
                'estimated_weeks': {'beginner': 20, 'intermediate': 14, 'advanced': 10}
            },
            'Software Quality Assurance (QA) / Testing': {
                'core_skills': [
                    'Testing Fundamentals', 'Test Case Design',
                    'Manual Testing', 'Bug Reporting',
                    'Test Documentation', 'Regression Testing'
                ],
                'advanced_skills': [
                    'Automation Testing', 'Performance Testing',
                    'Security Testing', 'API Testing',
                    'Test Strategy & Planning'
                ],
                'tools': ['Testing Frameworks', 'Bug Tracking Tools', 'Automation Tools'],
                'estimated_weeks': {'beginner': 16, 'intermediate': 12, 'advanced': 8}
            },
            'Technical Support': {
                'core_skills': [
                    'Problem Solving', 'Communication Skills',
                    'System Troubleshooting', 'Customer Service',
                    'Documentation', 'Remote Support Tools'
                ],
                'advanced_skills': [
                    'Advanced Troubleshooting', 'System Administration',
                    'Process Improvement', 'Team Leadership',
                    'Training & Mentoring'
                ],
                'tools': ['Support Ticketing Systems', 'Remote Access Tools', 'Monitoring Tools'],
                'estimated_weeks': {'beginner': 12, 'intermediate': 8, 'advanced': 6}
            },
            'CRM Technical Developer': {
                'core_skills': [
                    'CRM Platform Knowledge', 'Database Management',
                    'API Integration', 'Business Process Analysis',
                    'Custom Development', 'Data Migration'
                ],
                'advanced_skills': [
                    'Advanced Customization', 'Integration Architecture',
                    'Performance Optimization', 'Security & Compliance',
                    'CRM Strategy & Planning'
                ],
                'tools': ['Salesforce/Dynamics 365', 'REST APIs', 'SQL', 'Development IDEs'],
                'estimated_weeks': {'beginner': 20, 'intermediate': 14, 'advanced': 10}
            }
        }
    
    def _initialize_skill_prerequisites(self) -> Dict[str, List[str]]:
        """Define skill prerequisites and dependencies"""
        return {
            'Data Structures & Algorithms': ['Programming Fundamentals'],
            'Object-Oriented Programming': ['Programming Fundamentals'],
            'System Design': ['Data Structures & Algorithms', 'Object-Oriented Programming'],
            'Machine Learning Basics': ['Statistics & Probability', 'Python/R Programming'],
            'Deep Learning': ['Machine Learning Basics', 'Data Manipulation'],
            'Frontend Frameworks': ['HTML/CSS', 'JavaScript'],
            'Backend Development': ['Programming Fundamentals', 'Database Integration'],
            'API Development': ['Backend Development', 'Database Integration'],
            'Performance Optimization': ['System Design', 'Programming Fundamentals'],
            'Security': ['Network Fundamentals', 'System Administration'],
            'Automation Testing': ['Testing Fundamentals', 'Programming Fundamentals'],
            'Database Administration': ['SQL Fundamentals', 'Database Design'],
            'Advanced Prototyping': ['Prototyping', 'Interaction Design']
        }
    
    def _initialize_resource_database(self) -> Dict[str, List[Dict]]:
        """Initialize database of learning resources"""
        return {
            'Programming Fundamentals': [
                {
                    'type': 'course',
                    'title': 'Python for Everybody Specialization',
                    'provider': 'Coursera',
                    'duration_hours': 120,
                    'difficulty': 'beginner',
                    'url': 'https://coursera.org/specializations/python',
                    'rating': 4.8,
                    'cost': 'paid'
                },
                {
                    'type': 'course',
                    'title': 'CS50: Introduction to Computer Science',
                    'provider': 'edX',
                    'duration_hours': 100,
                    'difficulty': 'beginner',
                    'url': 'https://edx.org/course/cs50',
                    'rating': 4.9,
                    'cost': 'free'
                },
                {
                    'type': 'practice',
                    'title': 'HackerRank Python Domain',
                    'provider': 'HackerRank',
                    'duration_hours': 40,
                    'difficulty': 'beginner',
                    'url': 'https://hackerrank.com/domains/python',
                    'rating': 4.5,
                    'cost': 'free'
                }
            ],
            'Data Structures & Algorithms': [
                {
                    'type': 'course',
                    'title': 'Algorithms Specialization',
                    'provider': 'Coursera',
                    'duration_hours': 160,
                    'difficulty': 'intermediate',
                    'url': 'https://coursera.org/specializations/algorithms',
                    'rating': 4.7,
                    'cost': 'paid'
                },
                {
                    'type': 'practice',
                    'title': 'LeetCode Practice Problems',
                    'provider': 'LeetCode',
                    'duration_hours': 200,
                    'difficulty': 'intermediate',
                    'url': 'https://leetcode.com',
                    'rating': 4.6,
                    'cost': 'freemium'
                }
            ],
            'Machine Learning Basics': [
                {
                    'type': 'course',
                    'title': 'Machine Learning Course',
                    'provider': 'Coursera',
                    'duration_hours': 60,
                    'difficulty': 'intermediate',
                    'url': 'https://coursera.org/learn/machine-learning',
                    'rating': 4.9,
                    'cost': 'paid'
                },
                {
                    'type': 'project',
                    'title': 'Build a Recommendation System',
                    'provider': 'Kaggle',
                    'duration_hours': 20,
                    'difficulty': 'intermediate',
                    'url': 'https://kaggle.com/learn/intro-to-machine-learning',
                    'rating': 4.4,
                    'cost': 'free'
                }
            ],
            'HTML/CSS': [
                {
                    'type': 'course',
                    'title': 'Responsive Web Design',
                    'provider': 'freeCodeCamp',
                    'duration_hours': 300,
                    'difficulty': 'beginner',
                    'url': 'https://freecodecamp.org/learn/responsive-web-design/',
                    'rating': 4.8,
                    'cost': 'free'
                }
            ],
            'JavaScript': [
                {
                    'type': 'course',
                    'title': 'JavaScript Algorithms and Data Structures',
                    'provider': 'freeCodeCamp',
                    'duration_hours': 300,
                    'difficulty': 'intermediate',
                    'url': 'https://freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
                    'rating': 4.7,
                    'cost': 'free'
                }
            ],
            'SQL Fundamentals': [
                {
                    'type': 'course',
                    'title': 'SQL for Data Science',
                    'provider': 'Coursera',
                    'duration_hours': 40,
                    'difficulty': 'beginner',
                    'url': 'https://coursera.org/learn/sql-for-data-science',
                    'rating': 4.6,
                    'cost': 'paid'
                }
            ],
            'CRM Platform Knowledge': [
                {
                    'type': 'course',
                    'title': 'Salesforce Administrator Certification',
                    'provider': 'Trailhead',
                    'duration_hours': 80,
                    'difficulty': 'beginner',
                    'url': 'https://trailhead.salesforce.com',
                    'rating': 4.7,
                    'cost': 'free'
                },
                {
                    'type': 'course',
                    'title': 'Microsoft Dynamics 365 Fundamentals',
                    'provider': 'Microsoft Learn',
                    'duration_hours': 60,
                    'difficulty': 'beginner',
                    'url': 'https://learn.microsoft.com/dynamics365',
                    'rating': 4.5,
                    'cost': 'free'
                }
            ],
            'API Integration': [
                {
                    'type': 'course',
                    'title': 'REST API Development',
                    'provider': 'Udemy',
                    'duration_hours': 50,
                    'difficulty': 'intermediate',
                    'url': 'https://udemy.com/course/rest-api/',
                    'rating': 4.6,
                    'cost': 'paid'
                },
                {
                    'type': 'practice',
                    'title': 'API Integration Projects',
                    'provider': 'GitHub',
                    'duration_hours': 30,
                    'difficulty': 'intermediate',
                    'url': 'https://github.com/topics/api-integration',
                    'rating': 4.3,
                    'cost': 'free'
                }
            ],
            'Business Process Analysis': [
                {
                    'type': 'course',
                    'title': 'Business Analysis Fundamentals',
                    'provider': 'LinkedIn Learning',
                    'duration_hours': 40,
                    'difficulty': 'beginner',
                    'url': 'https://linkedin.com/learning/business-analysis',
                    'rating': 4.5,
                    'cost': 'paid'
                }
            ],
            'Custom Development': [
                {
                    'type': 'course',
                    'title': 'Salesforce Developer Certification',
                    'provider': 'Trailhead',
                    'duration_hours': 120,
                    'difficulty': 'intermediate',
                    'url': 'https://trailhead.salesforce.com/developer',
                    'rating': 4.8,
                    'cost': 'free'
                }
            ],
            'Data Migration': [
                {
                    'type': 'course',
                    'title': 'Data Migration Best Practices',
                    'provider': 'Pluralsight',
                    'duration_hours': 30,
                    'difficulty': 'intermediate',
                    'url': 'https://pluralsight.com/data-migration',
                    'rating': 4.4,
                    'cost': 'paid'
                }
            ]
        }
    
    def generate_learning_path(self, target_role: str, current_skills: Dict[str, float],
                             experience_level: str, preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate a personalized learning path
        
        Args:
            target_role: Target career role
            current_skills: Dictionary of current skill levels (0-10 scale)
            experience_level: 'beginner', 'intermediate', or 'advanced'
            preferences: User preferences (time commitment, learning style, etc.)
            
        Returns:
            Complete learning path with milestones and resources
        """
        if target_role not in self.role_curricula:
            return {'error': f'Role {target_role} not found in curriculum database'}
        
        preferences = preferences or {}
        role_curriculum = self.role_curricula[target_role]
        
        # Calculate skill gaps
        skill_gaps = self._calculate_skill_gaps(role_curriculum, current_skills)
        
        # Generate milestone sequence
        milestones = self._generate_milestones(skill_gaps, experience_level, preferences)
        
        # Add resources to milestones
        milestones_with_resources = self._add_resources_to_milestones(milestones, preferences)
        
        # Calculate timeline
        timeline = self._calculate_timeline(milestones_with_resources, preferences)
        
        # Generate progress tracking structure
        progress_tracking = self._generate_progress_tracking(milestones_with_resources)
        
        return {
            'target_role': target_role,
            'experience_level': experience_level,
            'estimated_duration_weeks': timeline['total_weeks'],
            'skill_gaps_identified': len(skill_gaps),
            'milestones': milestones_with_resources,
            'timeline': timeline,
            'progress_tracking': progress_tracking,
            'personalization_factors': {
                'current_skill_level': self._calculate_overall_skill_level(current_skills),
                'learning_intensity': preferences.get('learning_intensity', 'moderate'),
                'preferred_learning_types': preferences.get('preferred_types', ['course', 'project'])
            }
        }
    
    def _calculate_skill_gaps(self, role_curriculum: Dict, current_skills: Dict[str, float]) -> List[Dict]:
        """Calculate which skills need development"""
        skill_gaps = []
        
        # Check core skills
        for skill in role_curriculum['core_skills']:
            current_level = current_skills.get(skill, 0)
            required_level = 7.0  # Minimum required level for core skills
            
            if current_level < required_level:
                skill_gaps.append({
                    'skill': skill,
                    'current_level': current_level,
                    'required_level': required_level,
                    'gap_size': required_level - current_level,
                    'priority': 'high',
                    'category': 'core'
                })
        
        # Check advanced skills
        for skill in role_curriculum['advanced_skills']:
            current_level = current_skills.get(skill, 0)
            required_level = 6.0  # Lower requirement for advanced skills
            
            if current_level < required_level:
                skill_gaps.append({
                    'skill': skill,
                    'current_level': current_level,
                    'required_level': required_level,
                    'gap_size': required_level - current_level,
                    'priority': 'medium',
                    'category': 'advanced'
                })
        
        # Check tools
        for tool in role_curriculum['tools']:
            current_level = current_skills.get(tool, 0)
            required_level = 5.0  # Basic proficiency for tools
            
            if current_level < required_level:
                skill_gaps.append({
                    'skill': tool,
                    'current_level': current_level,
                    'required_level': required_level,
                    'gap_size': required_level - current_level,
                    'priority': 'low',
                    'category': 'tools'
                })
        
        # Sort by priority and gap size
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        skill_gaps.sort(key=lambda x: (priority_order[x['priority']], x['gap_size']), reverse=True)
        
        return skill_gaps
    
    def _generate_milestones(self, skill_gaps: List[Dict], experience_level: str,
                           preferences: Dict[str, Any]) -> List[Dict]:
        """Generate learning milestones based on skill gaps and prerequisites"""
        milestones = []
        completed_skills = set()
        
        # Group skills by prerequisites
        skill_dependency_graph = self._build_dependency_graph(skill_gaps)
        
        # Generate milestones in dependency order
        milestone_order = 1
        while skill_gaps:
            # Find skills with no unmet prerequisites
            ready_skills = []
            for gap in skill_gaps:
                skill = gap['skill']
                prerequisites = self.skill_prerequisites.get(skill, [])
                
                if all(prereq in completed_skills for prereq in prerequisites):
                    ready_skills.append(gap)
            
            if not ready_skills:
                # Break circular dependencies by taking the highest priority skill
                ready_skills = [max(skill_gaps, key=lambda x: x['gap_size'])]
            
            # Create milestone for ready skills (group related skills)
            milestone_skills = self._group_related_skills(ready_skills)
            
            for skill_group in milestone_skills:
                milestone = self._create_milestone(skill_group, milestone_order, experience_level)
                milestones.append(milestone)
                milestone_order += 1
                
                # Mark skills as completed
                for gap in skill_group:
                    completed_skills.add(gap['skill'])
                    skill_gaps.remove(gap)
        
        return milestones
    
    def _build_dependency_graph(self, skill_gaps: List[Dict]) -> Dict[str, List[str]]:
        """Build a dependency graph for skills"""
        graph = {}
        for gap in skill_gaps:
            skill = gap['skill']
            prerequisites = self.skill_prerequisites.get(skill, [])
            graph[skill] = prerequisites
        return graph
    
    def _group_related_skills(self, ready_skills: List[Dict]) -> List[List[Dict]]:
        """Group related skills that can be learned together"""
        if len(ready_skills) <= 1:
            return [ready_skills] if ready_skills else []
        
        # Simple grouping by category and priority
        groups = []
        current_group = [ready_skills[0]]
        
        for skill in ready_skills[1:]:
            # Group skills of same category and similar priority
            if (skill['category'] == current_group[0]['category'] and 
                skill['priority'] == current_group[0]['priority'] and
                len(current_group) < 3):  # Max 3 skills per milestone
                current_group.append(skill)
            else:
                groups.append(current_group)
                current_group = [skill]
        
        groups.append(current_group)
        return groups
    
    def _create_milestone(self, skill_group: List[Dict], order: int, experience_level: str) -> Dict:
        """Create a milestone from a group of skills"""
        primary_skill = skill_group[0]['skill']
        
        # Estimate hours based on skill gap and experience level
        base_hours = sum(gap['gap_size'] * 10 for gap in skill_group)  # 10 hours per gap point
        
        experience_multiplier = {
            'beginner': 1.5,
            'intermediate': 1.0,
            'advanced': 0.7
        }
        
        estimated_hours = int(base_hours * experience_multiplier.get(experience_level, 1.0))
        
        # Determine milestone type based on skills
        milestone_type = self._determine_milestone_type(skill_group)
        
        return {
            'order': order,
            'title': f"Master {primary_skill}" + (f" and {len(skill_group)-1} related skills" if len(skill_group) > 1 else ""),
            'description': self._generate_milestone_description(skill_group),
            'milestone_type': milestone_type,
            'skills_covered': [gap['skill'] for gap in skill_group],
            'estimated_hours': estimated_hours,
            'priority': skill_group[0]['priority'],
            'prerequisites': self._get_milestone_prerequisites(skill_group),
            'learning_objectives': self._generate_learning_objectives(skill_group),
            'success_criteria': self._generate_success_criteria(skill_group)
        }
    
    def _determine_milestone_type(self, skill_group: List[Dict]) -> str:
        """Determine the best milestone type for a skill group"""
        skill_names = [gap['skill'].lower() for gap in skill_group]
        
        # Rules for determining milestone type
        if any('project' in skill or 'development' in skill for skill in skill_names):
            return 'project'
        elif any('fundamental' in skill or 'basics' in skill for skill in skill_names):
            return 'course'
        elif any('certification' in skill or 'security' in skill for skill in skill_names):
            return 'certification'
        elif any('practice' in skill or 'algorithm' in skill for skill in skill_names):
            return 'practice'
        else:
            return 'course'  # Default
    
    def _generate_milestone_description(self, skill_group: List[Dict]) -> str:
        """Generate a description for the milestone"""
        if len(skill_group) == 1:
            skill = skill_group[0]['skill']
            return f"Develop proficiency in {skill} through structured learning and hands-on practice."
        else:
            skills = [gap['skill'] for gap in skill_group]
            return f"Build competency in {', '.join(skills[:-1])} and {skills[-1]} through integrated learning activities."
    
    def _get_milestone_prerequisites(self, skill_group: List[Dict]) -> List[str]:
        """Get prerequisites for a milestone"""
        all_prerequisites = set()
        for gap in skill_group:
            prerequisites = self.skill_prerequisites.get(gap['skill'], [])
            all_prerequisites.update(prerequisites)
        
        return list(all_prerequisites)
    
    def _generate_learning_objectives(self, skill_group: List[Dict]) -> List[str]:
        """Generate specific learning objectives for the milestone"""
        objectives = []
        for gap in skill_group:
            skill = gap['skill']
            target_level = gap['required_level']
            
            if 'Programming' in skill:
                objectives.append(f"Write clean, efficient code demonstrating {skill} principles")
            elif 'Design' in skill:
                objectives.append(f"Create user-centered designs applying {skill} methodologies")
            elif 'Testing' in skill:
                objectives.append(f"Implement comprehensive testing strategies using {skill}")
            elif 'Security' in skill:
                objectives.append(f"Apply {skill} best practices to protect systems and data")
            else:
                objectives.append(f"Demonstrate proficiency in {skill} at level {target_level}/10")
        
        return objectives
    
    def _generate_success_criteria(self, skill_group: List[Dict]) -> List[str]:
        """Generate measurable success criteria for the milestone"""
        criteria = []
        for gap in skill_group:
            skill = gap['skill']
            target_level = gap['required_level']
            
            criteria.append(f"Complete assessment scoring {target_level}/10 or higher in {skill}")
            
            if gap['category'] == 'core':
                criteria.append(f"Complete hands-on project demonstrating {skill}")
            elif gap['category'] == 'tools':
                criteria.append(f"Demonstrate practical usage of {skill} in real scenarios")
        
        return criteria
    
    def _add_resources_to_milestones(self, milestones: List[Dict], preferences: Dict) -> List[Dict]:
        """Add learning resources to each milestone"""
        for milestone in milestones:
            milestone['resources'] = []
            
            for skill in milestone['skills_covered']:
                skill_resources = self.resource_database.get(skill, [])
                
                # Filter resources based on preferences
                filtered_resources = self._filter_resources(skill_resources, preferences)
                
                # Add top resources for this skill
                milestone['resources'].extend(filtered_resources[:2])  # Top 2 resources per skill
            
            # Remove duplicates and sort by rating
            unique_resources = {r['title']: r for r in milestone['resources']}.values()
            milestone['resources'] = sorted(unique_resources, key=lambda x: x.get('rating', 0), reverse=True)
        
        return milestones
    
    def _filter_resources(self, resources: List[Dict], preferences: Dict) -> List[Dict]:
        """Filter resources based on user preferences"""
        filtered = resources.copy()
        
        # Filter by cost preference
        cost_preference = preferences.get('cost_preference', 'any')
        if cost_preference == 'free':
            filtered = [r for r in filtered if r.get('cost') == 'free']
        elif cost_preference == 'paid':
            filtered = [r for r in filtered if r.get('cost') in ['paid', 'freemium']]
        
        # Filter by learning type preference
        preferred_types = preferences.get('preferred_types', [])
        if preferred_types:
            filtered = [r for r in filtered if r.get('type') in preferred_types]
        
        # Filter by time availability
        max_hours = preferences.get('max_hours_per_resource', 200)
        filtered = [r for r in filtered if r.get('duration_hours', 0) <= max_hours]
        
        return filtered
    
    def _calculate_timeline(self, milestones: List[Dict], preferences: Dict) -> Dict[str, Any]:
        """Calculate realistic timeline for the learning path"""
        total_hours = sum(milestone['estimated_hours'] for milestone in milestones)
        
        # Get user's time commitment
        hours_per_week = preferences.get('hours_per_week', 10)
        learning_intensity = preferences.get('learning_intensity', 'moderate')
        
        intensity_multipliers = {
            'light': 0.7,
            'moderate': 1.0,
            'intensive': 1.4
        }
        
        effective_hours_per_week = hours_per_week * intensity_multipliers.get(learning_intensity, 1.0)
        total_weeks = max(1, int(total_hours / effective_hours_per_week))
        
        # Create milestone schedule
        milestone_schedule = []
        current_week = 1
        
        for milestone in milestones:
            milestone_weeks = max(1, int(milestone['estimated_hours'] / effective_hours_per_week))
            
            milestone_schedule.append({
                'milestone_id': milestone['order'],
                'title': milestone['title'],
                'start_week': current_week,
                'end_week': current_week + milestone_weeks - 1,
                'duration_weeks': milestone_weeks
            })
            
            current_week += milestone_weeks
        
        return {
            'total_hours': total_hours,
            'total_weeks': total_weeks,
            'hours_per_week': effective_hours_per_week,
            'milestone_schedule': milestone_schedule,
            'completion_date': (datetime.now() + timedelta(weeks=total_weeks)).strftime('%Y-%m-%d')
        }
    
    def _generate_progress_tracking(self, milestones: List[Dict]) -> Dict[str, Any]:
        """Generate progress tracking structure"""
        return {
            'total_milestones': len(milestones),
            'tracking_metrics': [
                'completion_percentage',
                'time_spent',
                'skill_assessments_passed',
                'projects_completed',
                'certifications_earned'
            ],
            'reminder_schedule': {
                'weekly_progress_check': True,
                'milestone_deadlines': True,
                'skill_practice_reminders': True
            },
            'gamification_elements': {
                'points_per_milestone': 100,
                'bonus_points_early_completion': 25,
                'streak_tracking': True,
                'achievement_badges': [
                    'Fast Learner', 'Consistent Progress', 'Skill Master',
                    'Project Completer', 'Certification Achiever'
                ]
            }
        }
    
    def _calculate_overall_skill_level(self, current_skills: Dict[str, float]) -> str:
        """Calculate overall skill level from individual skills"""
        if not current_skills:
            return 'beginner'
        
        average_skill = sum(current_skills.values()) / len(current_skills)
        
        if average_skill < 3:
            return 'beginner'
        elif average_skill < 6:
            return 'intermediate'
        else:
            return 'advanced'
    
    def update_learning_path(self, learning_path: Dict, progress_data: Dict) -> Dict[str, Any]:
        """Update learning path based on progress and feedback"""
        # Analyze progress
        completion_rate = progress_data.get('completion_rate', 0)
        time_efficiency = progress_data.get('time_efficiency', 1.0)  # Actual time / estimated time
        skill_assessment_scores = progress_data.get('skill_scores', {})
        
        updates = {
            'path_adjustments': [],
            'new_recommendations': [],
            'timeline_updates': {}
        }
        
        # Adjust timeline based on actual progress
        if time_efficiency > 1.2:  # Taking longer than expected
            updates['timeline_updates']['recommendation'] = 'extend_timeline'
            updates['timeline_updates']['factor'] = time_efficiency
        elif time_efficiency < 0.8:  # Progressing faster
            updates['timeline_updates']['recommendation'] = 'accelerate_timeline'
            updates['timeline_updates']['factor'] = time_efficiency
        
        # Suggest additional resources for struggling areas
        for skill, score in skill_assessment_scores.items():
            if score < 6.0:  # Below target
                additional_resources = self._get_remedial_resources(skill)
                updates['new_recommendations'].extend(additional_resources)
        
        # Suggest advanced topics for excelling areas
        for skill, score in skill_assessment_scores.items():
            if score > 8.0:  # Exceeding expectations
                advanced_resources = self._get_advanced_resources(skill)
                updates['new_recommendations'].extend(advanced_resources)
        
        return updates
    
    def _get_remedial_resources(self, skill: str) -> List[Dict]:
        """Get additional resources for skills that need reinforcement"""
        base_resources = self.resource_database.get(skill, [])
        
        # Filter for beginner-friendly, highly-rated resources
        remedial = [
            r for r in base_resources 
            if r.get('difficulty') == 'beginner' and r.get('rating', 0) > 4.5
        ]
        
        return remedial[:2]  # Top 2 remedial resources
    
    def _get_advanced_resources(self, skill: str) -> List[Dict]:
        """Get advanced resources for skills where user is excelling"""
        base_resources = self.resource_database.get(skill, [])
        
        # Filter for advanced resources
        advanced = [
            r for r in base_resources 
            if r.get('difficulty') == 'advanced'
        ]
        
        return advanced[:2]  # Top 2 advanced resources
