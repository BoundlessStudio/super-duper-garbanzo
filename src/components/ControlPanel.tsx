import { useState, useMemo, useRef } from 'react';
import { 
  Bot, 
  GitBranch, 
  Box,
  Pause,
  Play,
  RotateCcw,
  ExternalLink,
  Terminal,
  Bell,
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  X,
  Upload,
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import type { ProjectSettings, ClaudeSkill } from '../db/schema';

interface ControlPanelProps {
  settings: ProjectSettings;
  onUpdateSettings: (updates: Partial<ProjectSettings>) => void;
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

// Environment Variable Editor Component
function EnvVarEditor({
  envVars,
  onChange,
}: {
  envVars: Record<string, string>;
  onChange: (envVars: Record<string, string>) => void;
}) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const entries = Object.entries(envVars);

  const handleAdd = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({ ...envVars, [newKey.trim()]: newValue.trim() });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemove = (key: string) => {
    const updated = { ...envVars };
    delete updated[key];
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 bg-neutral-900 rounded-lg p-2">
              <span className="text-sm font-mono text-neutral-300 w-32 truncate">{key}</span>
              <span className="text-neutral-600">=</span>
              <span className="text-sm font-mono text-neutral-400 flex-1 truncate">{value}</span>
              <button
                onClick={() => handleRemove(key)}
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
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="KEY"
          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm font-mono placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="value"
          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm font-mono placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
        />
        <button
          onClick={handleAdd}
          disabled={!newKey.trim() || !newValue.trim()}
          className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Claude Skills List Component
function SkillsList({
  skills,
  onChange,
}: {
  skills: ClaudeSkill[];
  onChange: (skills: ClaudeSkill[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleSkill = (skillId: string) => {
    onChange(
      skills.map(skill => 
        skill.id === skillId ? { ...skill, enabled: !skill.enabled } : skill
      )
    );
  };

  const handleRemoveSkill = (skillId: string) => {
    onChange(skills.filter(skill => skill.id !== skillId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, create a skill entry from the file name
    // In a real app, you'd parse the file content
    const newSkill: ClaudeSkill = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: `Uploaded skill from ${file.name}`,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    onChange([...skills, newSkill]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {skills.length > 0 ? (
        <div className="space-y-2">
          {skills.map((skill) => (
            <div 
              key={skill.id} 
              className="flex items-center gap-3 bg-neutral-900 rounded-lg p-3"
            >
              <button
                onClick={() => handleToggleSkill(skill.id)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {skill.enabled ? (
                  <ToggleRight className="w-5 h-5 text-green-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
              </button>
              <FileText className="w-4 h-4 text-neutral-500" />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${skill.enabled ? 'text-white' : 'text-neutral-500'}`}>
                  {skill.name}
                </div>
                <div className="text-xs text-neutral-600 truncate">{skill.description}</div>
              </div>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-neutral-900 rounded-lg">
          <FileText className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">No skills configured</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt,.json"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload Skill
      </button>
    </div>
  );
}

export function ControlPanel({ settings, onUpdateSettings }: ControlPanelProps) {
  const handleChange = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    onUpdateSettings({ [key]: value });
  };

  const lastActionTimeDisplay = useMemo(() => {
    const timestamp = settings.agentLastActionAt;
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [settings.agentLastActionAt]);

  return (
    <div className="space-y-6">
      {/* ========== AGENT SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Bot className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Background Agent</h3>
              <p className="text-sm text-neutral-500">AI-powered development assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${settings.agentEnabled ? 'bg-green-500' : 'bg-neutral-600'}`} />
            <span className={`text-sm ${settings.agentEnabled ? 'text-green-500' : 'text-neutral-500'}`}>
              {settings.agentEnabled ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => handleChange('agentEnabled', !settings.agentEnabled)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
          >
            {settings.agentEnabled ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </button>
          <button 
            onClick={() => {
              handleChange('agentCurrentTask', '');
              handleChange('agentLastAction', 'Agent restarted');
              handleChange('agentLastActionAt', new Date().toISOString());
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>

        {settings.agentCurrentTask && (
          <div className="mb-4">
            <span className="text-xs text-neutral-500 uppercase tracking-wide">Current Task</span>
            <div className="mt-1 px-4 py-3 bg-neutral-900 rounded-lg">
              <span className="text-sm text-neutral-300">{settings.agentCurrentTask}</span>
            </div>
          </div>
        )}

        {settings.agentLastAction && (
          <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 rounded-lg mb-4">
            <Terminal className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-500">Last action:</span>
            <span className="text-sm text-neutral-300 flex-1">{settings.agentLastAction}</span>
            {lastActionTimeDisplay && (
              <span className="text-xs text-neutral-600">{lastActionTimeDisplay}</span>
            )}
          </div>
        )}

        {!settings.agentCurrentTask && !settings.agentLastAction && (
          <div className="px-4 py-3 bg-neutral-900 rounded-lg text-center mb-4">
            <span className="text-sm text-neutral-600">No activity yet</span>
          </div>
        )}

        {/* Claude Skills */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Claude Skills</label>
          <SkillsList
            skills={settings.agentSkills}
            onChange={(skills) => handleChange('agentSkills', skills)}
          />
        </div>
      </div>

      {/* ========== GITHUB SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">GitHub Repository</h3>
              <p className="text-sm text-neutral-500">Repository & integration settings</p>
            </div>
          </div>
          {settings.githubRepo && (
            <a
              href={`https://github.com/${settings.githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Repository</label>
            <input
              type="text"
              value={settings.githubRepo}
              onChange={(e) => handleChange('githubRepo', e.target.value)}
              placeholder="owner/repository"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
            />
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Sync with GitHub Issues</span>
              <Toggle
                checked={settings.githubUseIssues}
                onChange={(checked) => handleChange('githubUseIssues', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Create & Review PRs</span>
              <Toggle
                checked={settings.githubUsePRs}
                onChange={(checked) => handleChange('githubUsePRs', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== SANDBOX SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Box className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Sandbox Environment</h3>
              <p className="text-sm text-neutral-500">Development container settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${settings.sandboxRunning ? 'bg-green-500' : 'bg-neutral-600'}`} />
            <span className={`text-sm ${settings.sandboxRunning ? 'text-green-500' : 'text-neutral-500'}`}>
              {settings.sandboxRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => handleChange('sandboxRunning', !settings.sandboxRunning)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
          >
            {settings.sandboxRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-2">Environment Variables</label>
          <EnvVarEditor
            envVars={settings.sandboxEnvVars}
            onChange={(envVars) => handleChange('sandboxEnvVars', envVars)}
          />
        </div>
      </div>

      {/* ========== NOTIFICATIONS SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Bell className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Email Notifications</h3>
            <p className="text-sm text-neutral-500">Configure notification preferences</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">New tasks assigned</span>
            <Toggle
              checked={settings.notifyOnNewTasks}
              onChange={(checked) => handleChange('notifyOnNewTasks', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Task completed</span>
            <Toggle
              checked={settings.notifyOnTaskComplete}
              onChange={(checked) => handleChange('notifyOnTaskComplete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Build completed</span>
            <Toggle
              checked={settings.notifyOnBuildComplete}
              onChange={(checked) => handleChange('notifyOnBuildComplete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Meeting completed</span>
            <Toggle
              checked={settings.notifyOnMeetingComplete}
              onChange={(checked) => handleChange('notifyOnMeetingComplete', checked)}
            />
          </div>
        </div>
      </div>

      {/* ========== PREVIEW SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Preview Settings</h3>
            <p className="text-sm text-neutral-500">Display and build triggers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Default Device</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleChange('previewDefaultDevice', 'mobile')}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  settings.previewDefaultDevice === 'mobile'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </button>
              <button
                onClick={() => handleChange('previewDefaultDevice', 'tablet')}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  settings.previewDefaultDevice === 'tablet'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Tablet
              </button>
              <button
                onClick={() => handleChange('previewDefaultDevice', 'desktop')}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  settings.previewDefaultDevice === 'desktop'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Build on task complete</span>
              <Toggle
                checked={settings.buildOnTaskComplete}
                onChange={(checked) => handleChange('buildOnTaskComplete', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white">Build on meeting complete</span>
              <Toggle
                checked={settings.buildOnMeetingComplete}
                onChange={(checked) => handleChange('buildOnMeetingComplete', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
