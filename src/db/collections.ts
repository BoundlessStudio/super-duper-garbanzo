import { createCollection, localStorageCollectionOptions } from '@tanstack/db'
import { projectSchema, taskSchema, projectSettingsSchema, commentSchema } from './schema'

// Projects collection with localStorage persistence
export const projectsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: 'customware-projects',
    schema: projectSchema,
    getKey: (project) => project.id,
  })
)

// Tasks collection with localStorage persistence
export const tasksCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: 'customware-tasks',
    schema: taskSchema,
    getKey: (task) => task.id,
  })
)

// Project settings collection with localStorage persistence
export const settingsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: 'customware-settings',
    schema: projectSettingsSchema,
    getKey: (settings) => settings.projectId,
  })
)

// Comments collection with localStorage persistence
export const commentsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: 'customware-comments',
    schema: commentSchema,
    getKey: (comment) => comment.id,
  })
)
