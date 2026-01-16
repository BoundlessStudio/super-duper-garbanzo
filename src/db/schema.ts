import { z } from 'zod'

// Task schema with validation
export const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Project schema with validation
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'archived']),
  previewUrl: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: z.string(),
  teamMembers: z.array(z.string()),
})

// Project settings schema
export const projectSettingsSchema = z.object({
  projectId: z.string(),
  // Background Agent Settings
  agentEnabled: z.boolean(),
  agentModel: z.string(),
  agentAutoRun: z.boolean(),
  agentWebhookUrl: z.string(),
  // GitHub Settings
  githubRepo: z.string(),
  githubBranch: z.string(),
  githubAutoSync: z.boolean(),
  githubToken: z.string(),
  // Sandbox Settings
  sandboxUrl: z.string(),
  sandboxType: z.enum(['codesandbox', 'stackblitz', 'replit', 'custom']),
  sandboxAutoRefresh: z.boolean(),
  // Meeting Settings
  meetingProvider: z.enum(['jitsi', 'zoom', 'teams', 'custom']),
  meetingUrl: z.string(),
  meetingAutoRecord: z.boolean(),
})

export type Task = z.infer<typeof taskSchema>
export type Project = z.infer<typeof projectSchema>
export type ProjectSettings = z.infer<typeof projectSettingsSchema>

export const defaultProjectSettings: Omit<ProjectSettings, 'projectId'> = {
  agentEnabled: true,
  agentModel: 'gpt-4',
  agentAutoRun: false,
  agentWebhookUrl: '',
  githubRepo: '',
  githubBranch: 'main',
  githubAutoSync: false,
  githubToken: '',
  sandboxUrl: '',
  sandboxType: 'codesandbox',
  sandboxAutoRefresh: true,
  meetingProvider: 'jitsi',
  meetingUrl: '',
  meetingAutoRecord: false,
}
