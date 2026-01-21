import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { 
  Circle,
  CircleDot,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Flag
} from 'lucide-react'
import type { Task, Milestone } from '../db/schema'

interface RoadmapProps {
  projectId: string
  tasks: Task[]
  milestones: Milestone[]
}

type TaskStatus = 'open' | 'in-progress' | 'completed' | 'closed'

const statusConfig: Record<TaskStatus, { icon: typeof Circle; color: string }> = {
  'open': { icon: Circle, color: 'text-green-500' },
  'in-progress': { icon: CircleDot, color: 'text-yellow-500' },
  'completed': { icon: CheckCircle2, color: 'text-purple-500' },
  'closed': { icon: XCircle, color: 'text-neutral-500' },
}

export function Roadmap({ projectId, tasks, milestones }: RoadmapProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set(milestones.map(m => m.id)))

  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones)
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId)
    } else {
      newExpanded.add(milestoneId)
    }
    setExpandedMilestones(newExpanded)
  }

  // Group tasks by milestone
  const tasksByMilestone = useMemo(() => {
    const grouped = new Map<string | null, Task[]>()
    
    // Initialize with milestones
    milestones.forEach(m => grouped.set(m.id, []))
    grouped.set(null, []) // Tasks without milestone
    
    tasks.forEach(task => {
      // Assign task to its milestone or null if no milestone
      const milestoneId = task.milestone ?? null
      const milestoneGroup = grouped.get(milestoneId)
      if (milestoneGroup) {
        milestoneGroup.push(task)
      } else {
        // If milestone doesn't exist, add to "No Milestone"
        grouped.get(null)?.push(task)
      }
    })
    
    return grouped
  }, [tasks, milestones])

  // Generate timeline dates (next 12 weeks)
  const weeks = useMemo(() => {
    const result = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - today.getDay()) // Start of current week
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      result.push({
        weekNumber: i + 1,
        start: weekStart,
        end: weekEnd,
        month: weekStart.toLocaleDateString('en-US', { month: 'short' }),
        day: weekStart.getDate()
      })
    }
    return result
  }, [])

  const renderTask = (task: Task) => {
    const statusCfg = statusConfig[task.status as TaskStatus]
    const StatusIcon = statusCfg?.icon ?? Circle

    return (
      <div key={task.id} className="flex items-center gap-2 py-2 text-sm">
        <StatusIcon className={`w-4 h-4 ${statusCfg?.color}`} />
        <Link
          to="/$projectId/task/$taskId"
          params={{ projectId, taskId: task.id }}
          className="text-neutral-300 hover:text-white hover:underline"
        >
          {task.title}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month indicators */}
          <div className="flex items-center border-b border-neutral-800 pb-2 mb-4">
            <div className="w-64 flex-shrink-0 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Roadmap
            </div>
            <div className="flex-1 flex">
              {weeks.map((week, idx) => {
                const showMonth = idx === 0 || week.day <= 7
                return (
                  <div key={idx} className="flex-1 min-w-[60px] text-center">
                    {showMonth && (
                      <div className="text-xs font-medium text-neutral-400 mb-1">
                        {week.month}
                      </div>
                    )}
                    <div className="text-xs text-neutral-600">{week.day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Milestones and Tasks */}
          <div className="space-y-2">
            {milestones.length > 0 ? (
              milestones.map((milestone) => {
                const isExpanded = expandedMilestones.has(milestone.id)
                const milestoneTasks = tasksByMilestone.get(milestone.id) || []
                
                // Calculate milestone position on timeline if it has a due date
                let timelinePosition = null
                if (milestone.dueDate) {
                  const dueDate = new Date(milestone.dueDate)
                  const weekIndex = weeks.findIndex(w => dueDate >= w.start && dueDate <= w.end)
                  if (weekIndex !== -1) {
                    timelinePosition = weekIndex
                  }
                }

                return (
                  <div key={milestone.id} className="border border-neutral-800 rounded-lg overflow-hidden">
                    {/* Milestone Header */}
                    <div className="flex items-center bg-neutral-900/50">
                      <div className="w-64 flex-shrink-0 p-3">
                        <button
                          onClick={() => toggleMilestone(milestone.id)}
                          className="flex items-center gap-2 w-full text-left group"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-neutral-500" />
                          )}
                          <Flag className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                            {milestone.title}
                          </span>
                          <span className="ml-auto text-xs text-neutral-500">
                            {milestoneTasks.length}
                          </span>
                        </button>
                        {milestone.description && (
                          <p className="text-xs text-neutral-600 mt-1 ml-10">{milestone.description}</p>
                        )}
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1 ml-10">
                            <Calendar className="w-3 h-3" />
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {/* Timeline visualization */}
                      <div className="flex-1 flex relative h-12 items-center">
                        {timelinePosition !== null && (
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 h-8 bg-blue-500/20 border-l-2 border-r-2 border-blue-500 rounded"
                            style={{
                              left: `${(timelinePosition / weeks.length) * 100}%`,
                              width: `${(1 / weeks.length) * 100}%`
                            }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                        )}
                        {weeks.map((_, idx) => (
                          <div key={idx} className="flex-1 min-w-[60px] border-r border-neutral-800 last:border-r-0" />
                        ))}
                      </div>
                    </div>

                    {/* Milestone Tasks */}
                    {isExpanded && milestoneTasks.length > 0 && (
                      <div className="border-t border-neutral-800">
                        <div className="flex">
                          <div className="w-64 flex-shrink-0 px-3 py-2 space-y-1">
                            {milestoneTasks.map(renderTask)}
                          </div>
                          <div className="flex-1 py-2">
                            {/* Task timeline visualization could go here */}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-neutral-600">
                <Flag className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                <p className="text-sm">No milestones yet</p>
                <p className="text-xs text-neutral-700 mt-1">Create milestones in Settings to organize your roadmap</p>
              </div>
            )}

            {/* Unassigned Tasks */}
            {tasksByMilestone.get(null) && tasksByMilestone.get(null)!.length > 0 && (
              <div className="border border-neutral-800 rounded-lg overflow-hidden">
                <div className="flex items-center bg-neutral-900/50">
                  <div className="w-64 flex-shrink-0 p-3">
                    <button
                      onClick={() => toggleMilestone('unassigned')}
                      className="flex items-center gap-2 w-full text-left group"
                    >
                      {expandedMilestones.has('unassigned') ? (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      )}
                      <span className="text-sm font-medium text-neutral-400">
                        No Milestone
                      </span>
                      <span className="ml-auto text-xs text-neutral-500">
                        {tasksByMilestone.get(null)!.length}
                      </span>
                    </button>
                  </div>
                  <div className="flex-1 flex relative h-12">
                    {weeks.map((_, idx) => (
                      <div key={idx} className="flex-1 min-w-[60px] border-r border-neutral-800 last:border-r-0" />
                    ))}
                  </div>
                </div>
                {expandedMilestones.has('unassigned') && (
                  <div className="border-t border-neutral-800">
                    <div className="flex">
                      <div className="w-64 flex-shrink-0 px-3 py-2 space-y-1">
                        {tasksByMilestone.get(null)!.map(renderTask)}
                      </div>
                      <div className="flex-1 py-2">
                        {/* Task timeline visualization could go here */}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
