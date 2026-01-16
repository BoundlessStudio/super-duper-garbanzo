export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  // Background Agent Settings
  agentEnabled: boolean;
  agentModel: string;
  agentAutoRun: boolean;
  agentWebhookUrl: string;
  
  // GitHub Settings
  githubRepo: string;
  githubBranch: string;
  githubAutoSync: boolean;
  githubToken: string;
  
  // Sandbox Settings
  sandboxUrl: string;
  sandboxType: 'codesandbox' | 'stackblitz' | 'replit' | 'custom';
  sandboxAutoRefresh: boolean;
  
  // Meeting Settings
  meetingProvider: 'jitsi' | 'zoom' | 'teams' | 'custom';
  meetingUrl: string;
  meetingAutoRecord: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  tasks: Task[];
  settings: ProjectSettings;
  previewUrl: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  teamMembers: string[];
}

export const defaultProjectSettings: ProjectSettings = {
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
};
