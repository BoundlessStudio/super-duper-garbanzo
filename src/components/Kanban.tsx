import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Flag,
  Tag
} from 'lucide-react'
import type { Task, TaskLabel, Milestone } from '../db/schema'

interface KanbanProps {
  projectId: string
  tasks: Task[]
  groupBy: 'status' | 'priority' | 'labels' | 'milestone'
  labels: TaskLabel[]
  milestones: Milestone[]
}

type TaskStatus = 'open' | 'in-progress' | 'completed' | 'closed'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

const statusConfig: Record<TaskStatus, { icon: typeof Circle; color: string; label: string }> = {
  'open': { icon: Circle, color: 'text-green-500 bg-green-500/10', label: 'Open' },
  'in-progress': { icon: CircleDot, color: 'text-yellow-500 bg-yellow-500/10', label: 'In Progress' },
  'completed': { icon: CheckCircle2, color: 'text-purple-500 bg-purple-500/10', label: 'Completed' },
  'closed': { icon: XCircle, color: 'text-neutral-500 bg-neutral-500/10', label: 'Closed' },
}

const priorityConfig: Record<TaskPriority, { icon: typeof AlertCircle; color: string; label: string }> = {
  'low': { icon: Circle, color: 'text-blue-500 bg-blue-500/10', label: 'Low' },
  'medium': { icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/10', label: 'Medium' },
  'high': { icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10', label: 'High' },
  'critical': { icon: AlertTriangle, color: 'text-red-500 bg-red-500/10', label: 'Critical' },
}

function TaskCard({ task, projectId, labels }: { task: Task; projectId: string; labels: TaskLabel[] }) {
  const StatusIcon = statusConfig[task.status].icon
  const PriorityIcon = priorityConfig[task.priority].icon
  
  const taskLabels = labels.filter(l => task.labels.includes(l.id))
  
  return (
    <Link
      to="/$projectId/task/$taskId"
      params={{ projectId, taskId: task.id }}
      className="block p-3 bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors group"
    >
      <div className="flex items-start gap-2 mb-2">
        <StatusIcon className={`w-4 h-4 mt-0.5 ${statusConfig[task.status].color.split(' ')[0]}`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {task.title}
          </h4>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${priorityConfig[task.priority].color}`}>
          <PriorityIcon className="w-3 h-3" />
          <span className="capitalize">{task.priority}</span>
        </div>
        
        {taskLabels.map(label => (
          <div 
            key={label.id}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
            style={{ backgroundColor: label.color + '20', color: label.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
            <span>{label.name}</span>
          </div>
        ))}
      </div>
    </Link>
  )
}

function KanbanColumn({ 
  title, 
  tasks, 
  projectId, 
  labels,
  icon: Icon,
  color 
}: { 
  title: string
  tasks: Task[]
  projectId: string
  labels: TaskLabel[]
  icon?: typeof Circle
  color?: string
}) {
  return (
    <div className="flex-shrink-0 w-64 flex flex-col">
      <div className={`p-2.5 rounded-lg mb-3 ${color || 'bg-neutral-900/50'}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="ml-auto text-xs text-neutral-500">{tasks.length}</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-neutral-600 text-sm">
            No tasks
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} projectId={projectId} labels={labels} />
          ))
        )}
      </div>
    </div>
  )
}

export function Kanban({ projectId, tasks, groupBy, labels, milestones }: KanbanProps) {
  const columns = useMemo(() => {
    if (groupBy === 'status') {
      return [
        {
          id: 'open',
          title: statusConfig.open.label,
          tasks: tasks.filter(t => t.status === 'open'),
          icon: statusConfig.open.icon,
          color: statusConfig.open.color,
        },
        {
          id: 'in-progress',
          title: statusConfig['in-progress'].label,
          tasks: tasks.filter(t => t.status === 'in-progress'),
          icon: statusConfig['in-progress'].icon,
          color: statusConfig['in-progress'].color,
        },
        {
          id: 'completed',
          title: statusConfig.completed.label,
          tasks: tasks.filter(t => t.status === 'completed'),
          icon: statusConfig.completed.icon,
          color: statusConfig.completed.color,
        },
        {
          id: 'closed',
          title: statusConfig.closed.label,
          tasks: tasks.filter(t => t.status === 'closed'),
          icon: statusConfig.closed.icon,
          color: statusConfig.closed.color,
        },
      ]
    }
    
    if (groupBy === 'priority') {
      return [
        {
          id: 'critical',
          title: priorityConfig.critical.label,
          tasks: tasks.filter(t => t.priority === 'critical'),
          icon: priorityConfig.critical.icon,
          color: priorityConfig.critical.color,
        },
        {
          id: 'high',
          title: priorityConfig.high.label,
          tasks: tasks.filter(t => t.priority === 'high'),
          icon: priorityConfig.high.icon,
          color: priorityConfig.high.color,
        },
        {
          id: 'medium',
          title: priorityConfig.medium.label,
          tasks: tasks.filter(t => t.priority === 'medium'),
          icon: priorityConfig.medium.icon,
          color: priorityConfig.medium.color,
        },
        {
          id: 'low',
          title: priorityConfig.low.label,
          tasks: tasks.filter(t => t.priority === 'low'),
          icon: priorityConfig.low.icon,
          color: priorityConfig.low.color,
        },
      ]
    }
    
    if (groupBy === 'labels') {
      const labelColumns = labels.map(label => ({
        id: label.id,
        title: label.name,
        tasks: tasks.filter(t => t.labels.includes(label.id)),
        icon: Tag,
        color: `bg-${label.color}/10`,
      }))
      
      // Add "No Label" column
      labelColumns.push({
        id: 'no-label',
        title: 'No Label',
        tasks: tasks.filter(t => t.labels.length === 0),
        icon: Tag,
        color: 'bg-neutral-900/50',
      })
      
      return labelColumns
    }
    
    if (groupBy === 'milestone') {
      const milestoneColumns = milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        tasks: tasks.filter(t => t.milestone === milestone.id),
        icon: Flag,
        color: 'bg-blue-500/10',
      }))
      
      // Add "No Milestone" column
      milestoneColumns.push({
        id: 'no-milestone',
        title: 'No Milestone',
        tasks: tasks.filter(t => !t.milestone),
        icon: Flag,
        color: 'bg-neutral-900/50',
      })
      
      return milestoneColumns
    }
    
    return []
  }, [tasks, groupBy, labels, milestones])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          tasks={column.tasks}
          projectId={projectId}
          labels={labels}
          icon={column.icon}
          color={column.color}
        />
      ))}
    </div>
  )
}
