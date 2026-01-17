import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  ArrowLeft, 
  ListTodo, 
  Video, 
  Monitor, 
  Settings,
  Trash2
} from 'lucide-react'
import { useProject, useProjectTasks, useUpdateProject, useDeleteProject, useProjectSettings, useUpdateSettings } from '../db/hooks'
import { TaskList } from '../components/TaskList'
import { MeetingEmbed } from '../components/MeetingEmbed'
import { ApplicationPreview } from '../components/ApplicationPreview'
import { ControlPanel } from '../components/ControlPanel'

type TabId = 'tasks' | 'meeting' | 'preview' | 'settings'

export const Route = createFileRoute('/$projectId')({
  component: ProjectDetailPage,
  notFoundComponent: () => (
    <div className="text-center py-20">
      <p className="text-neutral-500 mb-4">Project not found</p>
      <Link to="/" className="text-white hover:text-neutral-300 transition-colors">
        Back to Projects
      </Link>
    </div>
  ),
})

function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()
  
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: tasks = [] } = useProjectTasks(projectId)
  const { data: settings } = useProjectSettings(projectId)
  
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const updateSettings = useUpdateSettings()
  
  const [activeTab, setActiveTab] = useState<TabId>('tasks')

  if (projectLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 mb-4">Project not found</p>
        <Link to="/" className="text-white hover:text-neutral-300 transition-colors">
          Back to Projects
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'tasks' as const, label: 'Tasks', icon: ListTodo },
    { id: 'meeting' as const, label: 'Meeting', icon: Video },
    { id: 'preview' as const, label: 'Preview', icon: Monitor },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject.mutate(project.id)
      navigate({ to: '/' })
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length

  // Default settings if not loaded yet
  const currentSettings = settings || {
    projectId: project.id,
    // Agent Settings
    agentEnabled: false,
    agentCurrentTask: '',
    agentLastAction: '',
    agentLastActionAt: '',
    agentSkills: [],
    // GitHub Settings
    githubRepo: '',
    githubUseIssues: false,
    githubUsePRs: false,
    // Sandbox Settings
    sandboxRunning: false,
    sandboxEnvVars: {},
    // Notification Settings
    notifyOnNewTasks: true,
    notifyOnTaskComplete: true,
    notifyOnBuildComplete: true,
    notifyOnMeetingComplete: false,
    // Preview Settings
    previewDefaultDevice: 'desktop' as const,
    buildOnTaskComplete: false,
    buildOnMeetingComplete: false,
    // Meeting Settings
    meetingProvider: 'jitsi' as const,
    meetingUrl: '',
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/' })}
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
          <TaskList projectId={project.id} />
        )}
        
        {activeTab === 'meeting' && (
          <MeetingEmbed 
            settings={currentSettings}
            onUpdateSettings={(updates) => updateSettings.mutate({ projectId: project.id, updates })}
          />
        )}
        
        {activeTab === 'preview' && (
          <ApplicationPreview
            previewUrl={project.previewUrl}
            settings={currentSettings}
            onUpdatePreviewUrl={(url) => updateProject.mutate({ id: project.id, updates: { previewUrl: url } })}
            onUpdateSettings={(updates) => updateSettings.mutate({ projectId: project.id, updates })}
          />
        )}
        
        {activeTab === 'settings' && (
          <ControlPanel
            settings={currentSettings}
            onUpdateSettings={(updates) => updateSettings.mutate({ projectId: project.id, updates })}
          />
        )}
      </div>
    </div>
  )
}
