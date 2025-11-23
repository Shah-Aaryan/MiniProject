import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';

const LearningPathGenerator = () => {
  const [skillGaps, setSkillGaps] = useState([
    { skill: 'React', priority: 'High', estimatedTime: '2 months' },
    { skill: 'Node.js', priority: 'Medium', estimatedTime: '1.5 months' },
    { skill: 'TypeScript', priority: 'High', estimatedTime: '1 month' },
  ]);

  const [learningPath, setLearningPath] = useState([
    {
      step: 1,
      title: 'Learn React Fundamentals',
      description: 'Master React basics, components, and hooks',
      duration: '4 weeks',
      courses: [
        { name: 'React - The Complete Guide', platform: 'Udemy', link: '#' },
        { name: 'React Documentation', platform: 'Official', link: '#' },
      ],
      completed: false,
    },
    {
      step: 2,
      title: 'Build Projects',
      description: 'Apply React knowledge by building real projects',
      duration: '2 weeks',
      courses: [],
      completed: false,
    },
    {
      step: 3,
      title: 'Learn TypeScript',
      description: 'Add type safety to your React applications',
      duration: '3 weeks',
      courses: [
        { name: 'TypeScript for React Developers', platform: 'Coursera', link: '#' },
      ],
      completed: false,
    },
  ]);

  const toggleStep = (index) => {
    const updated = [...learningPath];
    updated[index].completed = !updated[index].completed;
    setLearningPath(updated);
  };

  const totalDuration = learningPath.reduce((sum, step) => {
    const weeks = parseInt(step.duration) || 0;
    return sum + weeks;
  }, 0);

  const completedSteps = learningPath.filter((step) => step.completed).length;
  const progress = (completedSteps / learningPath.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Path Generator</h1>
          <p className="text-gray-400">Personalized learning roadmap based on your skill gaps</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{Math.round(progress)}%</div>
              <div className="text-gray-400">Progress</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-1">{totalDuration} weeks</div>
              <div className="text-gray-400">Estimated Duration</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">{completedSteps}/{learningPath.length}</div>
              <div className="text-gray-400">Steps Completed</div>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Skill Gaps to Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skillGaps.map((gap, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{gap.skill}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      gap.priority === 'High'
                        ? 'bg-red-900 text-red-400 border border-red-700'
                        : 'bg-yellow-900 text-yellow-400 border border-yellow-700'
                    }`}
                  >
                    {gap.priority}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {gap.estimatedTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path Steps */}
        <div className="space-y-4">
          {learningPath.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => toggleStep(index)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    step.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-600 hover:border-green-600'
                  }`}
                >
                  {step.completed && <CheckCircleIcon className="w-5 h-5 text-white" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {step.duration}
                    </div>
                  </div>
                  {step.courses && step.courses.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Recommended Courses:</h4>
                      <div className="space-y-2">
                        {step.courses.map((course, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <BookOpenIcon className="w-5 h-5 text-blue-400" />
                              <div>
                                <div className="font-medium text-white">{course.name}</div>
                                <div className="text-xs text-gray-400">{course.platform}</div>
                              </div>
                            </div>
                            <a
                              href={course.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View →
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Export Button */}
        <div className="flex justify-end mt-6">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Learning Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPathGenerator;

