import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCreateProject } from '../db/hooks'

export const Route = createFileRoute('/new')({
  component: CreateProjectPage,
})

function CreateProjectPage() {
  const navigate = useNavigate()
  const createProject = useCreateProject()
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    const project = createProject.mutate(name.trim())
    navigate({ to: '/$projectId', params: { projectId: project.id } })
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in pt-16">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-white">New Project</h1>
        <p className="text-neutral-500 mt-2">Enter a name to get started</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          autoFocus
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
