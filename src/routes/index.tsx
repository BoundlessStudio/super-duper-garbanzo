import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useProjects } from '../db/hooks'
import { tasksCollection } from '../db/collections'

export const Route = createFileRoute('/')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-20">
          <p className="text-neutral-500">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-neutral-500 mt-1">Manage your software development projects</p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-neutral-500 mb-4">No projects yet</p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: { id: string; name: string; description: string; status: string; createdAt: string } }) {
  // Get tasks for this project to calculate progress
  const projectTasks = tasksCollection.toArray.filter(t => t.projectId === project.id)
  const completedTasks = projectTasks.filter(t => t.status === 'completed').length
  const totalTasks = projectTasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  
  return (
    <Link
      to="/$projectId"
      params={{ projectId: project.id }}
      className="card p-5 hover:border-neutral-700 transition-all"
    >
      {/* Header with title and status */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-medium text-white">{project.name}</h3>
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

      {/* Description */}
      <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
        {project.description || 'No description'}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-neutral-500">Progress</span>
          <span className="text-neutral-400">{completedTasks}/{totalTasks} tasks</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-neutral-800">
        <span className="text-xs text-neutral-600">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  )
}
