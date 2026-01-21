import { useLiveQuery } from '@tanstack/react-db'
import { eq } from '@tanstack/db'
import { projectsCollection, tasksCollection, settingsCollection, commentsCollection } from './collections'
import { defaultProjectSettings, type Project, type Task, type ProjectSettings, type Comment } from './schema'

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
    mutate: (name: string, description: string = ''): Project => {
      const now = new Date().toISOString()
      const project: Project = {
        id: generateId(),
        name,
        description,
        status: 'active',
        previewUrl: '',
        createdAt: now,
        updatedAt: now,
        owner: 'Project Owner',
        teamMembers: [],
      }
      
      projectsCollection.insert(project)
      
      // Create default settings with development environment started
      const settings: ProjectSettings = {
        ...defaultProjectSettings,
        projectId: project.id,
        developmentActive: true, // Start development environment by default
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
export function useTask(taskId: string) {
  return useLiveQuery(
    (q) =>
      q.from({ tasks: tasksCollection })
        .where(({ tasks }) => eq(tasks.id, taskId))
        .findOne(),
    [taskId]
  )
}

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
        type: taskData.type ?? 'development',
        labels: taskData.labels ?? [],
        relations: taskData.relations ?? [],
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

// Comments hooks
export function useTaskComments(taskId: string) {
  return useLiveQuery(
    (q) =>
      q.from({ comments: commentsCollection })
        .where(({ comments }) => eq(comments.taskId, taskId))
        .orderBy(({ comments }) => comments.createdAt, 'asc'),
    [taskId]
  )
}

export function useCreateComment() {
  return {
    mutate: (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Comment => {
      const now = new Date().toISOString()
      const newComment: Comment = {
        ...commentData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      commentsCollection.insert(newComment)
      
      return newComment
    },
  }
}

export function useUpdateComment() {
  return {
    mutate: ({ id, updates }: { id: string; updates: Partial<Comment> }) => {
      commentsCollection.update(id, (draft) => {
        Object.assign(draft, updates)
        draft.updatedAt = new Date().toISOString()
      })
    },
  }
}

export function useDeleteComment() {
  return {
    mutate: (commentId: string) => {
      commentsCollection.delete(commentId)
    },
  }
}
