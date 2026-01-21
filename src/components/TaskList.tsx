import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  ChevronDown,
  X,
  AlertCircle,
  Clock,
  Tag
} from 'lucide-react'
import { useProjectTasks, useUpdateTask, useDeleteTask, useProjectSettings } from '../db/hooks'
import type { Task, TaskLabel } from '../db/schema'
import { Roadmap } from './Roadmap'
import { Kanban } from './Kanban'

interface TaskListProps {
  projectId: string
}

type TaskStatus = 'open' | 'in-progress' | 'completed' | 'closed'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
type SortField = 'created' | 'updated' | 'priority' | 'title'
type SortDirection = 'asc' | 'desc'

const statusConfig: Record<TaskStatus, { icon: typeof Circle; label: string; color: string }> = {
  'open': { icon: Circle, label: 'Open', color: 'text-green-500' },
  'in-progress': { icon: CircleDot, label: 'In Progress', color: 'text-yellow-500' },
  'completed': { icon: CheckCircle2, label: 'Completed', color: 'text-purple-500' },
  'closed': { icon: XCircle, label: 'Closed', color: 'text-neutral-500' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  'low': { label: 'Low', color: 'text-neutral-400', bg: 'bg-neutral-500/20' },
  'medium': { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'high': { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  'critical': { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' },
}

export function TaskList({ projectId }: TaskListProps) {
  const { data: tasks = [] } = useProjectTasks(projectId)
  const { data: settings } = useProjectSettings(projectId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [labelFilter, setLabelFilter] = useState<string | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Dropdown State
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const availableLabels = settings?.taskLabels ?? []
  const milestones = settings?.milestones ?? []

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter)
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter)
    }
    
    // Label filter
    if (labelFilter !== 'all') {
      result = result.filter(task => task.labels?.includes(labelFilter))
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }
      return sortDirection === 'desc' ? -comparison : comparison
    })
    
    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, labelFilter, sortField, sortDirection])

  // Stats
  const openCount = tasks.filter(t => t.status === 'open' || t.status === 'in-progress').length
  const closedCount = tasks.filter(t => t.status === 'completed' || t.status === 'closed').length

  const cycleStatus = (task: Task) => {
    const statusOrder: TaskStatus[] = ['open', 'in-progress', 'completed', 'closed']
    const currentIndex = statusOrder.indexOf(task.status as TaskStatus)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    updateTask.mutate({ 
      id: task.id, 
      projectId, 
      updates: { status: nextStatus } 
    })
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask.mutate({ taskId, projectId })
  }

  const getLabelColor = (labelName: string): TaskLabel | undefined => {
    return availableLabels.find(l => l.name === labelName)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setLabelFilter('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || labelFilter !== 'all'

  return (
    <div>
      {/* Header with Stats */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'all' ? 'open' : 'all')}
          className={`flex items-center gap-1.5 text-sm ${
            statusFilter === 'open' || statusFilter === 'in-progress' 
              ? 'text-white font-medium' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Circle className="w-4 h-4" />
          {openCount} Open
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`flex items-center gap-1.5 text-sm ${
            statusFilter === 'completed' || statusFilter === 'closed'
              ? 'text-white font-medium' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {closedCount} Closed
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown)
              setShowPriorityDropdown(false)
              setShowLabelDropdown(false)
              setShowSortDropdown(false)
            }}
            className={`flex items-center gap-2 px-3 py-2 bg-neutral-900 border rounded-lg text-sm transition-colors ${
              statusFilter !== 'all' 
                ? 'border-neutral-600 text-white' 
                : 'border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Status
            <ChevronDown className="w-3 h-3" />
          </button>
          {showStatusDropdown && (
            <div className="absolute top-full mt-1 right-0 w-40 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
              <button
                onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false) }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${statusFilter === 'all' ? 'text-white' : 'text-neutral-400'}`}
              >
                All
              </button>
              {Object.entries(statusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status as TaskStatus); setShowStatusDropdown(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2 ${
                    statusFilter === status ? 'text-white' : 'text-neutral-400'
                  }`}
                >
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPriorityDropdown(!showPriorityDropdown)
              setShowStatusDropdown(false)
              setShowLabelDropdown(false)
              setShowSortDropdown(false)
            }}
            className={`flex items-center gap-2 px-3 py-2 bg-neutral-900 border rounded-lg text-sm transition-colors ${
              priorityFilter !== 'all' 
                ? 'border-neutral-600 text-white' 
                : 'border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Priority
            <ChevronDown className="w-3 h-3" />
          </button>
          {showPriorityDropdown && (
            <div className="absolute top-full mt-1 right-0 w-40 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
              <button
                onClick={() => { setPriorityFilter('all'); setShowPriorityDropdown(false) }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${priorityFilter === 'all' ? 'text-white' : 'text-neutral-400'}`}
              >
                All
              </button>
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <button
                  key={priority}
                  onClick={() => { setPriorityFilter(priority as TaskPriority); setShowPriorityDropdown(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2 ${
                    priorityFilter === priority ? 'text-white' : 'text-neutral-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.bg}`} style={{ backgroundColor: config.color.replace('text-', '').replace('-400', '') }} />
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Label Filter */}
        {availableLabels.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setShowLabelDropdown(!showLabelDropdown)
                setShowStatusDropdown(false)
                setShowPriorityDropdown(false)
                setShowSortDropdown(false)
              }}
              className={`flex items-center gap-2 px-3 py-2 bg-neutral-900 border rounded-lg text-sm transition-colors ${
                labelFilter !== 'all' 
                  ? 'border-neutral-600 text-white' 
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              Label
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLabelDropdown && (
              <div className="absolute top-full mt-1 right-0 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
                <button
                  onClick={() => { setLabelFilter('all'); setShowLabelDropdown(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${labelFilter === 'all' ? 'text-white' : 'text-neutral-400'}`}
                >
                  All
                </button>
                {availableLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => { setLabelFilter(label.name); setShowLabelDropdown(false) }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center gap-2 ${
                      labelFilter === label.name ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown)
              setShowStatusDropdown(false)
              setShowPriorityDropdown(false)
              setShowLabelDropdown(false)
            }}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full mt-1 right-0 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-10 py-1">
              {[
                { field: 'created', label: 'Date created' },
                { field: 'updated', label: 'Date updated' },
                { field: 'priority', label: 'Priority' },
                { field: 'title', label: 'Title' },
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => {
                    if (sortField === field) {
                      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
                    } else {
                      setSortField(field as SortField)
                      setSortDirection('desc')
                    }
                    setShowSortDropdown(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 flex items-center justify-between ${
                    sortField === field ? 'text-white' : 'text-neutral-400'
                  }`}
                >
                  {label}
                  {sortField === field && (
                    <span className="text-xs text-neutral-500">
                      {sortDirection === 'desc' ? 'Newest' : 'Oldest'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-2 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task List */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="card p-8 text-center">
          {hasActiveFilters ? (
            <>
              <Search className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-600">No tasks match your filters</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-neutral-500 hover:text-white transition-colors"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <Circle className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-600">No tasks yet</p>
              <p className="mt-2 text-sm text-neutral-500">Click "New Task" in the header to create one</p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          {filteredAndSortedTasks.map((task, index) => {
            const StatusIcon = statusConfig[task.status as TaskStatus]?.icon ?? Circle
            const statusColor = statusConfig[task.status as TaskStatus]?.color ?? 'text-neutral-500'
            const priorityCfg = priorityConfig[task.priority as TaskPriority]

            return (
              <div
                key={task.id}
                className={`group flex items-start gap-3 p-4 hover:bg-neutral-900/50 transition-colors ${
                  index !== 0 ? 'border-t border-neutral-800' : ''
                }`}
              >
                <button
                  onClick={() => cycleStatus(task)}
                  className={`mt-0.5 ${statusColor} hover:opacity-70 transition-opacity`}
                  title={`Status: ${statusConfig[task.status as TaskStatus]?.label ?? task.status}`}
                >
                  <StatusIcon className="w-5 h-5" />
                </button>
                
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <Link
                    to="/$projectId/task/$taskId"
                    params={{ projectId, taskId: task.id }}
                    className={`text-sm hover:underline ${
                      task.status === 'completed' || task.status === 'closed'
                        ? 'text-neutral-500 line-through' 
                        : 'text-white hover:text-blue-400'
                    }`}
                  >
                    {task.title}
                  </Link>
                  
                  {/* Priority & Labels */}
                  {(task.priority !== 'medium' || (task.labels && task.labels.length > 0)) && (
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      {task.priority !== 'medium' && (
                        <span className={`px-1.5 py-0.5 rounded text-xs ${priorityCfg.bg} ${priorityCfg.color}`}>
                          {priorityCfg.label}
                        </span>
                      )}
                      {task.labels && task.labels.length > 0 && task.labels.map((labelName) => {
                        const label = getLabelColor(labelName)
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
                          </span>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer Stats */}
      {filteredAndSortedTasks.length > 0 && (
        <div className="mt-3 text-xs text-neutral-600 text-center">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      )}

      {/* Kanban */}
      {settings?.showKanban && (
        <div className="mt-8 pt-8 border-t border-neutral-800">
          <h2 className="text-lg font-semibold text-white mb-4">Kanban Board</h2>
          <Kanban 
            projectId={projectId} 
            tasks={tasks} 
            groupBy={settings.kanbanGroupBy}
            labels={availableLabels}
            milestones={milestones}
          />
        </div>
      )}

      {/* Roadmap */}
      {settings?.showRoadmap && (
        <div className="mt-8 pt-8 border-t border-neutral-800">
          <h2 className="text-lg font-semibold text-white mb-4">Roadmap</h2>
          <Roadmap projectId={projectId} tasks={tasks} milestones={milestones} />
        </div>
      )}
    </div>
  )
}
