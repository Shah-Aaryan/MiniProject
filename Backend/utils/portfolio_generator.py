"""
Portfolio & Project Templates Generator
Generates role-specific mini-projects with rubrics, README scaffolds, and deployment templates
"""
import json
from typing import Dict, List, Any

class PortfolioGenerator:
    """Generates portfolio projects and templates"""
    
    def __init__(self):
        self.project_templates = self._initialize_templates()
        self.readme_templates = self._initialize_readme_templates()
        self.deployment_templates = self._initialize_deployment_templates()
    
    def _initialize_templates(self) -> Dict[str, List[Dict]]:
        """Initialize project templates for different roles"""
        return {
            'Software Developer': [
                {
                    'title': 'Todo List API',
                    'description': 'Build a RESTful API for a todo list application with CRUD operations',
                    'difficulty': 'beginner',
                    'skills_required': ['Python', 'REST API', 'Database'],
                    'skills_taught': ['FastAPI/Flask', 'SQL', 'API Design'],
                    'estimated_hours': 8,
                    'rubric': {
                        'functionality': {'weight': 40, 'criteria': 'All CRUD operations work correctly'},
                        'code_quality': {'weight': 30, 'criteria': 'Clean, well-documented code'},
                        'testing': {'weight': 20, 'criteria': 'Unit tests included'},
                        'documentation': {'weight': 10, 'criteria': 'README and API docs'}
                    }
                },
                {
                    'title': 'E-commerce Microservices',
                    'description': 'Design and implement a microservices architecture for an e-commerce platform',
                    'difficulty': 'advanced',
                    'skills_required': ['System Design', 'Microservices', 'Docker'],
                    'skills_taught': ['Architecture', 'Distributed Systems', 'Kubernetes'],
                    'estimated_hours': 40,
                    'rubric': {
                        'architecture': {'weight': 35, 'criteria': 'Well-designed service boundaries'},
                        'implementation': {'weight': 30, 'criteria': 'Working microservices'},
                        'deployment': {'weight': 20, 'criteria': 'Containerized and deployed'},
                        'documentation': {'weight': 15, 'criteria': 'Architecture diagrams and docs'}
                    }
                }
            ],
            'Web Developer': [
                {
                    'title': 'Responsive Portfolio Website',
                    'description': 'Create a responsive portfolio website using HTML, CSS, and JavaScript',
                    'difficulty': 'beginner',
                    'skills_required': ['HTML', 'CSS', 'JavaScript'],
                    'skills_taught': ['Responsive Design', 'Modern CSS', 'DOM Manipulation'],
                    'estimated_hours': 12,
                    'rubric': {
                        'design': {'weight': 30, 'criteria': 'Modern, attractive design'},
                        'responsiveness': {'weight': 30, 'criteria': 'Works on all devices'},
                        'functionality': {'weight': 25, 'criteria': 'Interactive features work'},
                        'code_quality': {'weight': 15, 'criteria': 'Clean, semantic HTML/CSS'}
                    }
                },
                {
                    'title': 'Full-Stack Social Media App',
                    'description': 'Build a social media application with React frontend and Node.js backend',
                    'difficulty': 'intermediate',
                    'skills_required': ['React', 'Node.js', 'MongoDB'],
                    'skills_taught': ['Full-Stack Development', 'Authentication', 'Real-time Updates'],
                    'estimated_hours': 60,
                    'rubric': {
                        'features': {'weight': 35, 'criteria': 'Core social features implemented'},
                        'ui_ux': {'weight': 25, 'criteria': 'Intuitive user interface'},
                        'backend': {'weight': 25, 'criteria': 'Secure, scalable backend'},
                        'testing': {'weight': 15, 'criteria': 'Comprehensive tests'}
                    }
                }
            ],
            'Data Scientist': [
                {
                    'title': 'Customer Churn Prediction',
                    'description': 'Analyze customer data and build a machine learning model to predict churn',
                    'difficulty': 'intermediate',
                    'skills_required': ['Python', 'Machine Learning', 'Pandas'],
                    'skills_taught': ['ML Pipeline', 'Feature Engineering', 'Model Evaluation'],
                    'estimated_hours': 20,
                    'rubric': {
                        'analysis': {'weight': 25, 'criteria': 'Thorough exploratory data analysis'},
                        'modeling': {'weight': 35, 'criteria': 'Effective ML model'},
                        'evaluation': {'weight': 25, 'criteria': 'Proper model evaluation metrics'},
                        'presentation': {'weight': 15, 'criteria': 'Clear visualizations and insights'}
                    }
                }
            ],
            'UX Designer': [
                {
                    'title': 'Mobile App Redesign',
                    'description': 'Redesign an existing mobile app focusing on improving user experience',
                    'difficulty': 'intermediate',
                    'skills_required': ['Figma', 'User Research', 'Prototyping'],
                    'skills_taught': ['Design Thinking', 'Usability Testing', 'UI/UX Principles'],
                    'estimated_hours': 24,
                    'rubric': {
                        'research': {'weight': 25, 'criteria': 'User research and insights'},
                        'design': {'weight': 35, 'criteria': 'Well-designed user interface'},
                        'prototyping': {'weight': 25, 'criteria': 'Interactive prototypes'},
                        'documentation': {'weight': 15, 'criteria': 'Design system and rationale'}
                    }
                }
            ]
        }
    
    def _initialize_readme_templates(self) -> Dict[str, str]:
        """Initialize README templates for different project types"""
        return {
            'default': """# {project_title}

{project_description}

## Features

- Feature 1
- Feature 2
- Feature 3

## Technologies Used

- Technology 1
- Technology 2
- Technology 3

## Installation

\```bash
# Clone the repository
git clone {repository_url}

# Install dependencies
npm install  # or pip install -r requirements.txt

# Run the application
npm start  # or python app.py
\```

## Usage

{usage_instructions}

## Project Structure

\```
{project_structure}
\```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
""",
            'api': """# {project_title} API

{project_description}

## API Endpoints

### GET /endpoint
Description of the endpoint

**Parameters:**
- param1: Description

**Response:**
\```json
{
  "key": "value"
}
\```

## Setup

\```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
\```

## Testing

\```bash
pytest
\```

## Documentation

API documentation is available at `/docs`
"""
        }
    
    def _initialize_deployment_templates(self) -> Dict[str, Dict]:
        """Initialize deployment templates for CodeSandbox and Render"""
        return {
            'codesandbox': {
                'python': {
                    'template': 'python',
                    'files': {
                        'sandbox.config.json': json.dumps({
                            'template': 'python',
                            'container': {'port': 8000},
                            'infiniteLoopProtection': True
                        }),
                        'requirements.txt': '# Add your dependencies here'
                    }
                },
                'react': {
                    'template': 'react',
                    'files': {
                        'sandbox.config.json': json.dumps({
                            'template': 'react',
                            'container': {'port': 3000}
                        }),
                        'package.json': json.dumps({
                            'name': 'my-app',
                            'version': '1.0.0',
                            'dependencies': {}
                        })
                    }
                }
            },
            'render': {
                'web_service': {
                    'type': 'web',
                    'buildCommand': 'pip install -r requirements.txt',
                    'startCommand': 'python app.py',
                    'env': {}
                },
                'static_site': {
                    'type': 'static',
                    'buildCommand': 'npm run build',
                    'publishPath': 'dist'
                }
            }
        }
    
    def generate_project_from_template(self, role: str, template_data: Dict) -> Dict[str, Any]:
        """Generate a complete project from a template"""
        project_structure = self._generate_project_structure(template_data)
        readme = self._generate_readme(template_data)
        starter_code = self._generate_starter_code(template_data)
        deployment_links = self._generate_deployment_links(template_data)
        
        return {
            'title': template_data['title'],
            'description': template_data['description'],
            'project_structure': project_structure,
            'readme_template': readme,
            'starter_code': starter_code,
            'deployment_links': deployment_links,
            'rubric': template_data['rubric'],
            'resources': self._generate_resources(template_data)
        }
    
    def _generate_project_structure(self, template_data: Dict) -> List[str]:
        """Generate suggested project folder structure"""
        if 'API' in template_data['title'] or 'api' in template_data['title'].lower():
            return [
                'app/',
                'app/__init__.py',
                'app/main.py',
                'app/models.py',
                'app/routes.py',
                'tests/',
                'tests/__init__.py',
                'tests/test_api.py',
                'requirements.txt',
                'README.md',
                '.env.example',
                '.gitignore'
            ]
        elif 'React' in template_data['title'] or 'Frontend' in template_data['title']:
            return [
                'src/',
                'src/components/',
                'src/pages/',
                'src/utils/',
                'src/assets/',
                'public/',
                'package.json',
                'README.md',
                '.gitignore'
            ]
        else:
            return [
                'src/',
                'tests/',
                'docs/',
                'requirements.txt',
                'README.md',
                '.gitignore'
            ]
    
    def _generate_readme(self, template_data: Dict) -> str:
        """Generate README from template"""
        template_type = 'api' if 'API' in template_data['title'] else 'default'
        readme_template = self.readme_templates.get(template_type, self.readme_templates['default'])
        
        return readme_template.format(
            project_title=template_data['title'],
            project_description=template_data['description'],
            repository_url='https://github.com/yourusername/your-repo',
            usage_instructions='Add usage instructions here',
            project_structure='\n'.join(self._generate_project_structure(template_data))
        )
    
    def _generate_starter_code(self, template_data: Dict) -> str:
        """Generate starter code based on project type"""
        if 'API' in template_data['title']:
            return """# {project_title}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="{project_title}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {{"message": "Welcome to {project_title}"}}

@app.get("/health")
def health_check():
    return {{"status": "healthy"}}

# Add your routes here
""".format(project_title=template_data['title'])
        elif 'React' in template_data['title']:
            return """// App.jsx
import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>{project_title}</h1>
      <p>Get started by editing this file.</p>
    </div>
  );
}

export default App;
""".format(project_title=template_data['title'])
        else:
            return "# {project_title}\n\n# Get started by adding your code here".format(
                project_title=template_data['title']
            )
    
    def _generate_deployment_links(self, template_data: Dict) -> Dict[str, Any]:
        """Generate deployment configuration links"""
        if 'Python' in str(template_data.get('skills_required', [])) or 'API' in template_data['title']:
            return {
                'codesandbox': {
                    'url': 'https://codesandbox.io/s/new',
                    'template': self.deployment_templates['codesandbox']['python']
                },
                'render': {
                    'url': 'https://render.com/new',
                    'template': self.deployment_templates['render']['web_service']
                }
            }
        elif 'React' in str(template_data.get('skills_required', [])) or 'Frontend' in template_data['title']:
            return {
                'codesandbox': {
                    'url': 'https://codesandbox.io/s/new',
                    'template': self.deployment_templates['codesandbox']['react']
                },
                'render': {
                    'url': 'https://render.com/new',
                    'template': self.deployment_templates['render']['static_site']
                }
            }
        else:
            return {
                'codesandbox': {'url': 'https://codesandbox.io/s/new'},
                'render': {'url': 'https://render.com/new'}
            }
    
    def _generate_resources(self, template_data: Dict) -> List[Dict]:
        """Generate helpful resources for the project"""
        resources = []
        
        for skill in template_data.get('skills_taught', []):
            resources.append({
                'type': 'documentation',
                'title': f'{skill} Documentation',
                'url': f'https://example.com/docs/{skill.lower().replace(" ", "-")}'
            })
        
        resources.extend([
            {
                'type': 'tutorial',
                'title': f'{template_data["title"]} Tutorial',
                'url': 'https://example.com/tutorial'
            },
            {
                'type': 'video',
                'title': f'{template_data["title"]} Walkthrough',
                'url': 'https://example.com/video'
            }
        ])
        
        return resources

