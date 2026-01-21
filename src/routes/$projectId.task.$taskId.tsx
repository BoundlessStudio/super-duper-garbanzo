import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  ArrowLeft,
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  Trash2,
  MessageSquare,
  ChevronDown,
  Send,
  Code,
  Info,
  AlertCircle
} from 'lucide-react'
import { useTask, useProject, useUpdateTask, useDeleteTask, useProjectSettings, useTaskComments, useCreateComment, useDeleteComment } from '../db/hooks'
import type { Task } from '../db/schema'

type TaskStatus = 'open' | 'in-progress' | 'completed' | 'closed'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
type TaskType = 'development' | 'information'

const statusConfig: Record<TaskStatus, { icon: typeof Circle; label: string; color: string; bg: string }> = {
  'open': { icon: Circle, label: 'Open', color: 'text-green-500', bg: 'bg-green-500/20' },
  'in-progress': { icon: CircleDot, label: 'In Progress', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  'completed': { icon: CheckCircle2, label: 'Completed', color: 'text-purple-500', bg: 'bg-purple-500/20' },
  'closed': { icon: XCircle, label: 'Closed', color: 'text-neutral-500', bg: 'bg-neutral-500/20' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  'low': { label: 'Low', color: 'text-neutral-400', bg: 'bg-neutral-500/20' },
  'medium': { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'high': { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  'critical': { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' },
}

const typeConfig: Record<TaskType, { label: string; icon: typeof Code; color: string }> = {
  'development': { label: 'Development', icon: Code, color: 'text-green-400' },
  'information': { label: 'Information', icon: Info, color: 'text-blue-400' },
}

export const Route = createFileRoute('/$projectId/task/$taskId')({
  component: TaskDetailPage,
  notFoundComponent: () => (
    <div className="text-center py-20">
      <p className="text-neutral-500 mb-4">Task not found</p>
      <Link to="/" className="text-white hover:text-neutral-300 transition-colors">
        Back to Projects
      </Link>
    </div>
  ),
})

function TaskDetailPage() {
  const { projectId, taskId } = Route.useParams()
  const navigate = useNavigate()
  
  const { data: task, isLoading: taskLoading } = useTask(taskId)
  const { data: project } = useProject(projectId)
  const { data: settings } = useProjectSettings(projectId)
  const { data: comments = [] } = useTaskComments(taskId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  
  const [editTitle, setEditTitle] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false)
  const [showMilestoneDropdown, setShowMilestoneDropdown] = useState(false)
  const [newComment, setNewComment] = useState('')

  if (taskLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Loading task...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 mb-4">Task not found</p>
        <Link 
          to="/$projectId" 
          params={{ projectId }}
          className="text-white hover:text-neutral-300 transition-colors"
        >
          Back to Project
        </Link>
      </div>
    )
  }

  const statusCfg = statusConfig[task.status as TaskStatus]
  const priorityCfg = priorityConfig[task.priority as TaskPriority]
  const typeCfg = typeConfig[task.type as TaskType]
  const StatusIcon = statusCfg?.icon ?? Circle
  const TypeIcon = typeCfg?.icon ?? AlertCircle
  const availableLabels = settings?.taskLabels ?? []
  const milestones = settings?.milestones ?? []

  const handleUpdateStatus = (status: TaskStatus) => {
    updateTask.mutate({ id: task.id, projectId, updates: { status } })
    setShowStatusDropdown(false)
  }

  const handleUpdatePriority = (priority: TaskPriority) => {
    updateTask.mutate({ id: task.id, projectId, updates: { priority } })
    setShowPriorityDropdown(false)
  }

  const handleUpdateType = (type: TaskType) => {
    updateTask.mutate({ id: task.id, projectId, updates: { type } })
    setShowTypeDropdown(false)
  }

  const handleToggleLabel = (labelName: string) => {
    const currentLabels = task.labels ?? []
    const newLabels = currentLabels.includes(labelName)
      ? currentLabels.filter(l => l !== labelName)
      : [...currentLabels, labelName]
    updateTask.mutate({ id: task.id, projectId, updates: { labels: newLabels } })
  }

  const handleUpdateMilestone = (milestoneId: string | null) => {
    updateTask.mutate({ id: task.id, projectId, updates: { milestone: milestoneId ?? undefined } })
    setShowMilestoneDropdown(false)
  }

  const handleSaveDescription = () => {
    const updates: Partial<Task> = {}
    
    // Update title if changed
    if (editTitle.trim() && editTitle !== task.title) {
      updates.title = editTitle.trim()
    }
    
    // Update description if changed
    if (editDescription !== task.description) {
      updates.description = editDescription
    }
    
    // Only make the API call if there are changes
    if (Object.keys(updates).length > 0) {
      updateTask.mutate({ id: task.id, projectId, updates })
    }
    
    setIsEditingDescription(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate({ taskId: task.id, projectId })
      navigate({ to: '/$projectId', params: { projectId } })
    }
  }

  const getLabelColor = (labelName: string) => {
    return availableLabels.find(l => l.name === labelName)
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link 
          to="/$projectId" 
          params={{ projectId }}
          className="hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {project?.name ?? 'Project'}
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Tasks</span>
        <span>/</span>
        <span className="text-white">
          {task.title} <span className="text-neutral-500">(#{task.id.slice(0, 8)})</span>
        </span>
      </div>

      <div className="flex gap-6 mt-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Title & Description */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Title & Description</h3>
              {!isEditingDescription && (
                <button
                  onClick={() => {
                    setEditTitle(task.title)
                    setEditDescription(task.description)
                    setIsEditingDescription(true)
                  }}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isEditingDescription ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
                    placeholder="Task title..."
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={6}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-none"
                    placeholder="Add a description..."
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditingDescription(false)}
                    className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-300 whitespace-pre-wrap">
                {task.description || (
                  <span className="text-neutral-600 italic">No description provided</span>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h3 className="text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </h3>
            
            {/* Comment List */}
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">No comments yet</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400 flex-shrink-0">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{comment.author}</span>
                        <span className="text-xs text-neutral-600">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-300 whitespace-pre-wrap bg-neutral-900 rounded-lg p-3 border border-neutral-800">
                        {comment.content}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* New Comment Input */}
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400 flex-shrink-0">
                  JW
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-700 resize-none placeholder-neutral-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        if (newComment.trim()) {
                          createComment.mutate({
                            taskId: task.id,
                            author: 'John Wick',
                            content: newComment.trim(),
                          })
                          setNewComment('')
                        }
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-600">
                      Press Cmd+Enter to submit
                    </span>
                    <button
                      onClick={() => {
                        if (newComment.trim()) {
                          createComment.mutate({
                            taskId: task.id,
                            author: 'John Wick',
                            content: newComment.trim(),
                          })
                          setNewComment('')
                        }
                      }}
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    >
                      <Send className="w-3 h-3" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="card p-4 space-y-5">
            {/* Status */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">Status</label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white hover:border-neutral-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusCfg?.color}`} />
                    {statusCfg?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status as TaskStatus)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2 text-neutral-300"
                      >
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        {config.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">Priority</label>
              <div className="relative">
                <button
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white hover:border-neutral-700 transition-colors"
                >
                  <span className={`${priorityCfg?.color}`}>{priorityCfg?.label}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
                {showPriorityDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
                    {Object.entries(priorityConfig).map(([priority, config]) => (
                      <button
                        key={priority}
                        onClick={() => handleUpdatePriority(priority as TaskPriority)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${config.color}`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">Type</label>
              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white hover:border-neutral-700 transition-colors"
                >
                  <span className={`flex items-center gap-2 ${typeCfg?.color}`}>
                    <TypeIcon className="w-4 h-4" />
                    {typeCfg?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
                    {Object.entries(typeConfig).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => handleUpdateType(type as TaskType)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2 ${config.color}`}
                      >
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">Labels</label>
              <div className="relative">
                <button
                  onClick={() => setShowLabelsDropdown(!showLabelsDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white hover:border-neutral-700 transition-colors"
                >
                  <span className="flex items-center gap-1 flex-wrap">
                    {task.labels && task.labels.length > 0 ? (
                      task.labels.slice(0, 2).map((labelName) => {
                        const label = getLabelColor(labelName)
                        return (
                          <span
                            key={labelName}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                            style={{ 
                              backgroundColor: (label?.color ?? '#6b7280') + '20', 
                              color: label?.color ?? '#6b7280' 
                            }}
                          >
                            {labelName}
                          </span>
                        )
                      })
                    ) : (
                      <span className="text-neutral-600 text-xs">None</span>
                    )}
                    {task.labels && task.labels.length > 2 && (
                      <span className="text-xs text-neutral-500">+{task.labels.length - 2}</span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
                {showLabelsDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1 max-h-48 overflow-y-auto">
                    {availableLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleToggleLabel(label.name)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: label.color }}
                        />
                        <span className={task.labels?.includes(label.name) ? 'text-white' : 'text-neutral-400'}>
                          {label.name}
                        </span>
                        {task.labels?.includes(label.name) && (
                          <Check className="w-3 h-3 ml-auto text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Milestone */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">Milestone</label>
              <div className="relative">
                <button
                  onClick={() => setShowMilestoneDropdown(!showMilestoneDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white hover:border-neutral-700 transition-colors"
                >
                  <span className="text-neutral-300">
                    {task.milestone ? milestones.find(m => m.id === task.milestone)?.title ?? 'Unknown' : 'No milestone'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
                {showMilestoneDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
                    <button
                      onClick={() => handleUpdateMilestone(null)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 text-neutral-400"
                    >
                      No milestone
                    </button>
                    {milestones.map((milestone) => (
                      <button
                        key={milestone.id}
                        onClick={() => handleUpdateMilestone(milestone.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                          task.milestone === milestone.id ? 'text-white' : 'text-neutral-400'
                        }`}
                      >
                        {milestone.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="pt-4 border-t border-neutral-800">
              <div className="text-xs text-neutral-600 space-y-1">
                <p>Created {new Date(task.createdAt).toLocaleString()}</p>
                <p>Updated {new Date(task.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Delete */}
            <div className="pt-4 border-t border-neutral-800">
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
