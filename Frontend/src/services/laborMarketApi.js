import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/labor-market';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Industries
export const getIndustries = () => api.get('/industries/');
export const getTrendingIndustries = () => api.get('/industries/trending/');
export const getIndustryDetails = (id) => api.get(`/industries/${id}/`);
export const getIndustryJobRoles = (id) => api.get(`/industries/${id}/job_roles/`);
export const getSubIndustries = (id) => api.get(`/industries/${id}/sub_industries/`);

// Job Roles
export const getJobRoles = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/job-roles/?${queryString}`);
};
export const getJobRoleDetails = (id) => api.get(`/job-roles/${id}/`);
export const getJobRoleSalaryInsights = (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/job-roles/${id}/salary_insights/?${queryString}`);
};
export const getJobRoleMarketTrends = (id) => api.get(`/job-roles/${id}/market_trends/`);
export const getJobRoleRequiredSkills = (id) => api.get(`/job-roles/${id}/required_skills/`);
export const getPopularJobRoles = () => api.get('/job-roles/popular_roles/');

// Skills
export const getTrendingSkills = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/skill-demand/trending_skills/?${queryString}`);
};
export const getFastestGrowingSkills = () => api.get('/skill-demand/fastest_growing/');
export const getHighPayingSkills = () => api.get('/skill-demand/high_paying/');
export const getSkillsByCategory = () => api.get('/skill-demand/by_category/');
export const getSkillDetails = (id) => api.get(`/skill-demand/${id}/`);

// Companies
export const getCompanies = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/companies/?${queryString}`);
};
export const getTopHiringCompanies = () => api.get('/companies/top_hiring/');
export const getCompanyDetails = (id) => api.get(`/companies/${id}/`);
export const getCompaniesByLocation = (location) => api.get(`/companies/by_location/?location=${location}`);

// Emerging Roles
export const getEmergingRoles = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/emerging-roles/top_emerging/?${queryString}`);
};
export const getHighestGrowthRoles = () => api.get('/emerging-roles/highest_growth/');
export const getEmergingRoleDetails = (id) => api.get(`/emerging-roles/${id}/`);

// Recommendations
export const generateRecommendations = (data) => api.post('/recommendations/generate_recommendations/', data);
export const getSkillGapAnalysis = (data) => api.post('/recommendations/skill_gap_analysis/', data);
export const getMarketInsights = () => api.get('/recommendations/market_insights/');
export const getRecommendationDetails = (id) => api.get(`/recommendations/${id}/`);

export default api;

