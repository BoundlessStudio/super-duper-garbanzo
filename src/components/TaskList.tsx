import { 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Zap,
  Calendar,
  Flag,
  Plus
} from 'lucide-react'
import type { Task } from '../db/schema'

interface TaskListProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onAddTask?: () => void
}

const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Zap },
  completed: { label: 'Completed', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-neutral-400', bg: 'bg-neutral-400/10' },
  medium: { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10' },
}

function TaskCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon

  return (
    <div 
      onClick={onClick}
      className={`card p-4 border-l-4 hover:bg-neutral-900/50 transition-colors cursor-pointer ${
        task.priority === 'critical' ? 'border-red-500' :
        task.priority === 'high' ? 'border-orange-500' :
        task.priority === 'medium' ? 'border-blue-500' : 'border-neutral-500'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-white font-medium flex-1">{task.title}</h3>
        <span className={`${status.bg} ${status.color} px-2 py-1 rounded text-xs flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>
      <p className="text-neutral-400 text-sm mb-3">{task.description}</p>
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {task.assignee || 'Unassigned'}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
        </div>
        <div className={`flex items-center gap-1 ${priority.color}`}>
          <Flag className="w-3 h-3" />
          {priority.label}
        </div>
      </div>
    </div>
  )
}

export function TaskList({ tasks, onTaskClick, onAddTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-neutral-900/50 rounded-lg p-8 max-w-md mx-auto">
          <Circle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No tasks yet</h3>
          <p className="text-neutral-500 text-sm mb-6">
            Get started by creating your first task for this project
          </p>
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-neutral-400">
          {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
        </h2>
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onClick={() => onTaskClick?.(task)}
        />
      ))}
    </div>
  )
}
