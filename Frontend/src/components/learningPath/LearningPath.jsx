import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  ChartBarIcon,
  BellIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const LearningPath = ({ userId, targetRole, currentSkills }) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generationForm, setGenerationForm] = useState({
    target_role: targetRole || '',
    experience_level: 'beginner',
    current_skills: currentSkills || {},
    preferences: {
      learning_intensity: 'moderate',
      hours_per_week: 10,
      preferred_types: ['course', 'project'],
      cost_preference: 'any'
    }
  });

  useEffect(() => {
    if (userId) {
      fetchLearningPaths();
    }
  }, [userId]);

  const fetchLearningPaths = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/learning-path/?user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setLearningPaths(data.learning_paths || []);
        if (data.learning_paths?.length > 0) {
          setSelectedPath(data.learning_paths[0]);
          fetchMilestoneProgress(data.learning_paths[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestoneProgress = async (pathId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/milestone-progress/?learning_path_id=${pathId}&user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setProgressData(data.progress_summary || {});
      }
    } catch (error) {
      console.error('Error fetching milestone progress:', error);
    }
  };

  const generateLearningPath = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/learning-path/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...generationForm,
          user_id: userId
        })
      });

      const data = await response.json();
      if (response.ok) {
        setLearningPaths(prev => [data.learning_path, ...prev]);
        setSelectedPath(data.learning_path);
        setShowGenerator(false);
        fetchMilestoneProgress(data.learning_path.id);
      } else {
        alert('Failed to generate learning path: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating learning path:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateMilestoneProgress = async (milestoneId, progressData) => {
    try {
      const response = await fetch('http://localhost:8000/api/milestone-progress/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          milestone_id: milestoneId,
          ...progressData
        })
      });

      if (response.ok) {
        // Refresh progress data
        fetchMilestoneProgress(selectedPath.id);
      }
    } catch (error) {
      console.error('Error updating milestone progress:', error);
    }
  };

  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'course': return BookOpenIcon;
      case 'project': return CodeBracketIcon;
      case 'certification': return AcademicCapIcon;
      case 'practice': return PlayCircleIcon;
      default: return BookOpenIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const SkillInput = ({ skill, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-700">{skill}</label>
        <span className="text-sm text-gray-500">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(skill, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  const MilestoneCard = ({ milestone, progress }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [progressForm, setProgressForm] = useState({
      progress_percentage: progress?.completion_percentage || 0,
      time_spent_minutes: 0,
      notes: '',
      feedback: ''
    });

    const IconComponent = getMilestoneIcon(milestone.milestone_type);

    return (
      <motion.div
        layout
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(milestone.status)}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{milestone.title}</h3>
              <p className="text-sm text-gray-600">{milestone.milestone_type.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              {milestone.estimated_hours}h
            </div>
            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(milestone.status)}`}>
              {milestone.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{milestone.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{milestone.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${milestone.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Skills Gained */}
        {milestone.skills_gained && milestone.skills_gained.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills You'll Gain:</h4>
            <div className="flex flex-wrap gap-2">
              {milestone.skills_gained.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {milestone.resources && milestone.resources.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resources:</h4>
            <div className="space-y-2">
              {milestone.resources.slice(0, 3).map((resource, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{resource.title}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{resource.duration_hours}h</span>
                    <div className="flex items-center">
                      <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500 ml-1">{resource.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </motion.button>
          
          {milestone.status !== 'completed' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newProgress = Math.min(100, (milestone.progress_percentage || 0) + 25);
                updateMilestoneProgress(milestone.id, {
                  progress_percentage: newProgress,
                  time_spent_minutes: 30
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Update Progress
            </motion.button>
          )}
        </div>

        {/* Detailed View */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              {/* Learning Objectives */}
              {milestone.learning_objectives && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Learning Objectives:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {milestone.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Criteria */}
              {milestone.success_criteria && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Success Criteria:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {milestone.success_criteria.map((criteria, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Update Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Update Your Progress</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Progress Percentage</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressForm.progress_percentage}
                      onChange={(e) => setProgressForm(prev => ({
                        ...prev,
                        progress_percentage: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-sm text-gray-600">
                      {progressForm.progress_percentage}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600">Time Spent (minutes)</label>
                    <input
                      type="number"
                      value={progressForm.time_spent_minutes}
                      onChange={(e) => setProgressForm(prev => ({
                        ...prev,
                        time_spent_minutes: parseInt(e.target.value) || 0
                      }))}
                      className="w-full p-2 border border-gray-200 rounded text-sm"
                      placeholder="Enter minutes spent..."
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Notes</label>
                    <textarea
                      value={progressForm.notes}
                      onChange={(e) => setProgressForm(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      className="w-full p-2 border border-gray-200 rounded text-sm"
                      rows="2"
                      placeholder="Add your notes..."
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateMilestoneProgress(milestone.id, progressForm)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save Progress
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const GeneratorForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Learning Path</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
          <input
            type="text"
            value={generationForm.target_role}
            onChange={(e) => setGenerationForm(prev => ({
              ...prev,
              target_role: e.target.value
            }))}
            className="w-full p-3 border border-gray-200 rounded-lg"
            placeholder="e.g., Software Developer, Data Scientist..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
          <select
            value={generationForm.experience_level}
            onChange={(e) => setGenerationForm(prev => ({
              ...prev,
              experience_level: e.target.value
            }))}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Current Skills</label>
          <div className="space-y-4">
            {Object.entries(generationForm.current_skills).map(([skill, value]) => (
              <SkillInput
                key={skill}
                skill={skill}
                value={value}
                onChange={(skill, value) => setGenerationForm(prev => ({
                  ...prev,
                  current_skills: {
                    ...prev.current_skills,
                    [skill]: value
                  }
                }))}
              />
            ))}
            
            <button
              onClick={() => {
                const newSkill = prompt('Enter skill name:');
                if (newSkill) {
                  setGenerationForm(prev => ({
                    ...prev,
                    current_skills: {
                      ...prev.current_skills,
                      [newSkill]: 0
                    }
                  }));
                }
              }}
              className="text-blue-600 text-sm hover:text-blue-700"
            >
              + Add Skill
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hours per Week</label>
            <input
              type="number"
              value={generationForm.preferences.hours_per_week}
              onChange={(e) => setGenerationForm(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  hours_per_week: parseInt(e.target.value) || 10
                }
              }))}
              className="w-full p-3 border border-gray-200 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Learning Intensity</label>
            <select
              value={generationForm.preferences.learning_intensity}
              onChange={(e) => setGenerationForm(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  learning_intensity: e.target.value
                }
              }))}
              className="w-full p-3 border border-gray-200 rounded-lg"
            >
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="intensive">Intensive</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGenerator(false)}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateLearningPath}
            disabled={loading || !generationForm.target_role}
            className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
              loading || !generationForm.target_role
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Path'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  if (showGenerator) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <GeneratorForm />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎯 Learning Paths
          </h1>
          <p className="text-gray-600">
            Personalized roadmaps to achieve your career goals
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Path
        </motion.button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading learning paths...</p>
        </div>
      )}

      {!loading && learningPaths.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Learning Paths Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first personalized learning path to get started on your career journey.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerator(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Learning Path
          </motion.button>
        </div>
      )}

      {!loading && learningPaths.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Path Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Your Paths</h2>
            <div className="space-y-3">
              {learningPaths.map((path) => (
                <motion.button
                  key={path.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPath(path);
                    fetchMilestoneProgress(path.id);
                  }}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedPath?.id === path.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{path.target_role}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {path.estimated_duration_weeks} weeks • {path.difficulty_level}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {path.milestones?.length || 0} milestones
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Path Details */}
          <div className="lg:col-span-3">
            {selectedPath && (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Path to {selectedPath.target_role}
                  </h2>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-semibold">{selectedPath.estimated_duration_weeks} weeks</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulty:</span>
                      <div className="font-semibold capitalize">{selectedPath.difficulty_level}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Milestones:</span>
                      <div className="font-semibold">{selectedPath.milestones?.length || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedPath.milestones?.map((milestone) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      progress={progressData[milestone.id]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
