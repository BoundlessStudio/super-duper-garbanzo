import { useState } from 'react';
import { 
  Plus, 
  Check,
  Trash2,
  GripVertical
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
}

export function TaskList({ projectId, tasks }: TaskListProps) {
  const { addTask, updateTask, deleteTask } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    addTask(projectId, {
      title: newTaskTitle.trim(),
      description: '',
      status: 'pending' as TaskStatus,
      priority: 'medium' as TaskPriority,
    });
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle('');
    }
  };

  const toggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(projectId, task.id, { status: newStatus });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });

  return (
    <div>
      {/* Add Task Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-4"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      )}

      {/* Add Task Input */}
      {isAdding && (
        <div className="card p-3 mb-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task name"
            autoFocus
            className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
              }}
              className="px-3 py-1.5 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="px-3 py-1.5 text-sm bg-white text-black rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-30"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-neutral-600">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-900/50 transition-colors ${
                task.status === 'completed' ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="w-4 h-4 text-neutral-700 opacity-0 group-hover:opacity-100 cursor-grab" />
              
              <button
                onClick={() => toggleStatus(task)}
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-green-500 border-green-500'
                    : 'border-neutral-600 hover:border-neutral-400'
                }`}
              >
                {task.status === 'completed' ? (
                  <Check className="w-3 h-3 text-black" />
                ) : null}
              </button>
              
              <span className={`flex-1 text-sm ${
                task.status === 'completed' ? 'line-through text-neutral-500' : 'text-white'
              }`}>
                {task.title}
              </span>

              <button
                onClick={() => deleteTask(projectId, task.id)}
                className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
