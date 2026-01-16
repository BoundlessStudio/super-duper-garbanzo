import { useLiveQuery } from '@tanstack/react-db'
import { eq } from '@tanstack/db'
import { projectsCollection, tasksCollection, settingsCollection } from './collections'
import { defaultProjectSettings, type Project, type Task, type ProjectSettings } from './schema'

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Projects hooks
export function useProjects() {
  return useLiveQuery((q) =>
    q.from({ projects: projectsCollection })
      .orderBy(({ projects }) => projects.updatedAt, 'desc')
  )
}

export function useProject(projectId: string) {
  return useLiveQuery(
    (q) =>
      q.from({ projects: projectsCollection })
        .where(({ projects }) => eq(projects.id, projectId))
        .findOne(),
    [projectId]
  )
}

export function useCreateProject() {
  return {
    mutate: (name: string): Project => {
      const now = new Date().toISOString()
      const project: Project = {
        id: generateId(),
        name,
        description: '',
        status: 'active',
        previewUrl: '',
        createdAt: now,
        updatedAt: now,
        owner: 'Project Owner',
        teamMembers: [],
      }
      
      projectsCollection.insert(project)
      
      // Create default settings
      const settings: ProjectSettings = {
        ...defaultProjectSettings,
        projectId: project.id,
      }
      settingsCollection.insert(settings)
      
      return project
    },
  }
}

export function useUpdateProject() {
  return {
    mutate: ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      projectsCollection.update(id, (draft) => {
        Object.assign(draft, updates)
        draft.updatedAt = new Date().toISOString()
      })
    },
  }
}

export function useDeleteProject() {
  return {
    mutate: async (projectId: string) => {
      // Delete associated tasks
      const tasks = tasksCollection.toArray.filter((t) => t.projectId === projectId)
      for (const task of tasks) {
        tasksCollection.delete(task.id)
      }
      // Delete settings
      settingsCollection.delete(projectId)
      // Delete project
      projectsCollection.delete(projectId)
    },
  }
}

// Tasks hooks
export function useProjectTasks(projectId: string) {
  return useLiveQuery(
    (q) =>
      q.from({ tasks: tasksCollection })
        .where(({ tasks }) => eq(tasks.projectId, projectId))
        .orderBy(({ tasks }) => tasks.createdAt, 'desc'),
    [projectId]
  )
}

export function useCreateTask() {
  return {
    mutate: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
      const now = new Date().toISOString()
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      tasksCollection.insert(newTask)
      
      // Update project's updatedAt
      projectsCollection.update(taskData.projectId, (draft) => {
        draft.updatedAt = now
      })
      
      return newTask
    },
  }
}

export function useUpdateTask() {
  return {
    mutate: ({ id, projectId, updates }: { id: string; projectId: string; updates: Partial<Task> }) => {
      const now = new Date().toISOString()
      tasksCollection.update(id, (draft) => {
        Object.assign(draft, updates)
        draft.updatedAt = now
      })
      
      // Update project's updatedAt
      projectsCollection.update(projectId, (draft) => {
        draft.updatedAt = now
      })
    },
  }
}

export function useDeleteTask() {
  return {
    mutate: ({ taskId, projectId }: { taskId: string; projectId: string }) => {
      tasksCollection.delete(taskId)
      
      // Update project's updatedAt
      projectsCollection.update(projectId, (draft) => {
        draft.updatedAt = new Date().toISOString()
      })
    },
  }
}

// Settings hooks
export function useProjectSettings(projectId: string) {
  return useLiveQuery(
    (q) =>
      q.from({ settings: settingsCollection })
        .where(({ settings }) => eq(settings.projectId, projectId))
        .findOne(),
    [projectId]
  )
}

export function useUpdateSettings() {
  return {
    mutate: ({ projectId, updates }: { projectId: string; updates: Partial<ProjectSettings> }) => {
      settingsCollection.update(projectId, (draft) => {
        Object.assign(draft, updates)
      })
      
      // Update project's updatedAt
      projectsCollection.update(projectId, (draft) => {
        draft.updatedAt = new Date().toISOString()
      })
    },
  }
}
