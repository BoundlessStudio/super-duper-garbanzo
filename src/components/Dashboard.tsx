import { 
  Circle, 
  Clock, 
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Globe
} from 'lucide-react';
import type { Project, Task, ProjectSettings } from '../db/schema';

interface DashboardProps {
  project: Project;
  tasks: Task[];
  settings: ProjectSettings;
}

export function Dashboard({ project, tasks, settings }: DashboardProps) {
  // Calculate stats
  const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityStats = {
    critical: tasks.filter(t => t.priority === 'critical' && (t.status === 'open' || t.status === 'in-progress')).length,
    high: tasks.filter(t => t.priority === 'high' && (t.status === 'open' || t.status === 'in-progress')).length,
    medium: tasks.filter(t => t.priority === 'medium' && (t.status === 'open' || t.status === 'in-progress')).length,
    low: tasks.filter(t => t.priority === 'low' && (t.status === 'open' || t.status === 'in-progress')).length,
  };

  // Recent tasks (last 5)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const statusConfig = {
    'open': { color: 'text-green-500', bg: 'bg-green-500/20' },
    'in-progress': { color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    'completed': { color: 'text-purple-500', bg: 'bg-purple-500/20' },
    'closed': { color: 'text-neutral-500', bg: 'bg-neutral-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Total Tasks</span>
            <Activity className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{totalTasks}</div>
          <div className="text-xs text-neutral-600 mt-1">{openTasks} active</div>
        </div>

        {/* Completion Rate */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Completion</span>
            <TrendingUp className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{completionRate}%</div>
          <div className="text-xs text-neutral-600 mt-1">{completedTasks} completed</div>
        </div>

        {/* Mentions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Mentions</span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{project.teamMembers.length + 1}</div>
          <div className="text-xs text-neutral-600 mt-1">members</div>
        </div>

        {/* Environment Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">Environments</span>
            <Globe className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Development</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                settings.developmentActive 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-neutral-500/20 text-neutral-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${settings.developmentActive ? 'bg-amber-500' : 'bg-neutral-500'}`} />
                {settings.developmentActive ? 'Active' : 'Stopped'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Production</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                settings.productionActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-neutral-500/20 text-neutral-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${settings.productionActive ? 'bg-green-500' : 'bg-neutral-500'}`} />
                {settings.productionActive ? 'Active' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="card p-5">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Circle className="w-4 h-4" />
          Active Tasks by Priority
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-neutral-400">Critical</span>
            </div>
            <div className="text-2xl font-semibold text-white">{priorityStats.critical}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm text-neutral-400">High</span>
            </div>
            <div className="text-2xl font-semibold text-white">{priorityStats.high}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-neutral-400">Medium</span>
            </div>
            <div className="text-2xl font-semibold text-white">{priorityStats.medium}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-neutral-500" />
              <span className="text-sm text-neutral-400">Low</span>
            </div>
            <div className="text-2xl font-semibold text-white">{priorityStats.low}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-5">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 pb-3 border-b border-neutral-800 last:border-0 last:pb-0">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${statusConfig[task.status as keyof typeof statusConfig]?.color.replace('text-', 'bg-') || 'bg-neutral-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-600">
                      <span className={`px-1.5 py-0.5 rounded ${statusConfig[task.status as keyof typeof statusConfig]?.bg || 'bg-neutral-500/20'} ${statusConfig[task.status as keyof typeof statusConfig]?.color || 'text-neutral-500'}`}>
                        {task.status}
                      </span>
                      <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Circle className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
              <p className="text-sm text-neutral-600">No tasks yet</p>
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="card p-5">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Project Information
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-neutral-500 mb-1">Description</div>
              <div className="text-sm text-white">{project.description || 'No description'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Created</div>
              <div className="text-sm text-white">{new Date(project.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">Last Updated</div>
              <div className="text-sm text-white">{new Date(project.updatedAt).toLocaleDateString()}</div>
            </div>
            {project.previewUrl && (
              <div>
                <div className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Preview URL
                </div>
                <a 
                  href={project.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                >
                  {project.previewUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
