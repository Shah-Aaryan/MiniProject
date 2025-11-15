import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ExplainableAI from '../explainableAI/ExplainableAI';
import LearningPath from '../learningPath/LearningPath';
import { styles } from '../../styles';
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  LightBulbIcon,
  ArrowPathIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// Career Insights Data
const careerInsights = {
  'Software Developer': {
    salary: '$75,000 - $150,000',
    growth: '+22% (Much faster than average)',
    description: 'Design, develop, and maintain software applications. Work with various programming languages and frameworks to create solutions.',
    keySkills: ['Programming', 'Problem Solving', 'Debugging', 'Version Control', 'Agile Methodologies'],
    industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
    dailyTasks: ['Writing code', 'Code reviews', 'Bug fixing', 'Testing', 'Documentation'],
    careerPath: 'Junior Developer → Mid-level Developer → Senior Developer → Lead Developer → Engineering Manager',
    topCompanies: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta']
  },
  'Web Developer': {
    salary: '$60,000 - $120,000',
    growth: '+13% (Faster than average)',
    description: 'Create and maintain websites and web applications. Specialize in frontend, backend, or full-stack development.',
    keySkills: ['HTML/CSS', 'JavaScript', 'React/Vue/Angular', 'Backend Development', 'Responsive Design'],
    industries: ['Digital Agencies', 'E-commerce', 'Media', 'Startups', 'Consulting'],
    dailyTasks: ['Building UI components', 'API integration', 'Performance optimization', 'Cross-browser testing'],
    careerPath: 'Junior Web Developer → Web Developer → Senior Web Developer → Tech Lead → CTO',
    topCompanies: ['Shopify', 'Squarespace', 'WordPress', 'Wix', 'Adobe']
  },
  'UX Designer': {
    salary: '$65,000 - $130,000',
    growth: '+16% (Much faster than average)',
    description: 'Design user-centered digital experiences. Conduct research, create wireframes, and ensure products are intuitive and accessible.',
    keySkills: ['User Research', 'Wireframing', 'Prototyping', 'Figma/Sketch', 'Usability Testing'],
    industries: ['Tech Companies', 'Design Agencies', 'Consulting', 'E-commerce', 'Finance'],
    dailyTasks: ['User research', 'Creating wireframes', 'Design testing', 'Stakeholder presentations'],
    careerPath: 'Junior UX Designer → UX Designer → Senior UX Designer → Lead Designer → Design Director',
    topCompanies: ['Apple', 'Airbnb', 'IDEO', 'Figma', 'Adobe']
  },
  'Database Developer': {
    salary: '$70,000 - $135,000',
    growth: '+10% (Faster than average)',
    description: 'Design, implement, and maintain database systems. Optimize queries and ensure data integrity and security.',
    keySkills: ['SQL', 'Database Design', 'Query Optimization', 'Data Modeling', 'ETL Processes'],
    industries: ['Finance', 'Healthcare', 'E-commerce', 'Technology', 'Government'],
    dailyTasks: ['Database design', 'Query optimization', 'Performance tuning', 'Backup management'],
    careerPath: 'Database Developer → Senior Database Developer → Database Architect → Data Engineering Manager',
    topCompanies: ['Oracle', 'Microsoft', 'IBM', 'Amazon AWS', 'MongoDB']
  },
  'Network Security Engineer': {
    salary: '$80,000 - $160,000',
    growth: '+33% (Much faster than average)',
    description: 'Protect organizations from cyber threats. Implement security measures, monitor networks, and respond to incidents.',
    keySkills: ['Network Security', 'Ethical Hacking', 'Firewall Management', 'Incident Response', 'Security Auditing'],
    industries: ['Cybersecurity Firms', 'Finance', 'Government', 'Healthcare', 'Technology'],
    dailyTasks: ['Security monitoring', 'Vulnerability assessments', 'Incident response', 'Security policy creation'],
    careerPath: 'Security Analyst → Security Engineer → Senior Security Engineer → Security Architect → CISO',
    topCompanies: ['Cisco', 'Palo Alto Networks', 'CrowdStrike', 'FireEye', 'IBM Security']
  },
  'Mobile Applications Developer': {
    salary: '$70,000 - $145,000',
    growth: '+22% (Much faster than average)',
    description: 'Develop applications for mobile devices. Work with iOS, Android, or cross-platform frameworks.',
    keySkills: ['Swift/Kotlin', 'React Native/Flutter', 'Mobile UI/UX', 'API Integration', 'App Store Optimization'],
    industries: ['App Development', 'Gaming', 'E-commerce', 'Social Media', 'FinTech'],
    dailyTasks: ['Mobile app development', 'UI implementation', 'Testing on devices', 'App store deployment'],
    careerPath: 'Junior Mobile Developer → Mobile Developer → Senior Mobile Developer → Mobile Architect',
    topCompanies: ['Apple', 'Google', 'Meta', 'Uber', 'Spotify']
  },
  'Software Quality Assurance (QA) / Testing': {
    salary: '$55,000 - $110,000',
    growth: '+12% (Faster than average)',
    description: 'Ensure software quality through testing. Create test plans, execute tests, and report bugs.',
    keySkills: ['Test Planning', 'Automation Testing', 'Bug Tracking', 'Selenium', 'Performance Testing'],
    industries: ['Software Companies', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
    dailyTasks: ['Test case creation', 'Test execution', 'Bug reporting', 'Automation script development'],
    careerPath: 'QA Tester → QA Engineer → Senior QA Engineer → QA Lead → QA Manager',
    topCompanies: ['Microsoft', 'Amazon', 'Google', 'Salesforce', 'Adobe']
  },
  'Technical Support': {
    salary: '$40,000 - $80,000',
    growth: '+8% (As fast as average)',
    description: 'Provide technical assistance to users. Troubleshoot issues, answer questions, and maintain customer satisfaction.',
    keySkills: ['Problem Solving', 'Communication', 'Troubleshooting', 'Customer Service', 'Technical Knowledge'],
    industries: ['Technology', 'Software', 'Telecommunications', 'Manufacturing', 'Healthcare'],
    dailyTasks: ['Answering support tickets', 'Remote troubleshooting', 'Documentation', 'User training'],
    careerPath: 'Support Technician → Technical Support Specialist → Senior Support Engineer → Support Manager',
    topCompanies: ['Apple', 'Microsoft', 'Dell', 'HP', 'Cisco']
  },
  'Software Engineer': {
    salary: '$80,000 - $160,000',
    growth: '+22% (Much faster than average)',
    description: 'Apply engineering principles to software development. Design scalable systems and write efficient code.',
    keySkills: ['System Design', 'Algorithms', 'Software Architecture', 'Programming', 'Problem Solving'],
    industries: ['Technology', 'Finance', 'Automotive', 'Aerospace', 'Healthcare'],
    dailyTasks: ['System design', 'Code development', 'Architecture planning', 'Code reviews'],
    careerPath: 'Software Engineer → Senior Software Engineer → Staff Engineer → Principal Engineer',
    topCompanies: ['Google', 'Meta', 'Amazon', 'Netflix', 'Tesla']
  },
  'Applications Developer': {
    salary: '$70,000 - $135,000',
    growth: '+18% (Much faster than average)',
    description: 'Develop software applications for specific business needs. Work on desktop, web, or mobile applications.',
    keySkills: ['Application Development', 'Programming', 'Database Integration', 'UI/UX', 'Testing'],
    industries: ['Enterprise Software', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'],
    dailyTasks: ['Application development', 'Requirements analysis', 'Integration', 'User training'],
    careerPath: 'Junior App Developer → Application Developer → Senior App Developer → Application Architect',
    topCompanies: ['SAP', 'Oracle', 'Salesforce', 'IBM', 'Microsoft']
  },
  'CRM Technical Developer': {
    salary: '$75,000 - $140,000',
    growth: '+15% (Much faster than average)',
    description: 'Customize and develop CRM systems. Integrate business processes with customer relationship management platforms.',
    keySkills: ['CRM Platforms', 'JavaScript', 'API Integration', 'Business Process', 'Data Migration'],
    industries: ['Sales & Marketing', 'Consulting', 'Technology', 'Healthcare', 'Finance'],
    dailyTasks: ['CRM customization', 'Workflow automation', 'Data integration', 'User support'],
    careerPath: 'CRM Developer → Senior CRM Developer → CRM Architect → CRM Solutions Architect',
    topCompanies: ['Salesforce', 'Microsoft Dynamics', 'HubSpot', 'Zoho', 'Oracle']
  },
  'Systems Security Administrator': {
    salary: '$70,000 - $130,000',
    growth: '+28% (Much faster than average)',
    description: 'Manage and maintain security systems. Monitor for threats, implement security policies, and ensure compliance.',
    keySkills: ['System Administration', 'Security Tools', 'Network Security', 'Compliance', 'Monitoring'],
    industries: ['IT Services', 'Finance', 'Government', 'Healthcare', 'Retail'],
    dailyTasks: ['Security monitoring', 'System maintenance', 'Policy enforcement', 'Incident investigation'],
    careerPath: 'Security Administrator → Senior Security Admin → Security Manager → IT Security Director',
    topCompanies: ['IBM', 'Cisco', 'Symantec', 'McAfee', 'Fortinet']
  }
};

const EnhancedResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('results');
  const [predictionData, setPredictionData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [savedToProfile, setSavedToProfile] = useState(false);

  useEffect(() => {
    // Get prediction data from navigation state or localStorage
    const data = location.state?.predictionData || 
                 JSON.parse(localStorage.getItem('latestPrediction') || 'null');
    
    if (data) {
      setPredictionData(data);
      // Save to localStorage for persistence
      localStorage.setItem('latestPrediction', JSON.stringify(data));
    } else {
      // Redirect to quiz if no data
      navigate('/quiz');
    }

    // Get user ID from localStorage or context
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    }
  }, [location, navigate]);

  const saveToProfile = async () => {
    if (!userId || !predictionData) return;

    try {
      // Create or update user profile with prediction results
      const response = await fetch('http://localhost:8000/api/user-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          skills: extractSkillsFromPrediction(predictionData),
          preferences: {
            predicted_role: predictionData.prediction,
            confidence: predictionData.confidence_percentage,
            last_prediction_date: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        setSavedToProfile(true);
        // Show success message
        setTimeout(() => setSavedToProfile(false), 3000);
      }
    } catch (error) {
      console.error('Error saving to profile:', error);
    }
  };

  const extractSkillsFromPrediction = (data) => {
    // Extract skills from feature importance data
    const skills = {};
    if (data.explainable_ai?.feature_importance?.feature_importance) {
      Object.entries(data.explainable_ai.feature_importance.feature_importance).forEach(([skill, info]) => {
        // Map skill values from 0-10 scale
        const value = info.user_value || 0;
        // Normalize to 0-10 if needed
        skills[skill] = value > 10 ? Math.round(value / 10) : value;
      });
    }
    // If no skills found, provide default skill set
    if (Object.keys(skills).length === 0) {
      return {
        'Programming Skills': 5,
        'Problem Solving': 5,
        'Communication': 5,
        'Teamwork': 5,
        'Project Management': 3
      };
    }
    return skills;
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Career Prediction Results',
          text: `I got ${predictionData?.prediction} with ${predictionData?.confidence_percentage}% confidence!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `My Career Prediction: ${predictionData?.prediction} (${predictionData?.confidence_percentage}% confidence)`;
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  const retakeQuiz = () => {
    localStorage.removeItem('latestPrediction');
    navigate('/quiz');
  };

  if (!predictionData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your results...</p>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-red-600 text-white shadow-lg' 
          : 'bg-transparent text-white hover:bg-gray-900 border border-white/20 hover:border-white/40'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </motion.button>
  );

  const ResultsSummary = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Result Card */}
      <div className="bg-gradient-to-r from-red-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-4xl">🎯</span>
          </motion.div>
          
          <h1 className="text-2xl font-semibold mb-2 text-white">Your Predicted Career Path</h1>
          <h2 className="text-5xl font-bold mb-6 text-white">
            {predictionData.prediction}
          </h2>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="text-4xl font-bold text-white">{predictionData.confidence_percentage}%</div>
            <div className="text-xl text-white/90">Confidence</div>
          </div>
          
          <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-4 mb-6">
            <motion.div 
              className="bg-white h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${predictionData.confidence_percentage}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            ></motion.div>
          </div>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Based on your responses, this career path aligns well with your skills and interests.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveToProfile}
          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
            savedToProfile 
              ? 'border-green-500 bg-green-500/20 text-green-400' 
              : 'border-white/20 bg-transparent text-white hover:bg-indigo-600 hover:border-indigo-600'
          }`}
        >
          <BookmarkIcon className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">
            {savedToProfile ? 'Saved!' : 'Save to Profile'}
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareResults}
          className="p-4 rounded-lg border-2 border-white/20 bg-transparent text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300"
        >
          <ShareIcon className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Share Results</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={retakeQuiz}
          className="p-4 rounded-lg border-2 border-white/20 bg-transparent text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300"
        >
          <ArrowPathIcon className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Retake Quiz</div>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-transparent border border-white/20 p-6 rounded-xl hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <ChartBarIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{predictionData.confidence_percentage}%</div>
            <div className="text-white/70 text-sm">Prediction Confidence</div>
          </div>
        </div>

        <div className="bg-transparent border border-white/20 p-6 rounded-xl hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <LightBulbIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {predictionData.explainable_ai?.counterfactual_tips?.length || 0}
            </div>
            <div className="text-white/70 text-sm">Improvement Tips</div>
          </div>
        </div>

        <div className="bg-transparent border border-white/20 p-6 rounded-xl hover:border-white/40 transition-all duration-300">
          <div className="text-center">
            <AcademicCapIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {Object.keys(predictionData.explainable_ai?.feature_importance?.feature_importance || {}).length}
            </div>
            <div className="text-white/70 text-sm">Skills Analyzed</div>
          </div>
        </div>
      </div>

      {/* Career Insights Section */}
      {careerInsights[predictionData.prediction] && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <BriefcaseIcon className="w-8 h-8 text-blue-600 mr-3" />
              Career Insights: {predictionData.prediction}
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat', { state: { initialMessage: `Tell me more about ${predictionData.prediction} career` }})}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Ask AI Chatbot</span>
            </motion.button>
          </div>

          <p className="text-gray-700 mb-6 text-lg">{careerInsights[predictionData.prediction].description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Salary Info */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-800">Salary Range</h4>
              </div>
              <p className="text-2xl font-bold text-green-700">{careerInsights[predictionData.prediction].salary}</p>
              <p className="text-sm text-gray-600 mt-1">Annual (USD)</p>
            </div>

            {/* Growth Rate */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-800">Job Market Growth</h4>
              </div>
              <p className="text-xl font-bold text-blue-700">{careerInsights[predictionData.prediction].growth}</p>
              <p className="text-sm text-gray-600 mt-1">Next 10 years</p>
            </div>
          </div>

          {/* Key Skills */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">🔑 Key Skills Required:</h4>
            <div className="flex flex-wrap gap-2">
              {careerInsights[predictionData.prediction].keySkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">🏢 Top Industries:</h4>
            <div className="flex flex-wrap gap-2">
              {careerInsights[predictionData.prediction].industries.map((industry, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {industry}
                </span>
              ))}
            </div>
          </div>

          {/* Daily Tasks */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">📋 Typical Daily Tasks:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {careerInsights[predictionData.prediction].dailyTasks.map((task, idx) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {task}
                </li>
              ))}
            </ul>
          </div>

          {/* Career Path */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">🎯 Career Progression Path:</h4>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <p className="text-gray-800 font-medium">{careerInsights[predictionData.prediction].careerPath}</p>
            </div>
          </div>

          {/* Top Companies */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">🌟 Top Companies Hiring:</h4>
            <div className="flex flex-wrap gap-3">
              {careerInsights[predictionData.prediction].topCompanies.map((company, idx) => (
                <span key={idx} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium border border-gray-300">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-transparent border border-white/20 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          Recommended Next Steps
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-transparent border border-white/10 hover:border-white/30 transition-colors">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div>
              <div className="font-medium text-white mb-1">Explore the AI Explanation</div>
              <div className="text-sm text-white/70">Understand why this career was recommended for you</div>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-transparent border border-white/10 hover:border-white/30 transition-colors">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <div>
              <div className="font-medium text-white mb-1">Review Improvement Tips</div>
              <div className="text-sm text-white/70">See specific ways to strengthen your profile</div>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-transparent border border-white/10 hover:border-white/30 transition-colors">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <div>
              <div className="font-medium text-white mb-1">Generate Learning Path</div>
              <div className="text-sm text-white/70">Get a personalized roadmap to achieve your career goals</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.sectionHeadText}
          >
            Career Prediction Results
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mt-4"
          >
            Comprehensive analysis of your career prediction with AI-powered insights
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <TabButton 
            id="results" 
            label="Results Overview" 
            icon={ChartBarIcon}
            isActive={activeTab === 'results'}
            onClick={setActiveTab}
          />
          <TabButton 
            id="explanation" 
            label="AI Explanation" 
            icon={LightBulbIcon}
            isActive={activeTab === 'explanation'}
            onClick={setActiveTab}
          />
          <TabButton 
            id="learning" 
            label="Learning Path" 
            icon={AcademicCapIcon}
            isActive={activeTab === 'learning'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'results' && <ResultsSummary />}
            
            {activeTab === 'explanation' && (
              <ExplainableAI 
                explainableData={predictionData.explainable_ai}
                prediction={predictionData.prediction}
              />
            )}
            
            {activeTab === 'learning' && userId && (
              <LearningPath 
                userId={userId}
                targetRole={predictionData.prediction}
                currentSkills={extractSkillsFromPrediction(predictionData)}
              />
            )}
            
            {activeTab === 'learning' && !userId && (
              <div className="text-center py-12 bg-transparent border border-white/20 rounded-xl p-8">
                <AcademicCapIcon className="w-16 h-16 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Please sign in to access personalized learning paths and track your progress.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signin')}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                >
                  Sign In
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedResults;
