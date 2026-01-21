import { createFileRoute, Link, useNavigate, Outlet, useMatches } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  ArrowLeft, 
  ListTodo, 
  Monitor,
  LayoutDashboard,
  Settings,
  Video,
  X,
  Maximize2,
  Minimize2,
  ScreenShare,
  Mic,
  MicOff,
  Plus,
  Tag,
  Check,
  ChevronDown
} from 'lucide-react'
import { useProject, useProjectTasks, useUpdateProject, useDeleteProject, useProjectSettings, useUpdateSettings, useCreateTask } from '../db/hooks'
import { Dashboard } from '../components/Dashboard'
import { TaskList } from '../components/TaskList'
import { ProjectSettings } from '../components/ProjectSettings'
import { ApplicationPreview } from '../components/ApplicationPreview'

type TabId = 'dashboard' | 'preview' | 'tasks' | 'settings'

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
  const matches = useMatches()
  
  // Check for tab override via URL search param (?tab=dashboard|preview|tasks|settings)
  const tabFromUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('tab') as TabId | null
    : null
  const validTabs: TabId[] = ['dashboard', 'preview', 'tasks', 'settings']
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'dashboard'
  
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: tasks = [] } = useProjectTasks(projectId)
  const { data: settings } = useProjectSettings(projectId)
  
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const updateSettings = useUpdateSettings()
  const createTask = useCreateTask()
  
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  
  // Handle tab selection and clear URL search params
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    // Remove ?tab= from URL without page reload
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }
  
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [meetingExpanded, setMeetingExpanded] = useState(false)
  const [meetingMuted, setMeetingMuted] = useState(false)
  
  // New Task Form State
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [newTaskLabels, setNewTaskLabels] = useState<string[]>([])
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  
  // Check if we're on a child route (like task details)
  const isOnChildRoute = matches.some(match => match.routeId === '/$projectId/task/$taskId')

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
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'preview' as const, label: 'Preview', icon: Monitor },
    { id: 'tasks' as const, label: 'Tasks', icon: ListTodo },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length

  // Default settings if not loaded yet
  const currentSettings = settings || {
    projectId: project.id,
    // Email Settings (Inbound & Outbound)
    emailInboxEnabled: false,
    emailInboxAddress: '',
    emailOutboundEnabled: true,
    emailNotifyOnNewTasks: true,
    emailNotifyOnTaskComplete: true,
    emailNotifyOnBuildComplete: true,
    emailNotifyOnMeetingComplete: false,
    // Application Environment Settings
    activeEnvironment: 'development' as const,
    developmentUrl: '',
    productionUrl: '',
    developmentActive: false,
    productionActive: false,
    // Task Settings
    taskLabels: [
      { id: 'bug', name: 'bug', color: '#d73a4a' },
      { id: 'feature', name: 'feature', color: '#0075ca' },
      { id: 'enhancement', name: 'enhancement', color: '#a2eeef' },
      { id: 'documentation', name: 'documentation', color: '#0075ca' },
      { id: 'help-wanted', name: 'help wanted', color: '#008672' },
    ],
    taskTemplates: [],
    milestones: [],
    showRoadmap: true,
    showKanban: false,
    kanbanGroupBy: 'status' as const,
    // Preview Settings
    previewDefaultDevice: 'desktop' as const,
    buildOnTaskComplete: false,
    buildOnMeetingComplete: false,
    // Meeting Settings
    meetingProvider: 'jitsi' as const,
    meetingUrl: '',
  }

  // If on child route, render child route through Outlet
  if (isOnChildRoute) {
    return (
      <div className="animate-fade-in">
        <Outlet />
      </div>
    )
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
            <h1 className="text-xl font-semibold text-white">{project.name}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {completedTasks}/{totalTasks} tasks completed
            </p>
          </div>
      </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTaskFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
          <button
            onClick={() => setMeetingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
          >
            <Video className="w-4 h-4" />
            {meetingOpen ? 'In Meeting' : 'Start Meeting'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
        {activeTab === 'dashboard' && (
          <Dashboard 
            project={project}
            tasks={tasks}
            settings={currentSettings}
          />
        )}

        {activeTab === 'preview' && (
          <ApplicationPreview
            previewUrl={project.previewUrl}
            settings={currentSettings}
            isRunning={currentSettings.activeEnvironment === 'development' ? currentSettings.developmentActive : currentSettings.productionActive}
            publishedAt={project.publishedAt}
            onUpdatePreviewUrl={(url) => updateProject.mutate({ id: project.id, updates: { previewUrl: url } })}
            onToggleRunning={() => {
              const isDev = currentSettings.activeEnvironment === 'development'
              updateSettings.mutate({
                projectId: project.id,
                updates: isDev 
                  ? { developmentActive: !currentSettings.developmentActive }
                  : { productionActive: !currentSettings.productionActive }
              })
            }}
            onToggleEnvironment={() => updateSettings.mutate({
              projectId: project.id,
              updates: { activeEnvironment: currentSettings.activeEnvironment === 'development' ? 'production' : 'development' }
            })}
            onPublish={() => {
              updateProject.mutate({ 
                id: project.id, 
                updates: { publishedAt: new Date().toISOString() } 
              })
              // Optionally switch to production after publish
              updateSettings.mutate({
                projectId: project.id,
                updates: { activeEnvironment: 'production', productionActive: true }
              })
            }}
          />
        )}
        
        {activeTab === 'tasks' && (
          <TaskList projectId={project.id} />
        )}
        
        {activeTab === 'settings' && (
          <ProjectSettings 
            project={project}
            settings={currentSettings}
            onUpdateProject={(updates) => updateProject.mutate({ id: project.id, updates })}
            onUpdateSettings={(updates) => updateSettings.mutate({ projectId: project.id, updates })}
            onArchive={() => {
              updateProject.mutate({ id: project.id, updates: { status: 'archived' } })
              navigate({ to: '/' })
            }}
            onDelete={() => {
              if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                deleteProject.mutate(project.id)
                navigate({ to: '/' })
              }
            }}
          />
        )}
      </div>

      {/* Meeting PiP Overlay */}
      {meetingOpen && (
        <div 
          className={`fixed bottom-4 right-4 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
            meetingExpanded ? 'w-[640px] h-[400px]' : 'w-80 h-48'
          }`}
        >
          {/* PiP Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white font-medium">Meeting</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMeetingMuted(!meetingMuted)}
                className={`p-1.5 hover:bg-neutral-700 rounded transition-colors ${
                  meetingMuted ? 'text-red-400 hover:text-red-300' : 'text-neutral-400 hover:text-white'
                }`}
                title={meetingMuted ? 'Unmute' : 'Mute'}
              >
                {meetingMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                title="Share Screen"
              >
                <ScreenShare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMeetingExpanded(!meetingExpanded)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                title={meetingExpanded ? 'Minimize' : 'Expand'}
              >
                {meetingExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setMeetingOpen(false)
                  setMeetingExpanded(false)
                }}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-700 rounded transition-colors"
                title="End Meeting"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* PiP Content */}
          <div className="flex items-center justify-center h-[calc(100%-40px)] bg-neutral-950">
            <div className="text-center">
              <Video className="w-12 h-12 text-neutral-700 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Meeting in progress</p>
            </div>
          </div>
        </div>
      )}

      {/* New Task Overlay */}
      {taskFormOpen && (
        <div className="fixed top-4 right-4 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white font-medium">New Task</span>
            </div>
            <button
              onClick={() => {
                setTaskFormOpen(false)
                setNewTaskTitle('')
                setNewTaskPriority('medium')
                setNewTaskLabels([])
                setShowLabelDropdown(false)
              }}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Form */}
          <div className="p-3 max-h-[400px] overflow-y-auto">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskTitle.trim()) {
                  createTask.mutate({
                    projectId,
                    title: newTaskTitle.trim(),
                    description: '',
                    status: 'open',
                    priority: newTaskPriority,
                    type: 'development',
                    labels: newTaskLabels,
                    relations: [],
                  })
                  setNewTaskTitle('')
                  setNewTaskPriority('medium')
                  setNewTaskLabels([])
                  setTaskFormOpen(false)
                } else if (e.key === 'Escape') {
                  setTaskFormOpen(false)
                  setNewTaskTitle('')
                }
              }}
              placeholder="Task title"
              autoFocus
              className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none text-sm mb-2 pb-1.5 border-b border-neutral-800"
            />
            
            {/* Priority Selector */}
            <div className="mb-2">
              <label className="text-xs text-neutral-500 mb-1.5 block">Priority</label>
              <div className="flex items-center gap-1">
                {(['low', 'medium', 'high', 'critical'] as const).map((priority) => {
                  const config = {
                    low: { label: 'Low', color: 'text-neutral-400', bg: 'bg-neutral-500/20' },
                    medium: { label: 'Med', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                    high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
                    critical: { label: 'Crit', color: 'text-red-400', bg: 'bg-red-500/20' },
                  }[priority]
                  
                  return (
                    <button
                      key={priority}
                      onClick={() => setNewTaskPriority(priority)}
                      className={`flex-1 px-1.5 py-1 rounded text-xs transition-colors ${
                        newTaskPriority === priority 
                          ? `${config.bg} ${config.color}` 
                          : 'text-neutral-600 hover:text-neutral-400'
                      }`}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Labels */}
            {currentSettings.taskLabels && currentSettings.taskLabels.length > 0 && (
              <div className="mb-2">
                <label className="text-xs text-neutral-500 mb-1.5 block">Labels</label>
                <div className="relative">
                  <button
                    onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      {newTaskLabels.length > 0 ? `${newTaskLabels.length} selected` : 'Select labels'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showLabelDropdown && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10 py-1 max-h-32 overflow-y-auto">
                      {currentSettings.taskLabels.map((label) => (
                        <button
                          key={label.id}
                          onClick={() => {
                            if (newTaskLabels.includes(label.name)) {
                              setNewTaskLabels(newTaskLabels.filter(l => l !== label.name))
                            } else {
                              setNewTaskLabels([...newTaskLabels, label.name])
                            }
                          }}
                          className="w-full px-2 py-1.5 text-left text-xs hover:bg-neutral-700 flex items-center gap-2"
                        >
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: label.color }}
                          />
                          <span className={newTaskLabels.includes(label.name) ? 'text-white' : 'text-neutral-400'}>
                            {label.name}
                          </span>
                          {newTaskLabels.includes(label.name) && (
                            <Check className="w-3 h-3 ml-auto text-green-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Labels */}
                {newTaskLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {newTaskLabels.map((labelName) => {
                      const label = currentSettings.taskLabels?.find(l => l.name === labelName)
                      return (
                        <span
                          key={labelName}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{ 
                            backgroundColor: (label?.color ?? '#6b7280') + '20', 
                            color: label?.color ?? '#6b7280' 
                          }}
                        >
                          {labelName}
                          <button
                            onClick={() => setNewTaskLabels(newTaskLabels.filter(l => l !== labelName))}
                            className="hover:opacity-70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800 mt-2">
              <button
                onClick={() => {
                  setTaskFormOpen(false)
                  setNewTaskTitle('')
                  setNewTaskPriority('medium')
                  setNewTaskLabels([])
                }}
                className="px-2 py-1 text-xs text-neutral-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTaskTitle.trim()) return
                  createTask.mutate({
                    projectId,
                    title: newTaskTitle.trim(),
                    description: '',
                    status: 'open',
                    priority: newTaskPriority,
                    type: 'development',
                    labels: newTaskLabels,
                    relations: [],
                  })
                  setNewTaskTitle('')
                  setNewTaskPriority('medium')
                  setNewTaskLabels([])
                  setTaskFormOpen(false)
                }}
                disabled={!newTaskTitle.trim()}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
