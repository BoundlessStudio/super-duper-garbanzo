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

// Claude Skill schema
export const claudeSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  createdAt: z.string(),
})

export type ClaudeSkill = z.infer<typeof claudeSkillSchema>

// Project settings schema
export const projectSettingsSchema = z.object({
  projectId: z.string(),
  
  // Agent Settings (Status & Control)
  agentEnabled: z.boolean(),
  agentCurrentTask: z.string(),
  agentLastAction: z.string(),
  agentLastActionAt: z.string(),
  agentSkills: z.array(claudeSkillSchema),
  
  // GitHub Settings (Repository & Integration)
  githubRepo: z.string(),
  githubUseIssues: z.boolean(),
  githubUsePRs: z.boolean(),
  
  // Sandbox Settings (Status & Control)
  sandboxRunning: z.boolean(),
  sandboxEnvVars: z.record(z.string(), z.string()),
  
  // Notification Settings (Email Toggles)
  notifyOnNewTasks: z.boolean(),
  notifyOnTaskComplete: z.boolean(),
  notifyOnBuildComplete: z.boolean(),
  notifyOnMeetingComplete: z.boolean(),
  
  // Preview Settings (Display & Build Triggers)
  previewDefaultDevice: z.enum(['mobile', 'tablet', 'desktop']),
  buildOnTaskComplete: z.boolean(),
  buildOnMeetingComplete: z.boolean(),
  
  // Meeting Settings
  meetingProvider: z.enum(['jitsi', 'zoom', 'teams', 'custom']),
  meetingUrl: z.string(),
})

export type Task = z.infer<typeof taskSchema>
export type Project = z.infer<typeof projectSchema>
export type ProjectSettings = z.infer<typeof projectSettingsSchema>

export const defaultProjectSettings: Omit<ProjectSettings, 'projectId'> = {
  // Agent Settings
  agentEnabled: false,
  agentCurrentTask: '',
  agentLastAction: '',
  agentLastActionAt: '',
  agentSkills: [],
  
  // GitHub Settings
  githubRepo: '',
  githubUseIssues: false,
  githubUsePRs: false,
  
  // Sandbox Settings
  sandboxRunning: false,
  sandboxEnvVars: {},
  
  // Notification Settings
  notifyOnNewTasks: true,
  notifyOnTaskComplete: true,
  notifyOnBuildComplete: true,
  notifyOnMeetingComplete: false,
  
  // Preview Settings
  previewDefaultDevice: 'desktop',
  buildOnTaskComplete: false,
  buildOnMeetingComplete: false,
  
  // Meeting Settings
  meetingProvider: 'jitsi',
  meetingUrl: '',
}
