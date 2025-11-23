// Type definitions for Labor Market Intelligence Platform

/**
 * @typedef {Object} Industry
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} growth_rate
 * @property {number} total_jobs
 * @property {string} icon
 */

/**
 * @typedef {Object} JobRole
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} industry
 * @property {string[]} required_skills
 * @property {string[]} preferred_skills
 * @property {string} education_requirements
 * @property {string} experience_level
 * @property {boolean} remote_friendly
 * @property {string[]} alternative_titles
 */

/**
 * @typedef {Object} SalaryData
 * @property {number} id
 * @property {string} city
 * @property {string} state
 * @property {string} experience_level
 * @property {number} min_salary
 * @property {number} max_salary
 * @property {number} median_salary
 * @property {number} average_salary
 */

/**
 * @typedef {Object} SalaryInsights
 * @property {number} min_salary
 * @property {number} max_salary
 * @property {number} avg_median
 * @property {SalaryData[]} data
 */

/**
 * @typedef {Object} SkillDemand
 * @property {number} id
 * @property {string} skill_name
 * @property {string} category
 * @property {number} trending_rank
 * @property {number} growth_rate
 * @property {number} job_postings_count
 * @property {number} avg_salary_premium
 * @property {string} region
 */

/**
 * @typedef {Object} CompanyInsight
 * @property {number} id
 * @property {string} company_name
 * @property {string} industry
 * @property {string} location
 * @property {string} company_size
 * @property {number} active_job_openings
 * @property {string} hiring_trend
 * @property {number} employee_satisfaction_rating
 * @property {string} growth_stage
 */

/**
 * @typedef {Object} EmergingRole
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {number} industry
 * @property {number} emergence_score
 * @property {number} growth_projection
 * @property {string[]} required_skills
 * @property {string[]} related_traditional_roles
 */

/**
 * @typedef {Object} CareerRecommendation
 * @property {number} id
 * @property {number} user
 * @property {number|null} current_role
 * @property {number} recommended_role
 * @property {number} match_score
 * @property {Object} skill_gap_analysis
 * @property {string} estimated_transition_time
 * @property {string} salary_potential
 * @property {number} market_demand_score
 * @property {string} reasoning
 * @property {Object[]} recommended_courses
 */

/**
 * @typedef {Object} MarketTrend
 * @property {number} id
 * @property {string} trend_type
 * @property {string} insights
 * @property {string} trend_direction
 * @property {number} growth_rate
 */

/**
 * @typedef {Object} SkillGapAnalysis
 * @property {string} target_role
 * @property {string[]} missing_skills
 * @property {string[]} matching_skills
 * @property {number} gap_percentage
 * @property {string} estimated_time
 * @property {Object[]} recommended_actions
 */

export {};

