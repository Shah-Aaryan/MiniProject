"""
Labor Market Intelligence
Live job trend ingestion, gap analysis, and salary bands
"""
import json
from typing import Dict, List, Any
from datetime import datetime, timedelta

class LaborMarketIntelligence:
    """Labor market intelligence and analysis"""
    
    def __init__(self):
        self.salary_data = self._initialize_salary_data()
        self.trend_patterns = self._initialize_trend_patterns()
    
    def _initialize_salary_data(self) -> Dict[str, Dict]:
        """Initialize base salary data by role and region"""
        return {
            'Software Developer': {
                'US': {
                    'junior': {'min': 60000, 'median': 75000, 'max': 95000},
                    'mid': {'min': 85000, 'median': 110000, 'max': 135000},
                    'senior': {'min': 120000, 'median': 150000, 'max': 200000}
                },
                'Europe': {
                    'junior': {'min': 35000, 'median': 45000, 'max': 55000},
                    'mid': {'min': 50000, 'median': 65000, 'max': 80000},
                    'senior': {'min': 70000, 'median': 90000, 'max': 120000}
                },
                'India': {
                    'junior': {'min': 300000, 'median': 500000, 'max': 800000},
                    'mid': {'min': 800000, 'median': 1200000, 'max': 1800000},
                    'senior': {'min': 1500000, 'median': 2000000, 'max': 3500000}
                }
            },
            'Web Developer': {
                'US': {
                    'junior': {'min': 55000, 'median': 70000, 'max': 90000},
                    'mid': {'min': 80000, 'median': 100000, 'max': 130000},
                    'senior': {'min': 110000, 'median': 140000, 'max': 180000}
                }
            },
            'Data Scientist': {
                'US': {
                    'junior': {'min': 70000, 'median': 90000, 'max': 110000},
                    'mid': {'min': 100000, 'median': 130000, 'max': 160000},
                    'senior': {'min': 140000, 'median': 180000, 'max': 250000}
                }
            }
        }
    
    def _initialize_trend_patterns(self) -> Dict[str, Dict]:
        """Initialize trend patterns for different roles"""
        return {
            'Software Developer': {
                'demand_trend': 'increasing',
                'growth_rate': 0.15,  # 15% annual growth
                'hot_skills': ['Cloud Computing', 'Microservices', 'DevOps', 'Kubernetes'],
                'declining_skills': ['Legacy Systems', 'Waterfall Methodology']
            },
            'Web Developer': {
                'demand_trend': 'stable',
                'growth_rate': 0.08,  # 8% annual growth
                'hot_skills': ['React', 'Next.js', 'TypeScript', 'GraphQL'],
                'declining_skills': ['jQuery', 'PHP']
            },
            'Data Scientist': {
                'demand_trend': 'increasing',
                'growth_rate': 0.25,  # 25% annual growth
                'hot_skills': ['Machine Learning', 'Deep Learning', 'MLOps', 'Data Engineering'],
                'declining_skills': ['Traditional BI']
            }
        }
    
    def get_salary_band(self, role: str, region: str, experience_level: str) -> Dict[str, Any]:
        """Get salary band for role, region, and experience level"""
        role_data = self.salary_data.get(role, {})
        region_data = role_data.get(region, {})
        
        if not region_data:
            # Default to US if region not found
            region_data = role_data.get('US', {})
        
        salary_info = region_data.get(experience_level, {
            'min': 50000, 'median': 70000, 'max': 100000
        })
        
        return {
            'role': role,
            'region': region,
            'experience_level': experience_level,
            'salary_min': salary_info['min'],
            'salary_median': salary_info['median'],
            'salary_max': salary_info['max'],
            'currency': 'USD' if region == 'US' else ('EUR' if region == 'Europe' else 'INR'),
            'last_updated': datetime.now().isoformat()
        }
    
    def analyze_skill_gap(self, user_skills: Dict[str, float], target_role: str, required_skills: Dict[str, float] = None) -> Dict[str, Any]:
        """Analyze skill gap between user skills and target role requirements"""
        if not required_skills:
            # Default required skills for common roles
            required_skills = self._get_default_required_skills(target_role)
        
        gaps = {}
        priority_skills = []
        
        # Calculate gaps
        for skill, required_level in required_skills.items():
            user_level = user_skills.get(skill, 0)
            gap = required_level - user_level
            
            if gap > 0:
                gaps[skill] = {
                    'user_level': user_level,
                    'required_level': required_level,
                    'gap': gap,
                    'priority': self._calculate_priority(skill, target_role, gap)
                }
                
                priority_skills.append({
                    'skill': skill,
                    'gap': gap,
                    'priority': gaps[skill]['priority']
                })
        
        # Sort by priority
        priority_skills.sort(key=lambda x: x['priority'], reverse=True)
        
        # Get trend data
        trends = self.trend_patterns.get(target_role, {})
        
        return {
            'target_role': target_role,
            'total_gaps': len(gaps),
            'skill_gaps': gaps,
            'priority_skills': priority_skills[:10],  # Top 10 priority skills
            'market_trends': {
                'demand_trend': trends.get('demand_trend', 'stable'),
                'growth_rate': trends.get('growth_rate', 0.05),
                'hot_skills': trends.get('hot_skills', []),
                'declining_skills': trends.get('declining_skills', [])
            },
            'recommendations': self._generate_gap_recommendations(gaps, priority_skills, trends)
        }
    
    def _get_default_required_skills(self, role: str) -> Dict[str, float]:
        """Get default required skills for a role"""
        defaults = {
            'Software Developer': {
                'Programming Fundamentals': 8.0,
                'Data Structures & Algorithms': 7.0,
                'Object-Oriented Programming': 8.0,
                'Version Control (Git)': 7.0,
                'Testing & Debugging': 7.0,
                'Software Design Patterns': 6.0,
                'System Design': 6.0
            },
            'Web Developer': {
                'HTML/CSS': 9.0,
                'JavaScript': 8.0,
                'Responsive Design': 8.0,
                'Frontend Frameworks': 7.0,
                'Backend Development': 6.0,
                'Database Integration': 7.0,
                'API Development': 7.0
            },
            'Data Scientist': {
                'Statistics & Probability': 8.0,
                'Python/R Programming': 8.0,
                'Data Manipulation': 8.0,
                'Data Visualization': 7.0,
                'Machine Learning Basics': 7.0,
                'SQL': 7.0,
                'Feature Engineering': 6.0
            }
        }
        
        return defaults.get(role, {
            'Technical Skills': 7.0,
            'Problem Solving': 7.0,
            'Communication': 6.0
        })
    
    def _calculate_priority(self, skill: str, role: str, gap: float) -> float:
        """Calculate priority score for a skill gap"""
        trends = self.trend_patterns.get(role, {})
        hot_skills = trends.get('hot_skills', [])
        declining_skills = trends.get('declining_skills', [])
        
        priority = gap * 10  # Base priority from gap size
        
        # Boost priority for hot skills
        if any(hot_skill.lower() in skill.lower() for hot_skill in hot_skills):
            priority *= 1.5
        
        # Reduce priority for declining skills
        if any(declining_skill.lower() in skill.lower() for declining_skill in declining_skills):
            priority *= 0.7
        
        return priority
    
    def _generate_gap_recommendations(self, gaps: Dict, priority_skills: List[Dict], trends: Dict) -> List[str]:
        """Generate recommendations based on gap analysis"""
        recommendations = []
        
        # Top priority skills
        if priority_skills:
            top_skill = priority_skills[0]
            recommendations.append(
                f"Focus on improving {top_skill['skill']} - highest priority skill gap"
            )
        
        # Hot skills recommendations
        hot_skills = trends.get('hot_skills', [])
        user_gaps_in_hot_skills = [
            skill for skill in gaps.keys()
            if any(hot_skill.lower() in skill.lower() for hot_skill in hot_skills)
        ]
        
        if user_gaps_in_hot_skills:
            recommendations.append(
                f"Consider learning: {', '.join(user_gaps_in_hot_skills[:3])} - trending skills in the market"
            )
        
        # Career growth recommendations
        growth_rate = trends.get('growth_rate', 0)
        if growth_rate > 0.15:
            recommendations.append(
                f"This role is experiencing high growth ({growth_rate*100:.0f}% annually) - great time to enter"
            )
        
        # Number of gaps
        if len(gaps) > 10:
            recommendations.append(
                f"You have {len(gaps)} skill gaps - consider focusing on top 3-5 priorities first"
            )
        elif len(gaps) < 3:
            recommendations.append(
                "You're well-aligned with this role! Consider advanced specialization"
            )
        
        return recommendations
    
    def get_job_trends(self, role: str, region: str, days: int = 30) -> Dict[str, Any]:
        """Get job trends for a role and region"""
        trends = self.trend_patterns.get(role, {})
        
        # Simulate trend data (in production, fetch from job boards)
        base_demand = 1000
        
        trend_direction = trends.get('demand_trend', 'stable')
        growth_rate = trends.get('growth_rate', 0.05)
        
        # Calculate demand trend
        if trend_direction == 'increasing':
            demand_score = min(1.0, base_demand * (1 + growth_rate) / base_demand)
        elif trend_direction == 'decreasing':
            demand_score = max(0.3, base_demand * (1 - growth_rate) / base_demand)
        else:
            demand_score = 0.7
        
        return {
            'role': role,
            'region': region,
            'demand_score': demand_score,
            'trend_direction': trend_direction,
            'growth_rate': growth_rate,
            'hot_skills': trends.get('hot_skills', []),
            'avg_jobs_posted_per_day': int(base_demand * demand_score / 30),
            'last_updated': datetime.now().isoformat()
        }
    
    def compare_salary_by_region(self, role: str, experience_level: str) -> Dict[str, Any]:
        """Compare salary bands across different regions"""
        regions = ['US', 'Europe', 'India']
        comparison = {}
        
        for region in regions:
            salary_band = self.get_salary_band(role, region, experience_level)
            comparison[region] = {
                'min': salary_band['salary_min'],
                'median': salary_band['salary_median'],
                'max': salary_band['salary_max'],
                'currency': salary_band['currency']
            }
        
        return {
            'role': role,
            'experience_level': experience_level,
            'regions': comparison,
            'highest_median': max(comparison.values(), key=lambda x: x['median']),
            'lowest_median': min(comparison.values(), key=lambda x: x['median'])
        }

