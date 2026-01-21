import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Video, Archive } from 'lucide-react'
import { useProjects, useCreateProject } from '../db/hooks'
import { tasksCollection } from '../db/collections'

export const Route = createFileRoute('/')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

  const handleStartOnboarding = () => {
    const randomName = `Project-${Math.random().toString(36).substring(2, 9)}`
    const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultricies, tortor faucibus efficitur molestie, nisl ligula fermentum tortor, non ultrices mi nulla nec magna. Nam blandit odio vitae malesuada ultrices."
    
    const newProject = createProject.mutate(randomName, description)
    navigate({ to: '/$projectId', params: { projectId: newProject.id }, search: { tab: 'tasks' } })
  }

  // Filter projects based on active tab
  const filteredProjects = activeTab === 'active' 
    ? projects.filter(p => p.status !== 'archived')
    : projects.filter(p => p.status === 'archived')

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
      <div className="flex items-start justify-between mb-6">
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

      {/* Tabs */}
      <div className="border-b border-neutral-800 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Active
            <span className="ml-1 px-1.5 py-0.5 bg-neutral-800 rounded text-xs text-neutral-400">
              {projects.filter(p => p.status !== 'archived').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
              activeTab === 'archived'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Archive className="w-4 h-4" />
            Archived
            <span className="ml-1 px-1.5 py-0.5 bg-neutral-800 rounded text-xs text-neutral-400">
              {projects.filter(p => p.status === 'archived').length}
            </span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="card p-16 text-center">
          {activeTab === 'active' ? (
            <>
              <p className="text-neutral-500 mb-4">No active projects yet</p>
              <button
                onClick={handleStartOnboarding}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
              >
                <Video className="w-4 h-4" />
                Start Onboarding Call
              </button>
            </>
          ) : (
            <>
              <Archive className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-500">No archived projects</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
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
      <div className="pt-4">
        <span className="text-xs text-neutral-600">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  )
}
