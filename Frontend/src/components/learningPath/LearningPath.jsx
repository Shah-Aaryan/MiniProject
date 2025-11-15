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
  const [error, setError] = useState(null);
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

  // Auto-show generator if no paths exist and we have target role
  useEffect(() => {
    if (targetRole && learningPaths.length === 0 && !loading) {
      setShowGenerator(true);
    }
  }, [targetRole, learningPaths.length, loading]);

  useEffect(() => {
    // Validate userId on mount
    if (!userId) {
      console.warn('LearningPath: No userId provided. User may need to sign in.');
      setError('Please sign in to access learning paths.');
      return;
    }
    
    if (userId) {
      fetchLearningPaths();
    }
  }, [userId]);

  const fetchLearningPaths = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/learning-path/?user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        // Remove duplicates by ID
        const uniquePaths = [];
        const seenIds = new Set();
        (data.learning_paths || []).forEach(path => {
          if (!seenIds.has(path.id)) {
            seenIds.add(path.id);
            uniquePaths.push(path);
          }
        });
        
        setLearningPaths(uniquePaths);
        if (uniquePaths.length > 0) {
          // Set selected path to first one or keep current selection if it exists
          const currentSelected = selectedPath?.id;
          const pathToSelect = uniquePaths.find(p => p.id === currentSelected) || uniquePaths[0];
          setSelectedPath(pathToSelect);
          fetchMilestoneProgress(pathToSelect.id);
        }
      } else {
        setError(data.error || 'Failed to fetch learning paths');
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      setError('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestoneProgress = async (pathId) => {
    try {
      console.log('Fetching progress for path:', pathId);
      const response = await fetch(`http://127.0.0.1:8000/api/milestone-progress/?learning_path_id=${pathId}&user_id=${userId}`);
      const data = await response.json();
      console.log('Progress data received:', data);
      
      if (response.ok && data.progress_summary) {
        // Transform array to object keyed by milestone ID
        const progressMap = {};
        
        if (Array.isArray(data.progress_summary)) {
          data.progress_summary.forEach(item => {
            if (item.milestone && item.milestone.id) {
              // Store the entire milestone data with updated progress
              progressMap[item.milestone.id] = {
                milestone: item.milestone,
                latest_progress: item.latest_progress
              };
            }
          });
        }
        
        setProgressData(progressMap);
        console.log('Progress map created:', progressMap);
      }
    } catch (error) {
      console.error('Error fetching milestone progress:', error);
    }
  };

  const generateLearningPath = async () => {
    setLoading(true);
    try {
      // Prepare the request with proper structure
      const requestData = {
        user_id: userId,
        target_role: generationForm.target_role || targetRole,
        experience_level: generationForm.experience_level || 'beginner',
        current_skills: generationForm.current_skills || currentSkills || {},
        preferences: {
          learning_intensity: generationForm.preferences?.learning_intensity || 'moderate',
          hours_per_week: generationForm.preferences?.hours_per_week || 10,
          preferred_types: generationForm.preferences?.preferred_types || ['course', 'project'],
          cost_preference: generationForm.preferences?.cost_preference || 'any'
        }
      };

      // Validate userId
      if (!requestData.user_id) {
        setError('User ID is missing. Please sign in again.');
        setLoading(false);
        return;
      }

      console.log('Generating learning path with:', requestData);

      const response = await fetch('http://127.0.0.1:8000/api/learning-path/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Learning path response:', data);
      
      if (response.ok && data.success) {
        if (data.learning_path) {
          // Check if path already exists to prevent duplicates
          setLearningPaths(prev => {
            const existingIndex = prev.findIndex(p => p.id === data.learning_path.id);
            if (existingIndex >= 0) {
              // Update existing path
              const updated = [...prev];
              updated[existingIndex] = data.learning_path;
              return updated;
            }
            // Add new path
            return [data.learning_path, ...prev];
          });
          setSelectedPath(data.learning_path);
          setShowGenerator(false);
          setError(null);
          if (data.learning_path.id) {
            fetchMilestoneProgress(data.learning_path.id);
          }
          // Show success message
          setTimeout(() => {
            alert(`✅ Learning path created!\n\n📚 ${data.generation_details?.milestones_count || 0} milestones\n⏱️ ${data.generation_details?.estimated_weeks || 0} weeks\n🎯 ${data.generation_details?.skill_gaps || 0} skill gaps identified`);
          }, 100);
        } else {
          setError('Learning path created but no data returned');
        }
      } else {
        const errorMsg = data.error || data.message || 'Unknown error';
        console.error('Error response:', data);
        setError(`Failed to generate: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error generating learning path:', error);
      setError(`Network error: ${error.message}. Please check if the backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const updateMilestoneProgress = async (milestoneId, progressData) => {
    try {
      console.log('Updating milestone:', milestoneId, 'with data:', progressData);
      
      const response = await fetch('http://127.0.0.1:8000/api/milestone-progress/', {
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

      const result = await response.json();
      console.log('Progress update response:', result);

      if (response.ok && result.success) {
        // Use the milestone data from backend response
        const updatedMilestone = result.milestone;
        
        // Update milestone in selectedPath with backend data
        if (selectedPath && selectedPath.milestones) {
          const updatedMilestones = selectedPath.milestones.map(m => {
            if (m.id === milestoneId) {
              return {
                ...m,
                ...updatedMilestone,
                progress_percentage: updatedMilestone.progress_percentage,
                status: updatedMilestone.status
              };
            }
            return m;
          });
          
          setSelectedPath(prev => ({ ...prev, milestones: updatedMilestones }));
          
          // Also update learningPaths state to persist changes
          setLearningPaths(prevPaths => 
            prevPaths.map(path => 
              path.id === selectedPath.id 
                ? { ...path, milestones: updatedMilestones }
                : path
            )
          );
        }
        
        return true;
      } else {
        console.error('Update failed:', result);
        return false;
      }
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      return false;
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
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Get the actual progress percentage from either the progress object or milestone
    const currentProgress = milestone?.progress_percentage || 0;
    
    const [progressForm, setProgressForm] = useState({
      progress_percentage: currentProgress,
      time_spent_minutes: 0,
      notes: '',
      feedback: ''
    });

    // Update progressForm when milestone changes
    useEffect(() => {
      const newProgress = milestone?.progress_percentage || 0;
      setProgressForm(prev => ({
        ...prev,
        progress_percentage: newProgress
      }));
    }, [milestone?.progress_percentage, milestone?.id]);

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
              onClick={async () => {
                setIsUpdating(true);
                const newProgress = Math.min(100, progressForm.progress_percentage + 25);
                const updatedForm = {
                  progress_percentage: newProgress,
                  time_spent_minutes: progressForm.time_spent_minutes + 30
                };
                console.log('Quick update button clicked:', { milestoneId: milestone.id, updatedForm });
                setProgressForm(prev => ({ ...prev, ...updatedForm }));
                const success = await updateMilestoneProgress(milestone.id, updatedForm);
                setIsUpdating(false);
                if (success) {
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                } else {
                  alert('Failed to update progress. Please try again.');
                }
              }}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-lg transition-all text-sm flex items-center justify-center ${
                isUpdating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : showSuccess
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Updated!
                </>
              ) : (
                '+25% Progress'
              )}
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
                    onClick={async () => {
                      setIsUpdating(true);
                      console.log('Save progress button clicked:', { milestoneId: milestone.id, progressForm });
                      const success = await updateMilestoneProgress(milestone.id, progressForm);
                      setIsUpdating(false);
                      if (success) {
                        setShowSuccess(true);
                        setTimeout(() => {
                          setShowSuccess(false);
                          setShowDetails(false);
                        }, 1500);
                      } else {
                        alert('Failed to save progress. Please try again.');
                      }
                    }}
                    disabled={isUpdating}
                    className={`w-full px-4 py-2 rounded-lg transition-all text-sm flex items-center justify-center ${
                      isUpdating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : showSuccess
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : showSuccess ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Saved Successfully!
                      </>
                    ) : (
                      <>
                        💾 Save Progress
                      </>
                    )}
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
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate Learning Path</h2>
      <p className="text-gray-600 mb-6">
        Create a personalized roadmap to achieve your career goal: <span className="font-semibold text-blue-600">{targetRole || 'Your Target Role'}</span>
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={generationForm.target_role}
            onChange={(e) => setGenerationForm(prev => ({
              ...prev,
              target_role: e.target.value
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Software Developer, Data Scientist..."
            required
          />
          {!generationForm.target_role && (
            <p className="text-xs text-red-500 mt-1">Target role is required</p>
          )}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Skills (Rate your proficiency 0-10)
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Help us understand your starting point to create a personalized path
          </p>
          <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {Object.keys(generationForm.current_skills).length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-2">No skills added yet</p>
                <button
                  onClick={() => {
                    const newSkill = prompt('Enter skill name:');
                    if (newSkill) {
                      setGenerationForm(prev => ({
                        ...prev,
                        current_skills: {
                          ...prev.current_skills,
                          [newSkill]: 5
                        }
                      }));
                    }
                  }}
                  className="text-blue-600 text-sm hover:text-blue-700 font-medium"
                >
                  + Add Your First Skill
                </button>
              </div>
            ) : (
              <>
                {Object.entries(generationForm.current_skills).map(([skill, value]) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <SkillInput
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
                    </div>
                    <button
                      onClick={() => {
                        setGenerationForm(prev => {
                          const skills = { ...prev.current_skills };
                          delete skills[skill];
                          return { ...prev, current_skills: skills };
                        });
                      }}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const newSkill = prompt('Enter skill name:');
                    if (newSkill && newSkill.trim()) {
                      setGenerationForm(prev => ({
                        ...prev,
                        current_skills: {
                          ...prev.current_skills,
                          [newSkill.trim()]: 5
                        }
                      }));
                    }
                  }}
                  className="w-full text-blue-600 text-sm hover:text-blue-700 py-2 border-t border-gray-200 mt-2 pt-4"
                >
                  + Add Another Skill
                </button>
              </>
            )}
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">What you'll get:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Personalized milestones based on your skill level</li>
            <li>✅ Curated learning resources (courses, projects, certifications)</li>
            <li>✅ Estimated timeline to achieve your goal</li>
            <li>✅ Progress tracking and reminders</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowGenerator(false);
              setError(null);
            }}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateLearningPath}
            disabled={loading || !generationForm.target_role}
            className={`flex-1 px-6 py-3 rounded-lg transition-colors flex items-center justify-center ${
              loading || !generationForm.target_role
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              '🚀 Generate Path'
            )}
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

      {!userId && (
        <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
          <div className="text-yellow-600 text-5xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Sign In Required</h3>
          <p className="text-yellow-700 mb-4">
            Please sign in to access personalized learning paths and track your progress.
          </p>
          <a 
            href="/signin" 
            className="inline-block px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
          >
            Sign In
          </a>
        </div>
      )}

      {userId && loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading learning paths...</p>
        </div>
      )}

      {userId && error && !loading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <div className="flex-shrink-0 text-red-500 mr-3">⚠️</div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 mb-1">Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
            {error.includes('User not found') && (
              <p className="text-red-600 text-xs mt-2">
                Try signing out and signing in again.
              </p>
            )}
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {userId && !loading && !error && learningPaths.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Learning Paths Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first personalized learning path to get started on your career journey.
          </p>
          {targetRole && (
            <p className="text-sm text-blue-600 mb-6">
              Ready to become a <span className="font-semibold">{targetRole}</span>?
            </p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerator(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <AcademicCapIcon className="w-5 h-5 mr-2" />
            Create Learning Path
          </motion.button>
        </div>
      )}

      {userId && !loading && learningPaths.length > 0 && (
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
