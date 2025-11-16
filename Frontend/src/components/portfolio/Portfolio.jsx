import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const Portfolio = ({ userId }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [view, setView] = useState('list'); // list, create, edit, preview
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // project, experience, education, skill

  // Form states
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    template_id: null,
    is_public: true,
    theme_color: '#3B82F6'
  });

  const [personalInfoForm, setPersonalInfoForm] = useState({
    full_name: '',
    headline: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    website: ''
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: [],
    project_url: '',
    github_url: '',
    start_date: '',
    end_date: '',
    is_featured: false
  });

  const [experienceForm, setExperienceForm] = useState({
    company: '',
    position: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: ''
  });

  useEffect(() => {
    fetchPortfolios();
    fetchTemplates();
  }, [userId]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/portfolios/?user_id=${userId}`);
      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/portfolio-templates/');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createPortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/portfolios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...portfolioForm, user_id: userId })
      });
      const data = await response.json();
      setPortfolios([...portfolios, data]);
      setSelectedPortfolio(data);
      setView('edit');
    } catch (error) {
      console.error('Error creating portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = async () => {
    if (!selectedPortfolio) return;
    
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/portfolios/${selectedPortfolio.id}/update_personal_info/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personalInfoForm)
        }
      );
      const data = await response.json();
      alert('Personal info updated successfully!');
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  const addProject = async () => {
    if (!selectedPortfolio) return;
    
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/portfolios/${selectedPortfolio.id}/add_project/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectForm)
        }
      );
      const data = await response.json();
      setShowModal(false);
      setProjectForm({
        title: '',
        description: '',
        technologies: [],
        project_url: '',
        github_url: '',
        start_date: '',
        end_date: '',
        is_featured: false
      });
      alert('Project added successfully!');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const PortfolioCard = ({ portfolio }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{portfolio.title}</h3>
          <p className="text-sm text-gray-400">/{portfolio.slug}</p>
        </div>
        <div className={`px-3 py-1 rounded text-xs font-medium ${
          portfolio.is_public
            ? 'bg-green-900 text-green-400 border border-green-700'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>
          {portfolio.is_public ? 'Public' : 'Private'}
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-400 mb-4">
        <EyeIcon className="w-4 h-4 mr-1" />
        <span>{portfolio.view_count || 0} views</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedPortfolio(portfolio);
            setView('edit');
          }}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
        >
          <PencilIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => window.open(`/portfolios/${portfolio.slug}`, '_blank')}
          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 border border-gray-700"
        >
          <EyeIcon className="w-4 h-4" />
          <span>View</span>
        </button>
      </div>
    </motion.div>
  );

  const TemplateCard = ({ template }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setPortfolioForm({ ...portfolioForm, template_id: template.id })}
      className={`bg-gray-900 border rounded-lg p-4 cursor-pointer transition-colors ${
        portfolioForm.template_id === template.id
          ? 'border-blue-600'
          : 'border-gray-700 hover:border-blue-600'
      }`}
    >
      <div className="aspect-video bg-gray-800 rounded mb-3 flex items-center justify-center">
        <GlobeAltIcon className="w-12 h-12 text-gray-600" />
      </div>
      <h4 className="font-medium text-white mb-1">{template.name}</h4>
      <p className="text-xs text-gray-400">{template.template_type}</p>
      {template.is_premium && (
        <span className="inline-block mt-2 px-2 py-1 bg-yellow-900 text-yellow-400 text-xs rounded border border-yellow-700">
          Premium
        </span>
      )}
    </motion.div>
  );

  const ListView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">My Portfolios</h2>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Portfolio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>

      {portfolios.length === 0 && (
        <div className="text-center py-12">
          <BriefcaseIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">You haven't created any portfolios yet</p>
          <button
            onClick={() => setView('create')}
            className="px-5 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your First Portfolio
          </button>
        </div>
      )}
    </div>
  );

  const CreateView = () => (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setView('list')}
        className="mb-6 text-gray-400 hover:text-white transition-colors"
      >
        ← Back to Portfolios
      </button>

      <h2 className="text-2xl font-semibold text-white mb-6">Create New Portfolio</h2>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
          <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portfolio Title
              </label>
              <input
                type="text"
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., John Doe - Software Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={portfolioForm.theme_color}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, theme_color: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <span className="text-gray-400 text-sm">{portfolioForm.theme_color}</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={portfolioForm.is_public}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, is_public: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-300">
                Make portfolio public
              </label>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
          <h3 className="text-lg font-medium text-white mb-4">Choose a Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>

        <button
          onClick={createPortfolio}
          disabled={!portfolioForm.title || !portfolioForm.template_id || loading}
          className={`w-full py-3 rounded font-medium transition-colors ${
            portfolioForm.title && portfolioForm.template_id && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Creating...' : 'Create Portfolio'}
        </button>
      </div>
    </div>
  );

  const EditView = () => {
    if (!selectedPortfolio) return null;

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setView('list')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Portfolios
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`/portfolios/${selectedPortfolio.slug}`, '_blank')}
              className="px-4 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2 border border-gray-700"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Preview</span>
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-6">Edit Portfolio</h2>

        {/* Personal Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <UserCircleIcon className="w-5 h-5 mr-2 text-blue-400" />
              Personal Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={personalInfoForm.full_name}
              onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, full_name: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Headline"
              value={personalInfoForm.headline}
              onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, headline: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={personalInfoForm.email}
              onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, email: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={personalInfoForm.location}
              onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, location: e.target.value })}
              className="p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
            />
            <textarea
              placeholder="Bio"
              value={personalInfoForm.bio}
              onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, bio: e.target.value })}
              className="md:col-span-2 p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-1 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <button
            onClick={updatePersonalInfo}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Save Personal Info
          </button>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setModalType('project');
              setShowModal(true);
            }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors text-left"
          >
            <CodeBracketIcon className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Projects</h4>
            <p className="text-sm text-gray-400">Add your work projects</p>
          </button>

          <button
            onClick={() => {
              setModalType('experience');
              setShowModal(true);
            }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors text-left"
          >
            <BriefcaseIcon className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Experience</h4>
            <p className="text-sm text-gray-400">Add work experience</p>
          </button>

          <button
            onClick={() => {
              setModalType('education');
              setShowModal(true);
            }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors text-left"
          >
            <AcademicCapIcon className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Education</h4>
            <p className="text-sm text-gray-400">Add your education</p>
          </button>

          <button
            onClick={() => {
              setModalType('skill');
              setShowModal(true);
            }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-blue-600 transition-colors text-left"
          >
            <CodeBracketIcon className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-medium text-white mb-1">Skills</h4>
            <p className="text-sm text-gray-400">Add your skills</p>
          </button>
        </div>
      </div>
    );
  };

  // Modal for adding content
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Add {modalType}</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {modalType === 'project' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"
              />
              <textarea
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"
                rows="4"
              />
              <input
                type="url"
                placeholder="Project URL"
                value={projectForm.project_url}
                onChange={(e) => setProjectForm({ ...projectForm, project_url: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"
              />
              <button
                onClick={addProject}
                className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Add Project
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2 flex items-center">
            <BriefcaseIcon className="w-8 h-8 mr-3 text-blue-400" />
            Portfolio Builder
          </h1>
          <p className="text-gray-400">Create and manage your professional portfolio</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'list' && <ListView />}
          {view === 'create' && <CreateView />}
          {view === 'edit' && <EditView />}
        </AnimatePresence>

        <Modal />
      </div>
    </div>
  );
};

export default Portfolio;
