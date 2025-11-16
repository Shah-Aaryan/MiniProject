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
      case 'completed': return 'text-blue-400 bg-blue-900/30 border border-blue-500';
      case 'in_progress': return 'text-red-400 bg-red-900/30 border border-red-500';
      case 'not_started': return 'text-gray-400 bg-gray-800/50 border border-gray-600';
      default: return 'text-gray-400 bg-gray-800/50 border border-gray-600';
    }
  };

  const SkillInput = ({ skill, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-semibold text-blue-400 uppercase tracking-wide">{skill}</label>
        <span className="text-sm text-red-400 font-bold">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(skill, parseInt(e.target.value))}
        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        style={{
          background: `linear-gradient(to right, rgb(220, 38, 38) 0%, rgb(37, 99, 235) ${value * 10}%, rgb(55, 65, 81) ${value * 10}%)`
        }}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors duration-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${getStatusColor(milestone.status)} backdrop-blur-sm`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{milestone.title}</h3>
              <p className="text-sm text-gray-400">{milestone.milestone_type.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 flex items-center justify-end">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span className="font-semibold">{milestone.estimated_hours}h</span>
            </div>
            <div className={`text-xs px-3 py-1.5 rounded-full mt-2 ${getStatusColor(milestone.status)} font-semibold uppercase tracking-wider`}>
              {milestone.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-6 leading-relaxed">{milestone.description}</p>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span className="font-medium text-blue-400">{milestone.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${milestone.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Skills Gained */}
        {milestone.skills_gained && milestone.skills_gained.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Skills You'll Gain</h4>
            <div className="flex flex-wrap gap-2">
              {milestone.skills_gained.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-blue-400 text-xs rounded border border-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {milestone.resources && milestone.resources.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Resources</h4>
            <div className="space-y-2">
              {milestone.resources.slice(0, 3).map((resource, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-800 p-3 rounded border border-gray-700">
                  <span className="text-gray-300">{resource.title}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400">{resource.duration_hours}h</span>
                    <div className="flex items-center">
                      <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-400 ml-1">{resource.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 border border-gray-700 hover:border-blue-600 transition-colors text-sm"
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
              className={`px-5 py-2 rounded transition-colors text-sm font-medium flex items-center justify-center border ${
                isUpdating 
                  ? 'bg-gray-700 cursor-not-allowed border-gray-600 text-gray-400' 
                  : showSuccess
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
              }`}
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
              className="mt-6 pt-6 border-t-2 border-blue-900/50"
            >
              {/* Learning Objectives */}
              {milestone.learning_objectives && (
                <div className="mb-6">
                  <h4 className="font-bold text-blue-400 mb-3 uppercase tracking-wide flex items-center">
                    <span className="mr-2">🎯</span> Learning Objectives
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {milestone.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start bg-gray-800/50 p-3 rounded-lg border-l-4 border-red-600">
                        <span className="text-red-500 mr-3 font-bold">▸</span>
                        <span className="leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Criteria */}
              {milestone.success_criteria && (
                <div className="mb-6">
                  <h4 className="font-bold text-blue-400 mb-3 uppercase tracking-wide flex items-center">
                    <span className="mr-2">✓</span> Success Criteria
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {milestone.success_criteria.map((criteria, index) => (
                      <li key={index} className="flex items-start bg-gray-800/50 p-3 rounded-lg border-l-4 border-blue-600">
                        <CheckCircleIcon className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progress Update Form */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-xl border-2 border-blue-900">
                <h4 className="font-bold text-blue-400 mb-4 uppercase tracking-wide text-lg">Update Your Progress</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 font-semibold mb-2 block">Progress Percentage</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressForm.progress_percentage}
                      onChange={(e) => setProgressForm(prev => ({
                        ...prev,
                        progress_percentage: parseInt(e.target.value)
                      }))}
                      className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      style={{
                        background: `linear-gradient(to right, rgb(220, 38, 38) 0%, rgb(37, 99, 235) ${progressForm.progress_percentage}%, rgb(55, 65, 81) ${progressForm.progress_percentage}%)`
                      }}
                    />
                    <div className="text-center text-2xl text-blue-400 font-bold mt-2">
                      {progressForm.progress_percentage}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 font-semibold mb-2 block">Time Spent (minutes)</label>
                    <input
                      type="number"
                      value={progressForm.time_spent_minutes}
                      onChange={(e) => setProgressForm(prev => ({
                        ...prev,
                        time_spent_minutes: parseInt(e.target.value) || 0
                      }))}
                      className="w-full p-3 border-2 border-gray-700 bg-gray-800 text-white rounded-lg text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Enter minutes spent..."
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300 font-semibold mb-2 block">Notes</label>
                    <textarea
                      value={progressForm.notes}
                      onChange={(e) => setProgressForm(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      className="w-full p-3 border-2 border-gray-700 bg-gray-800 text-white rounded-lg text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
                      rows="3"
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
                    className={`w-full px-6 py-4 rounded-lg transition-all text-sm font-bold uppercase tracking-wide flex items-center justify-center border-2 ${
                      isUpdating
                        ? 'bg-gray-700 cursor-not-allowed border-gray-600 text-gray-400'
                        : showSuccess
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-gradient-to-r from-red-600 via-blue-600 to-red-600 hover:from-red-500 hover:to-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/50'
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
      className="bg-gray-900 p-6 rounded-lg border border-gray-700"
    >
      <h2 className="text-2xl font-semibold text-white mb-2">Generate Learning Path</h2>
      <p className="text-gray-400 mb-6">
        Create a personalized roadmap to achieve your career goal: <span className="font-medium text-blue-400">{targetRole || 'Your Target Role'}</span>
      </p>
      
      {error && (
        <div className="mb-8 p-5 bg-red-900/40 border-2 border-red-600 rounded-xl">
          <p className="text-red-300 text-sm font-semibold">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={generationForm.target_role}
            onChange={(e) => setGenerationForm(prev => ({
              ...prev,
              target_role: e.target.value
            }))}
            className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Software Developer, Data Scientist..."
            required
          />
          {!generationForm.target_role && (
            <p className="text-xs text-red-400 mt-1">Target role is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
          <select
            value={generationForm.experience_level}
            onChange={(e) => setGenerationForm(prev => ({
              ...prev,
              experience_level: e.target.value
            }))}
            className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Skills (Rate your proficiency 0-10)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Help us understand your starting point to create a personalized path
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-700 bg-gray-800 rounded p-3">
            {Object.keys(generationForm.current_skills).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">No skills added yet</p>
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
                  className="text-blue-400 text-sm hover:text-blue-300 font-bold uppercase tracking-wide"
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

        <div className="bg-gradient-to-r from-blue-900/40 via-red-900/40 to-blue-900/40 border-2 border-blue-700 rounded-xl p-6 mb-6">
          <h4 className="font-bold text-blue-400 mb-4 text-lg uppercase tracking-wide">What you'll get:</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> Personalized milestones based on your skill level</li>
            <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> Curated learning resources (courses, projects, certifications)</li>
            <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> Estimated timeline to achieve your goal</li>
            <li className="flex items-center"><span className="text-blue-400 mr-2">✓</span> Progress tracking and reminders</li>
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
            className="flex-1 px-6 py-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border-2 border-gray-700 hover:border-gray-600 transition-all font-bold uppercase tracking-wide"
            disabled={loading}
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(37, 99, 235, 0.8)' }}
            whileTap={{ scale: 0.98 }}
            onClick={generateLearningPath}
            disabled={loading || !generationForm.target_role}
            className={`flex-1 px-6 py-4 rounded-lg transition-all flex items-center justify-center font-bold uppercase tracking-wide border-2 ${
              loading || !generationForm.target_role
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed border-gray-600'
                : 'bg-gradient-to-r from-red-600 via-blue-600 to-red-600 text-white hover:from-red-500 hover:to-blue-500 border-blue-500 shadow-lg shadow-blue-500/50'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <GeneratorForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-red-500 via-blue-500 to-red-500 bg-clip-text text-transparent mb-3">
            🎯 LEARNING PATHS
          </h1>
          <p className="text-gray-400 text-lg uppercase tracking-wider">
            Professional roadmaps to achieve your career goals
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(37, 99, 235, 0.8)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(true)}
          className="px-8 py-4 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 text-white rounded-lg font-bold uppercase tracking-wide border-2 border-blue-500 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all"
        >
          + Create New Path
        </motion.button>
      </div>

      {!userId && (
        <div className="mb-8 p-8 bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 border-2 border-red-600 rounded-xl text-center">
          <div className="text-red-500 text-6xl mb-4">🔐</div>
          <h3 className="text-2xl font-bold text-red-400 mb-3 uppercase tracking-wide">Authentication Required</h3>
          <p className="text-gray-300 mb-6 text-lg">
            Please sign in to access personalized learning paths and track your progress.
          </p>
          <a 
            href="/signin" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold rounded-lg hover:from-red-500 hover:to-blue-500 transition-all border-2 border-red-500 shadow-lg shadow-red-500/50 uppercase tracking-wide"
          >
            ❯ Sign In
          </a>
        </div>
      )}

      {userId && loading && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-red-600 border-r-blue-600 border-b-red-600 border-l-blue-600 mx-auto"></div>
          <p className="text-blue-400 mt-6 text-lg font-semibold uppercase tracking-wide">Loading learning paths...</p>
        </div>
      )}

      {userId && error && !loading && (
        <div className="mb-8 p-6 bg-gradient-to-br from-red-900/40 to-black border-2 border-red-600 rounded-xl flex items-start">
          <div className="flex-shrink-0 text-red-500 mr-4 text-2xl">⚠️</div>
          <div className="flex-1">
            <h4 className="font-bold text-red-400 mb-2 text-lg uppercase tracking-wide">Error</h4>
            <p className="text-red-300 text-sm">{error}</p>
            {error.includes('User not found') && (
              <p className="text-red-400 text-xs mt-3 font-semibold">
                Try signing out and signing in again.
              </p>
            )}
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-300 text-xl font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {userId && !loading && !error && learningPaths.length === 0 && (
        <div className="text-center py-20 bg-gradient-to-br from-gray-900 via-blue-900/20 to-black rounded-2xl border-2 border-blue-800">
          <BookOpenIcon className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-blue-400 mb-4 uppercase tracking-wide">No Learning Paths Yet</h3>
          <p className="text-gray-300 mb-8 text-lg">
            Create your first personalized learning path to get started on your career journey.
          </p>
          {targetRole && (
            <p className="text-base text-blue-400 mb-8">
              Ready to become a <span className="font-bold text-red-400">{targetRole}</span>?
            </p>
          )}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(37, 99, 235, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerator(true)}
            className="px-10 py-4 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 text-white rounded-lg font-bold uppercase tracking-wide inline-flex items-center border-2 border-blue-500 shadow-lg shadow-blue-500/50"
          >
            <AcademicCapIcon className="w-6 h-6 mr-3" />
            Create Learning Path
          </motion.button>
        </div>
      )}

      {userId && !loading && learningPaths.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Path Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 uppercase tracking-wide">Your Paths</h2>
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <motion.button
                  key={path.id}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPath(path);
                    fetchMilestoneProgress(path.id);
                  }}
                  className={`w-full p-5 text-left rounded-xl border-2 transition-all ${
                    selectedPath?.id === path.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-900/50 to-red-900/30 shadow-lg shadow-blue-500/50'
                      : 'border-gray-700 hover:border-blue-600 bg-gradient-to-br from-gray-900 to-black'
                  }`}
                >
                  <div className="font-bold text-lg text-white mb-2">{path.target_role}</div>
                  <div className="text-sm text-blue-400 font-semibold uppercase tracking-wide mt-2">
                    {path.estimated_duration_weeks} weeks • {path.difficulty_level}
                  </div>
                  <div className="text-xs text-gray-400 mt-3 bg-gray-800/50 px-2 py-1 rounded-full inline-block">
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
                <div className="bg-gradient-to-r from-red-900/30 via-blue-900/40 to-red-900/30 p-8 rounded-2xl mb-8 border-2 border-blue-700">
                  <h2 className="text-4xl font-black bg-gradient-to-r from-red-400 via-blue-400 to-red-400 bg-clip-text text-transparent mb-6">
                    PATH TO {selectedPath.target_role.toUpperCase()}
                  </h2>
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div className="bg-black/40 p-4 rounded-xl border border-blue-700">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">Duration:</span>
                      <div className="font-bold text-2xl text-blue-400 mt-1">{selectedPath.estimated_duration_weeks} weeks</div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-red-700">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">Difficulty:</span>
                      <div className="font-bold text-2xl text-red-400 mt-1 capitalize">{selectedPath.difficulty_level}</div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-blue-700">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">Milestones:</span>
                      <div className="font-bold text-2xl text-blue-400 mt-1">{selectedPath.milestones?.length || 0}</div>
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
    </div>
  );
};

export default LearningPath;
