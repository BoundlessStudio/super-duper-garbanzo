import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ListTodo, 
  Video, 
  Monitor, 
  Settings,
  Trash2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { TaskList } from '../components/TaskList';
import { MeetingEmbed } from '../components/MeetingEmbed';
import { ApplicationPreview } from '../components/ApplicationPreview';
import { ControlPanel } from '../components/ControlPanel';

type TabId = 'tasks' | 'meeting' | 'preview' | 'settings';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, updateProjectSettings, setCurrentProject } = useStore();
  
  const [activeTab, setActiveTab] = useState<TabId>('tasks');
  
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (id) {
      setCurrentProject(id);
    }
    return () => setCurrentProject(null);
  }, [id, setCurrentProject]);

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 mb-4">Project not found</p>
        <Link to="/" className="text-white hover:text-neutral-300 transition-colors">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'tasks' as const, label: 'Tasks', icon: ListTodo },
    { id: 'meeting' as const, label: 'Meeting', icon: Video },
    { id: 'preview' as const, label: 'Preview', icon: Monitor },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(project.id);
      navigate('/');
    }
  };

  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = project.tasks.length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">{project.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  project.status === 'active' ? 'bg-green-500' : 'bg-neutral-600'
                }`} />
                <span className={`text-sm ${
                  project.status === 'active' ? 'text-green-500' : 'text-neutral-500'
                }`}>
                  {project.status === 'active' ? 'Running' : 'Idle'}
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              {completedTasks}/{totalTasks} tasks completed
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tasks' && (
          <TaskList projectId={project.id} tasks={project.tasks} />
        )}
        
        {activeTab === 'meeting' && (
          <MeetingEmbed 
            settings={project.settings}
            onUpdateSettings={(updates) => updateProjectSettings(project.id, updates)}
          />
        )}
        
        {activeTab === 'preview' && (
          <ApplicationPreview
            previewUrl={project.previewUrl}
            settings={project.settings}
            onUpdatePreviewUrl={(url) => updateProject(project.id, { previewUrl: url })}
            onUpdateSettings={(updates) => updateProjectSettings(project.id, updates)}
          />
        )}
        
        {activeTab === 'settings' && (
          <ControlPanel
            settings={project.settings}
            onUpdateSettings={(updates) => updateProjectSettings(project.id, updates)}
          />
        )}
      </div>
    </div>
  );
}
