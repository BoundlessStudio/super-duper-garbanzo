import { projectsCollection, tasksCollection, settingsCollection } from './collections'
import type { Project, Task, ProjectSettings } from './schema'
import { defaultProjectSettings } from './schema'

interface LegacyTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface LegacyProject {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  tasks: LegacyTask[]
  settings: {
    agentEnabled: boolean
    agentModel: string
    agentAutoRun: boolean
    agentWebhookUrl: string
    githubRepo: string
    githubBranch: string
    githubAutoSync: boolean
    githubToken: string
    sandboxUrl: string
    sandboxType: 'codesandbox' | 'stackblitz' | 'replit' | 'custom'
    sandboxAutoRefresh: boolean
    meetingProvider: 'jitsi' | 'zoom' | 'teams' | 'custom'
    meetingUrl: string
    meetingAutoRecord: boolean
  }
  previewUrl: string
  createdAt: string
  updatedAt: string
  owner: string
  teamMembers: string[]
}

interface LegacyState {
  projects: LegacyProject[]
  currentProjectId: string | null
}

export async function migrateFromZustand(): Promise<boolean> {
  const stored = localStorage.getItem('customware-portal-storage')
  if (!stored) {
    console.log('No legacy data found, skipping migration')
    return false
  }

  // Check if we've already migrated (collections have data)
  if (projectsCollection.size > 0) {
    console.log('Collections already have data, skipping migration')
    return false
  }

  try {
    const parsed = JSON.parse(stored)
    const state: LegacyState = parsed.state

    if (!state?.projects?.length) {
      console.log('No projects in legacy storage')
      return false
    }

    console.log(`Migrating ${state.projects.length} projects...`)

    for (const legacyProject of state.projects) {
      // Migrate project (without tasks array)
      const project: Project = {
        id: legacyProject.id,
        name: legacyProject.name,
        description: legacyProject.description,
        status: legacyProject.status,
        previewUrl: legacyProject.previewUrl,
        createdAt: legacyProject.createdAt,
        updatedAt: legacyProject.updatedAt,
        owner: legacyProject.owner,
        teamMembers: legacyProject.teamMembers,
      }
      
      projectsCollection.insert(project)

      // Migrate tasks
      for (const legacyTask of legacyProject.tasks) {
        const task: Task = {
          id: legacyTask.id,
          projectId: legacyProject.id,
          title: legacyTask.title,
          description: legacyTask.description,
          status: legacyTask.status,
          priority: legacyTask.priority,
          assignee: legacyTask.assignee,
          dueDate: legacyTask.dueDate,
          createdAt: legacyTask.createdAt,
          updatedAt: legacyTask.updatedAt,
        }
        tasksCollection.insert(task)
      }

      // Migrate settings
      const settings: ProjectSettings = {
        projectId: legacyProject.id,
        agentEnabled: legacyProject.settings?.agentEnabled ?? defaultProjectSettings.agentEnabled,
        agentModel: legacyProject.settings?.agentModel ?? defaultProjectSettings.agentModel,
        agentAutoRun: legacyProject.settings?.agentAutoRun ?? defaultProjectSettings.agentAutoRun,
        agentWebhookUrl: legacyProject.settings?.agentWebhookUrl ?? defaultProjectSettings.agentWebhookUrl,
        githubRepo: legacyProject.settings?.githubRepo ?? defaultProjectSettings.githubRepo,
        githubBranch: legacyProject.settings?.githubBranch ?? defaultProjectSettings.githubBranch,
        githubAutoSync: legacyProject.settings?.githubAutoSync ?? defaultProjectSettings.githubAutoSync,
        githubToken: legacyProject.settings?.githubToken ?? defaultProjectSettings.githubToken,
        sandboxUrl: legacyProject.settings?.sandboxUrl ?? defaultProjectSettings.sandboxUrl,
        sandboxType: legacyProject.settings?.sandboxType ?? defaultProjectSettings.sandboxType,
        sandboxAutoRefresh: legacyProject.settings?.sandboxAutoRefresh ?? defaultProjectSettings.sandboxAutoRefresh,
        meetingProvider: legacyProject.settings?.meetingProvider ?? defaultProjectSettings.meetingProvider,
        meetingUrl: legacyProject.settings?.meetingUrl ?? defaultProjectSettings.meetingUrl,
        meetingAutoRecord: legacyProject.settings?.meetingAutoRecord ?? defaultProjectSettings.meetingAutoRecord,
      }
      settingsCollection.insert(settings)
    }

    // Remove old storage after successful migration
    localStorage.removeItem('customware-portal-storage')
    console.log('Migration completed successfully')
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}
