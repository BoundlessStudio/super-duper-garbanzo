import { z } from 'zod'

// Task Relation schema
export const taskRelationSchema = z.object({
  type: z.enum(['blocks', 'blocked-by', 'related-to', 'duplicate-of']),
  taskId: z.string(),
})

export type TaskRelation = z.infer<typeof taskRelationSchema>

// Task schema with validation
export const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum(['open', 'in-progress', 'completed', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['development', 'information']).default('development'),
  labels: z.array(z.string()).default([]),
  milestone: z.string().optional(),
  relations: z.array(taskRelationSchema).default([]),
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
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: z.string(),
  teamMembers: z.array(z.string()),
})

// Task Template schema
export const taskTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  defaultLabels: z.array(z.string()),
  defaultPriority: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean(),
})

export type TaskTemplate = z.infer<typeof taskTemplateSchema>

// Task Label schema
export const taskLabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(), // hex color
})

export type TaskLabel = z.infer<typeof taskLabelSchema>

// Milestone schema (GitHub-style)
export const milestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dueDate: z.string().optional(),
})

export type Milestone = z.infer<typeof milestoneSchema>

// Project settings schema
export const projectSettingsSchema = z.object({
  projectId: z.string(),
  
  // Email Settings (Inbound & Outbound)
  emailInboxEnabled: z.boolean(),
  emailInboxAddress: z.string(),
  emailOutboundEnabled: z.boolean(),
  emailNotifyOnNewTasks: z.boolean(),
  emailNotifyOnTaskComplete: z.boolean(),
  emailNotifyOnBuildComplete: z.boolean(),
  emailNotifyOnMeetingComplete: z.boolean(),
  
  // Application Environment Settings
  activeEnvironment: z.enum(['development', 'production']),
  developmentUrl: z.string(),
  productionUrl: z.string(),
  developmentActive: z.boolean(),
  productionActive: z.boolean(),
  
  // Task Settings
  taskLabels: z.array(taskLabelSchema),
  taskTemplates: z.array(taskTemplateSchema),
  milestones: z.array(milestoneSchema),
  showRoadmap: z.boolean(),
  showKanban: z.boolean(),
  kanbanGroupBy: z.enum(['status', 'priority', 'labels', 'milestone']),
  
  // Preview Settings (Display & Build Triggers)
  previewDefaultDevice: z.enum(['mobile', 'tablet', 'desktop']),
  buildOnTaskComplete: z.boolean(),
  buildOnMeetingComplete: z.boolean(),
  
  // Meeting Settings
  meetingProvider: z.enum(['jitsi', 'zoom', 'teams', 'custom']),
  meetingUrl: z.string(),
})

// Comment schema
export const commentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  author: z.string(),
  content: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Task = z.infer<typeof taskSchema>
export type Project = z.infer<typeof projectSchema>
export type ProjectSettings = z.infer<typeof projectSettingsSchema>
export type Comment = z.infer<typeof commentSchema>

export const defaultProjectSettings: Omit<ProjectSettings, 'projectId'> = {
  // Email Settings (Inbound & Outbound)
  emailInboxEnabled: false,
  emailInboxAddress: '',
  emailOutboundEnabled: true,
  emailNotifyOnNewTasks: true,
  emailNotifyOnTaskComplete: true,
  emailNotifyOnBuildComplete: true,
  emailNotifyOnMeetingComplete: false,
  
  // Application Environment Settings
  activeEnvironment: 'development',
  developmentUrl: '',
  productionUrl: '',
  developmentActive: false,
  productionActive: false,
  
  // Task Settings
  taskLabels: [
    { id: 'bug', name: 'bug', color: '#d73a4a' },
    { id: 'feature', name: 'feature', color: '#0075ca' },
    { id: 'enhancement', name: 'enhancement', color: '#a2eeef' },
    { id: 'documentation', name: 'documentation', color: '#0075ca' },
    { id: 'help-wanted', name: 'help wanted', color: '#008672' },
  ],
  taskTemplates: [],
  milestones: [],
  showRoadmap: false,
  showKanban: false,
  kanbanGroupBy: 'status',
  
  // Preview Settings
  previewDefaultDevice: 'desktop',
  buildOnTaskComplete: false,
  buildOnMeetingComplete: false,
  
  // Meeting Settings
  meetingProvider: 'jitsi',
  meetingUrl: '',
}
