import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { slideIn } from '../../utils/motion';
import { TypeAnimation } from 'react-type-animation';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineRefresh } from 'react-icons/hi';
import { FaRegSmile, FaRegFrown } from 'react-icons/fa';

const Predict = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Comprehensive career outlook database
  const careerOutlook = {
    "Applications Developer": {
      title: "Applications Developer",
      description: "Develops and maintains software applications for specific business needs",
      skills: ["Programming", "Problem Solving", "Database Management", "API Integration"],
      responsibilities: [
        "Design and develop custom software applications",
        "Collaborate with business analysts and stakeholders",
        "Maintain and update existing applications",
        "Ensure code quality and performance"
      ],
      salary: "$65,000 - $120,000",
      growth: "High growth potential with increasing demand for custom business solutions",
      companies: ["Microsoft", "Oracle", "Salesforce", "Startups", "Enterprise Companies"],
      certifications: ["AWS Developer", "Microsoft Certified Developer", "Oracle Certified Professional"]
    },
    "CRM Technical Developer": {
      title: "CRM Technical Developer",
      description: "Specializes in developing and customizing Customer Relationship Management systems",
      skills: ["CRM Platforms", "Database Design", "API Development", "Business Process Automation"],
      responsibilities: [
        "Customize CRM systems (Salesforce, HubSpot, etc.)",
        "Develop custom workflows and automation",
        "Integrate CRM with other business systems",
        "Create custom reports and dashboards"
      ],
      salary: "$70,000 - $130,000",
      growth: "Excellent growth as businesses increasingly rely on CRM systems",
      companies: ["Salesforce", "HubSpot", "Microsoft", "Oracle", "Consulting Firms"],
      certifications: ["Salesforce Developer", "HubSpot Developer", "Microsoft Dynamics 365"]
    },
    "Database Developer": {
      title: "Database Developer",
      description: "Designs, develops, and maintains database systems and data solutions",
      skills: ["SQL", "Database Design", "Data Modeling", "Performance Optimization"],
      responsibilities: [
        "Design and implement database schemas",
        "Write complex SQL queries and stored procedures",
        "Optimize database performance",
        "Ensure data security and integrity"
      ],
      salary: "$75,000 - $140,000",
      growth: "Strong demand as data becomes increasingly valuable",
      companies: ["Oracle", "Microsoft", "Amazon", "Financial Institutions", "Tech Companies"],
      certifications: ["Oracle Database Administrator", "Microsoft SQL Server", "AWS Database Specialty"]
    },
    "Mobile Applications Developer": {
      title: "Mobile Applications Developer",
      description: "Creates applications for mobile devices (iOS and Android)",
      skills: ["Mobile Development", "UI/UX Design", "Cross-platform Development", "App Store Optimization"],
      responsibilities: [
        "Develop native and cross-platform mobile apps",
        "Design intuitive user interfaces",
        "Optimize app performance and battery usage",
        "Publish and maintain apps on app stores"
      ],
      salary: "$80,000 - $150,000",
      growth: "Excellent growth with mobile-first approach becoming standard",
      companies: ["Apple", "Google", "Facebook", "Uber", "Startups", "Enterprise"],
      certifications: ["Apple Developer", "Google Developer", "React Native", "Flutter"]
    },
    "Network Security Engineer": {
      title: "Network Security Engineer",
      description: "Protects computer networks and systems from cyber threats",
      skills: ["Network Security", "Cybersecurity", "Firewall Management", "Incident Response"],
      responsibilities: [
        "Design and implement security protocols",
        "Monitor network for security breaches",
        "Respond to security incidents",
        "Conduct security audits and assessments"
      ],
      salary: "$85,000 - $160,000",
      growth: "Very high growth due to increasing cyber threats",
      companies: ["Cisco", "Palo Alto Networks", "Fortinet", "Government", "Financial Services"],
      certifications: ["CISSP", "CISM", "CompTIA Security+", "Cisco CCNA Security"]
    },
    "Software Developer": {
      title: "Software Developer",
      description: "Writes, tests, and maintains code for software applications",
      skills: ["Programming", "Problem Solving", "Version Control", "Testing"],
      responsibilities: [
        "Write clean, efficient code",
        "Debug and fix software issues",
        "Collaborate with development teams",
        "Participate in code reviews"
      ],
      salary: "$70,000 - $140,000",
      growth: "High growth with increasing software demand",
      companies: ["Google", "Microsoft", "Amazon", "Startups", "Enterprise"],
      certifications: ["AWS Developer", "Microsoft Certified Developer", "Google Developer"]
    },
    "Software Engineer": {
      title: "Software Engineer",
      description: "Applies engineering principles to software development",
      skills: ["Software Architecture", "System Design", "Problem Solving", "Team Leadership"],
      responsibilities: [
        "Design software architecture and systems",
        "Lead development teams and projects",
        "Implement best practices and standards",
        "Mentor junior developers"
      ],
      salary: "$90,000 - $180,000",
      growth: "Excellent growth with leadership opportunities",
      companies: ["Google", "Microsoft", "Amazon", "Meta", "Netflix", "Tech Giants"],
      certifications: ["AWS Solutions Architect", "Microsoft Azure", "Google Cloud Professional"]
    },
    "Software Quality Assurance (QA) / Testing": {
      title: "Software Quality Assurance (QA) / Testing",
      description: "Ensures software quality through comprehensive testing",
      skills: ["Testing Methodologies", "Automation", "Bug Tracking", "Quality Standards"],
      responsibilities: [
        "Design and execute test plans",
        "Automate testing processes",
        "Report and track software bugs",
        "Ensure software meets quality standards"
      ],
      salary: "$65,000 - $130,000",
      growth: "Good growth with increasing focus on software quality",
      companies: ["Tech Companies", "Consulting Firms", "Enterprise", "Startups"],
      certifications: ["ISTQB", "Selenium", "JIRA", "Test Automation"]
    },
    "Systems Security Administrator": {
      title: "Systems Security Administrator",
      description: "Manages and secures computer systems and networks",
      skills: ["System Administration", "Security", "Network Management", "Backup & Recovery"],
      responsibilities: [
        "Manage system security policies",
        "Monitor system performance and security",
        "Implement backup and disaster recovery",
        "Maintain system documentation"
      ],
      salary: "$75,000 - $140,000",
      growth: "Good growth with increasing security focus",
      companies: ["Government", "Financial Services", "Healthcare", "Tech Companies"],
      certifications: ["CompTIA Security+", "Microsoft Certified: Security", "Linux Security"]
    },
    "Technical Support": {
      title: "Technical Support",
      description: "Provides technical assistance and support to users",
      skills: ["Customer Service", "Technical Troubleshooting", "Communication", "Problem Solving"],
      responsibilities: [
        "Resolve technical issues for users",
        "Provide customer support and training",
        "Document solutions and procedures",
        "Escalate complex issues to specialists"
      ],
      salary: "$45,000 - $85,000",
      growth: "Steady growth with opportunities to advance to specialized roles",
      companies: ["Tech Companies", "Software Vendors", "Enterprise", "Service Providers"],
      certifications: ["CompTIA A+", "Microsoft Certified: Modern Desktop", "ITIL Foundation"]
    },
    "UX Designer": {
      title: "UX Designer",
      description: "Designs user experiences that are intuitive and engaging",
      skills: ["User Research", "Wireframing", "Prototyping", "User Testing"],
      responsibilities: [
        "Conduct user research and usability testing",
        "Create wireframes and prototypes",
        "Design user interfaces and interactions",
        "Collaborate with developers and stakeholders"
      ],
      salary: "$70,000 - $140,000",
      growth: "Excellent growth with increasing focus on user experience",
      companies: ["Google", "Apple", "Facebook", "Design Agencies", "Tech Companies"],
      certifications: ["Google UX Design", "Nielsen Norman Group", "Interaction Design Foundation"]
    },
    "Web Developer": {
      title: "Web Developer",
      description: "Builds and maintains websites and web applications",
      skills: ["HTML/CSS", "JavaScript", "Frontend Frameworks", "Backend Development"],
      responsibilities: [
        "Develop responsive websites and web apps",
        "Optimize website performance and SEO",
        "Ensure cross-browser compatibility",
        "Maintain and update web content"
      ],
      salary: "$60,000 - $130,000",
      growth: "High growth with increasing web presence needs",
      companies: ["Web Agencies", "Tech Companies", "E-commerce", "Startups"],
      certifications: ["Google Developer", "Microsoft Web Development", "AWS Web Development"]
    }
  };

  useEffect(() => {
    // Check if prediction data exists in location state
    if (location.state && location.state.prediction !== undefined) {
      console.log('Received prediction data:', location.state);
      setPrediction(location.state.prediction);
      setProbability(location.state.probability);
      setLoading(false);
    } else {
      // If no prediction data, redirect to quiz
      navigate('/quiz');
    }
  }, [location.state, navigate]);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/get/sentiment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: feedback }),
      });

      if (response.ok) {
        const data = await response.json();
        setSentiment(data.prediction);
        alert('Feedback submitted successfully!');
      } else {
        alert('Error submitting feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleRetakeQuiz = () => {
    navigate('/quiz');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToChat = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white text-xl mt-4">Analyzing your future...</p>
        </div>
      </div>
    );
  }

  // Use the actual prediction data from backend directly
  const predictedRole = prediction || "Unknown Role";
  const confidencePercentage = location.state?.confidence_percentage || Math.round(probability * 100);
  
  // Debug logging
  console.log('Current prediction state:', prediction);
  console.log('Current probability state:', probability);
  console.log('Location state:', location.state);
  console.log('Final predictedRole:', predictedRole);
  console.log('Final confidencePercentage:', confidencePercentage);

  return (
    <div className="flex flex-col gap-10 overflow-hidden min-h-screen bg-black">
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] p-8 rounded-xl"
      >
        <div className="text-center mb-8">
          <TypeAnimation
            className="text-cyan-600 font-semibold text-6xl mb-4"
            sequence={["Your Career Prediction is Ready!"]}
            wrapper="span"
            cursor={false}
            style={{ display: "inline-block" }}
          />
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Prediction Result Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-red-900 to-red-700 p-8 rounded-2xl shadow-2xl mb-8"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                🎯 Your Predicted Career Path
              </h2>
              <div className="bg-white bg-opacity-10 p-6 rounded-xl mb-6">
                <h3 className="text-6xl font-bold text-yellow-400 mb-2">
                  {predictedRole}
                </h3>
                <p className="text-xl text-gray-300">
                  Confidence: {confidencePercentage}%
                </p>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md bg-gray-800 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${confidencePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <button
              onClick={handleRetakeQuiz}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <HiOutlineRefresh className="text-xl" />
              Retake Quiz
            </button>
            
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FaRegSmile className="text-xl" />
              Give Feedback
            </button>
            
            <button
              onClick={handleGoToChat}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              💬 Chat with AI
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <HiOutlineArrowLeft className="text-xl" />
              Go Home
            </button>
          </motion.div>

          {/* Feedback Section */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-900 p-6 rounded-xl mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Share Your Thoughts</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think about this prediction..."
                className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
                rows="4"
              />
              
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleFeedbackSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
              </div>

              {sentiment && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    {sentiment === 'positive' ? (
                      <FaRegSmile className="text-green-400 text-xl" />
                    ) : (
                      <FaRegFrown className="text-red-400 text-xl" />
                    )}
                    <span className="text-white">
                      Sentiment: {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Comprehensive Career Outlook */}
          {careerOutlook[predictedRole] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-xl shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-white mb-6 text-center">
                🚀 Career Outlook: {careerOutlook[predictedRole].title}
              </h3>
              
              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-cyan-400 mb-3">Role Description</h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {careerOutlook[predictedRole].description}
                </p>
              </div>

              {/* Skills Required */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-green-400 mb-3">Key Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {careerOutlook[predictedRole].skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-600 bg-opacity-20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-blue-400 mb-3">Main Responsibilities</h4>
                <ul className="text-gray-300 space-y-2">
                  {careerOutlook[predictedRole].responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Salary and Growth */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">💰 Salary Range</h4>
                  <p className="text-white text-xl font-bold">{careerOutlook[predictedRole].salary}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">📈 Growth Potential</h4>
                  <p className="text-gray-300">{careerOutlook[predictedRole].growth}</p>
                </div>
              </div>

              {/* Companies and Certifications */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-orange-400 mb-3">🏢 Top Companies</h4>
                  <div className="flex flex-wrap gap-2">
                    {careerOutlook[predictedRole].companies.map((company, index) => (
                      <span
                        key={index}
                        className="bg-orange-600 bg-opacity-20 text-orange-400 px-3 py-1 rounded-full text-sm border border-orange-500"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-pink-400 mb-3">🎓 Recommended Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {careerOutlook[predictedRole].certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="bg-pink-600 bg-opacity-20 text-pink-400 px-3 py-1 rounded-full text-sm border border-pink-500"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Predict; 