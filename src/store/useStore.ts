import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Task } from '../types';
import { defaultProjectSettings } from '../types';

interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'settings'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  
  // Task actions
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  
  // Settings actions
  updateProjectSettings: (projectId: string, settings: Partial<Project['settings']>) => void;
  
  // Getters
  getCurrentProject: () => Project | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      
      addProject: (projectData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newProject: Project = {
          ...projectData,
          id,
          tasks: [],
          settings: { ...defaultProjectSettings },
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        
        return id;
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },
      
      setCurrentProject: (id) => {
        set({ currentProjectId: id });
      },
      
      addTask: (projectId, taskData) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: [...p.tasks, newTask], updatedAt: now }
              : p
          ),
        }));
      },
      
      updateTask: (projectId, taskId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
                  ),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },
      
      deleteTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.filter((t) => t.id !== taskId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },
      
      updateProjectSettings: (projectId, settings) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  settings: { ...p.settings, ...settings },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },
      
      getCurrentProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.currentProjectId);
      },
    }),
    {
      name: 'customware-portal-storage',
    }
  )
);
