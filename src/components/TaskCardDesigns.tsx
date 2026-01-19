import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  Zap,
  Calendar,
  Flag
} from 'lucide-react'
import type { Task } from '../db/schema'

interface TaskCardDesignsProps {
  tasks: Task[]
}

// Mock tasks for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    projectId: 'demo',
    title: 'Design card variant - Classic',
    description: 'Traditional card layout with left border accent',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Alice Chen',
    dueDate: '2026-01-25',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    projectId: 'demo',
    title: 'Design card variant - Compact',
    description: 'Space-efficient design with inline metadata',
    status: 'pending',
    priority: 'medium',
    assignee: 'Bob Smith',
    dueDate: '2026-01-28',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    projectId: 'demo',
    title: 'Design card variant - Modern',
    description: 'Clean minimal design with floating priority badge',
    status: 'completed',
    priority: 'low',
    assignee: 'Carol Johnson',
    dueDate: '2026-01-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    projectId: 'demo',
    title: 'Design card variant - Bold',
    description: 'High-contrast design with prominent status indicators',
    status: 'blocked',
    priority: 'critical',
    assignee: 'David Lee',
    dueDate: '2026-01-22',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    projectId: 'demo',
    title: 'Design card variant - Gradient',
    description: 'Stylish design with gradient accents and rounded corners',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Eve Martinez',
    dueDate: '2026-01-26',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

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

// Design 1: Classic Card with Left Border
function ClassicTaskCard({ task }: { task: Task }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon

  return (
    <div className={`card p-4 border-l-4 hover:bg-neutral-900/50 transition-colors cursor-pointer ${
      task.priority === 'critical' ? 'border-red-500' :
      task.priority === 'high' ? 'border-orange-500' :
      task.priority === 'medium' ? 'border-blue-500' : 'border-neutral-500'
    }`}>
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

// Design 2: Compact Card
function CompactTaskCard({ task }: { task: Task }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon

  return (
    <div className="card p-3 hover:bg-neutral-900/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <h3 className="text-white text-sm font-medium">{task.title}</h3>
        </div>
        <span className={`${priority.bg} ${priority.color} px-2 py-0.5 rounded text-xs`}>
          {priority.label}
        </span>
      </div>
      <p className="text-neutral-400 text-xs mb-2 ml-6">{task.description}</p>
      <div className="flex items-center gap-3 text-xs text-neutral-500 ml-6">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {task.assignee || 'Unassigned'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
        </span>
      </div>
    </div>
  )
}

// Design 3: Modern Minimal Card
function ModernTaskCard({ task }: { task: Task }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]

  return (
    <div className="card p-5 hover:shadow-lg hover:shadow-neutral-900/50 transition-all cursor-pointer relative overflow-hidden">
      <div className={`absolute top-3 right-3 ${priority.bg} ${priority.color} px-2 py-1 rounded-full text-xs font-medium`}>
        {priority.label}
      </div>
      <div className="pr-20">
        <h3 className="text-white font-semibold mb-2">{task.title}</h3>
        <p className="text-neutral-400 text-sm mb-4">{task.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee || 'Unassigned'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </span>
        </div>
        <span className={`${status.color} text-xs font-medium`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

// Design 4: Bold Status Card
function BoldTaskCard({ task }: { task: Task }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon

  return (
    <div className={`card overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer ${status.bg}`}>
      <div className={`${status.bg} border-l-4 ${
        task.status === 'completed' ? 'border-green-500' :
        task.status === 'blocked' ? 'border-red-500' :
        task.status === 'in-progress' ? 'border-blue-500' : 'border-yellow-500'
      } p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`${status.color} bg-black/50 p-2 rounded-lg`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold">{task.title}</h3>
            <span className={`${status.color} text-xs font-medium`}>{status.label}</span>
          </div>
          <div className={`${priority.bg} ${priority.color} px-3 py-1 rounded-lg text-xs font-bold border border-current/20`}>
            {priority.label}
          </div>
        </div>
        <p className="text-neutral-300 text-sm mb-3">{task.description}</p>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee || 'Unassigned'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Design 5: Gradient Accent Card
function GradientTaskCard({ task }: { task: Task }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon

  const gradientMap = {
    critical: 'from-red-500/20 to-orange-500/20',
    high: 'from-orange-500/20 to-yellow-500/20',
    medium: 'from-blue-500/20 to-cyan-500/20',
    low: 'from-neutral-500/20 to-neutral-600/20',
  }

  return (
    <div className={`card p-0 overflow-hidden hover:shadow-xl hover:shadow-neutral-900/50 transition-all cursor-pointer bg-gradient-to-br ${gradientMap[task.priority]}`}>
      <div className="p-4 backdrop-blur-sm bg-black/40">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`${status.bg} ${status.color} p-1.5 rounded-lg`}>
              <StatusIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{task.title}</h3>
              <span className={`${status.color} text-xs`}>{status.label}</span>
            </div>
          </div>
          <div className={`${priority.color} flex items-center gap-1`}>
            <AlertTriangle className="w-3 h-3" />
            <span className="text-xs font-bold">{priority.label}</span>
          </div>
        </div>
        <p className="text-neutral-300 text-sm mb-3 ml-10">{task.description}</p>
        <div className="flex items-center gap-4 text-xs text-neutral-400 ml-10">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee || 'Unassigned'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TaskCardDesigns({ tasks }: TaskCardDesignsProps) {
  // Use real tasks if available, otherwise use mock tasks
  const displayTasks = tasks.length >= 5 ? tasks.slice(0, 5) : mockTasks

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Design 1: Classic Border</h2>
          <span className="text-xs text-neutral-500">Traditional layout with priority-colored left border</span>
        </div>
        <ClassicTaskCard task={displayTasks[0]} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Design 2: Compact</h2>
          <span className="text-xs text-neutral-500">Space-efficient with inline metadata</span>
        </div>
        <CompactTaskCard task={displayTasks[1]} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Design 3: Modern Minimal</h2>
          <span className="text-xs text-neutral-500">Clean design with floating priority badge</span>
        </div>
        <ModernTaskCard task={displayTasks[2]} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Design 4: Bold Status</h2>
          <span className="text-xs text-neutral-500">High-contrast with prominent status</span>
        </div>
        <BoldTaskCard task={displayTasks[3]} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Design 5: Gradient Accent</h2>
          <span className="text-xs text-neutral-500">Stylish with gradient backgrounds</span>
        </div>
        <GradientTaskCard task={displayTasks[4]} />
      </div>
    </div>
  )
}
