import { useState } from 'react';
import { 
  Archive, 
  Trash2, 
  Save, 
  Inbox, 
  Plus, 
  X,
  Flag,
  Calendar,
  LayoutList,
  Mail,
  Bell
} from 'lucide-react';
import type { Project, ProjectSettings as ProjectSettingsType, Milestone } from '../db/schema';

interface ProjectSettingsProps {
  project: Project;
  settings: ProjectSettingsType;
  onUpdateProject: (updates: Partial<Pick<Project, 'name' | 'description'>>) => void;
  onUpdateSettings: (updates: Partial<ProjectSettingsType>) => void;
  onArchive: () => void;
  onDelete: () => void;
}

// Reusable Toggle Switch Component
function Toggle({ 
  checked, 
  onChange, 
  disabled = false 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
    </label>
  );
}

// Task Labels Editor Component - Hidden for now
// function LabelsEditor({
//   labels,
//   onChange,
// }: {
//   labels: TaskLabel[];
//   onChange: (labels: TaskLabel[]) => void;
// }) {
//   const [newName, setNewName] = useState('');
//   const [newColor, setNewColor] = useState('#6366f1');
//
//   const colors = [
//     '#d73a4a', '#0075ca', '#a2eeef', '#008672', '#e4e669',
//     '#d876e3', '#6366f1', '#f97316', '#22c55e', '#64748b'
//   ];
//
//   const handleAdd = () => {
//     if (!newName.trim()) return;
//     const newLabel: TaskLabel = {
//       id: crypto.randomUUID(),
//       name: newName.trim().toLowerCase(),
//       color: newColor,
//     };
//     onChange([...labels, newLabel]);
//     setNewName('');
//   };
//
//   const handleRemove = (labelId: string) => {
//     onChange(labels.filter(l => l.id !== labelId));
//   };
//
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleAdd();
//     }
//   };
//
//   return (
//     <div className="space-y-3">
//       {labels.length > 0 && (
//         <div className="flex flex-wrap gap-2">
//           {labels.map((label) => (
//             <div 
//               key={label.id} 
//               className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
//               style={{ backgroundColor: label.color + '20', color: label.color }}
//             >
//               <span 
//                 className="w-2 h-2 rounded-full" 
//                 style={{ backgroundColor: label.color }}
//               />
//               {label.name}
//               <button
//                 onClick={() => handleRemove(label.id)}
//                 className="ml-1 hover:opacity-70 transition-opacity"
//               >
//                 <X className="w-3 h-3" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//       
//       <div className="flex items-center gap-2">
//         <input
//           type="text"
//           value={newName}
//           onChange={(e) => setNewName(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Label name"
//           className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
//         />
//         <div className="flex items-center gap-1">
//           {colors.slice(0, 5).map((color) => (
//             <button
//               key={color}
//               onClick={() => setNewColor(color)}
//               className={`w-6 h-6 rounded-full transition-transform ${newColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : ''}`}
//               style={{ backgroundColor: color }}
//             />
//           ))}
//         </div>
//         <button
//           onClick={handleAdd}
//           disabled={!newName.trim()}
//           className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
//         >
//           <Plus className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// }

// Milestones Editor Component
function MilestonesEditor({
  milestones,
  onChange,
}: {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: '',
      dueDate: newDueDate || undefined,
    };
    onChange([...milestones, newMilestone]);
    setNewTitle('');
    setNewDueDate('');
  };

  const handleRemove = (milestoneId: string) => {
    onChange(milestones.filter(m => m.id !== milestoneId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {milestones.length > 0 && (
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <div 
              key={milestone.id} 
              className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg"
            >
              <Flag className="w-4 h-4 text-blue-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{milestone.title}</div>
                {milestone.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemove(milestone.id)}
                className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Milestone title"
          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ProjectSettings({ project, settings, onUpdateProject, onUpdateSettings, onArchive, onDelete }: ProjectSettingsProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(value !== project.name || description !== project.description);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasChanges(name !== project.name || value !== project.description);
  };

  const handleSave = () => {
    onUpdateProject({ name, description });
    setHasChanges(false);
  };

  const handleSettingsChange = <K extends keyof ProjectSettingsType>(key: K, value: ProjectSettingsType[K]) => {
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Project Details */}
      <div className="card p-6">
        <h3 className="text-white font-medium mb-6">Project Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors resize-none"
              placeholder="Enter project description"
            />
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-neutral-400" />
          <h3 className="text-white font-medium">Email Settings</h3>
        </div>
        
        <div className="space-y-6">
          {/* Email Inbox */}
          <div className="p-4 bg-neutral-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Inbox className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-white">Email Inbox</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Receive tasks and updates via email</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Enable email inbox</span>
                <Toggle
                  checked={settings.emailInboxEnabled}
                  onChange={(checked) => handleSettingsChange('emailInboxEnabled', checked)}
                />
              </div>
              
              {settings.emailInboxEnabled && (
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Inbox Address</label>
                  <input
                    type="text"
                    value={settings.emailInboxAddress}
                    onChange={(e) => handleSettingsChange('emailInboxAddress', e.target.value)}
                    placeholder="iqwfx0x5gj@inbox.customware.io"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Email Notifications */}
          <div className="p-4 bg-neutral-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-white">Email Notifications</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Get notified about project events via email</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">Enable outbound emails</span>
                <Toggle
                  checked={settings.emailOutboundEnabled}
                  onChange={(checked) => handleSettingsChange('emailOutboundEnabled', checked)}
                />
              </div>

              {settings.emailOutboundEnabled && (
                <>
                  <div className="border-t border-neutral-800 pt-3 mt-3">
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">Notify me when:</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">New tasks are created</span>
                    <Toggle
                      checked={settings.emailNotifyOnNewTasks}
                      onChange={(checked) => handleSettingsChange('emailNotifyOnNewTasks', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Tasks are completed</span>
                    <Toggle
                      checked={settings.emailNotifyOnTaskComplete}
                      onChange={(checked) => handleSettingsChange('emailNotifyOnTaskComplete', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Builds are completed</span>
                    <Toggle
                      checked={settings.emailNotifyOnBuildComplete}
                      onChange={(checked) => handleSettingsChange('emailNotifyOnBuildComplete', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Meetings are completed</span>
                    <Toggle
                      checked={settings.emailNotifyOnMeetingComplete}
                      onChange={(checked) => handleSettingsChange('emailNotifyOnMeetingComplete', checked)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Settings */}
      <div className="card p-6">
        <h3 className="text-white font-medium mb-6">Task Settings</h3>
        
        <div className="space-y-6">
          {/* Milestones */}
          <div className="p-4 bg-neutral-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-white">Milestones</span>
            </div>
            <MilestonesEditor
              milestones={settings.milestones}
              onChange={(milestones) => handleSettingsChange('milestones', milestones)}
            />
          </div>

          {/* Views */}
          <div className="p-4 bg-neutral-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <LayoutList className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-white">Views</span>
            </div>
            
            <div className="space-y-4">
              {/* Roadmap Toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Show Roadmap</span>
                  <Toggle
                    checked={settings.showRoadmap}
                    onChange={(checked) => handleSettingsChange('showRoadmap', checked)}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Display the roadmap timeline in the Tasks tab</p>
              </div>

              {/* Kanban Toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Show Kanban</span>
                  <Toggle
                    checked={settings.showKanban}
                    onChange={(checked) => handleSettingsChange('showKanban', checked)}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Display tasks in a Kanban board view</p>
                
                {settings.showKanban && (
                  <div className="mt-3">
                    <label className="block text-xs text-neutral-400 mb-1.5">Group By</label>
                    <select
                      value={settings.kanbanGroupBy}
                      onChange={(e) => handleSettingsChange('kanbanGroupBy', e.target.value as 'status' | 'priority' | 'labels' | 'milestone')}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700"
                    >
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                      <option value="labels">Labels</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-900/50">
        <h3 className="text-red-400 font-medium mb-4">Danger Zone</h3>
        
        <div className="space-y-4">
          {/* Archive */}
          <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">Archive Project</p>
              <p className="text-neutral-500 text-xs mt-1">
                Hide this project from the main list. Can be restored later.
              </p>
            </div>
            <button
              onClick={onArchive}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors text-sm"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>

          {/* Delete */}
          <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">Delete Project</p>
              <p className="text-neutral-500 text-xs mt-1">
                Permanently delete this project and all its data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
