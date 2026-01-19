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
  ToggleRight,
  Camera,
  History,
  Trash2,
  Users,
  Mail,
  Send,
  AtSign
} from 'lucide-react';
import type { ProjectSettings, ClaudeSkill, TeamMember } from '../db/schema';

interface ControlPanelProps {
  settings: ProjectSettings;
  onUpdateSettings: (updates: Partial<ProjectSettings>) => void;
  onDeleteProject: () => void;
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

// Team Members List Component
function MembersList({
  members,
  onChange,
}: {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
}) {
  const [newUsername, setNewUsername] = useState('');

  const handleInvite = () => {
    if (!newUsername.trim()) return;
    
    const username = newUsername.trim().replace(/^@/, ''); // Remove @ if present
    
    // Check if already exists
    if (members.some(m => m.username.toLowerCase() === username.toLowerCase())) {
      return;
    }

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      username,
      status: 'invited',
      invitedAt: new Date().toISOString(),
    };

    onChange([...members, newMember]);
    setNewUsername('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInvite();
    }
  };

  const handleRemove = (memberId: string) => {
    onChange(members.filter(m => m.id !== memberId));
  };

  const handleResendInvite = (memberId: string) => {
    onChange(
      members.map(m => 
        m.id === memberId ? { ...m, invitedAt: new Date().toISOString() } : m
      )
    );
  };

  return (
    <div className="space-y-3">
      {members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center gap-3 bg-neutral-900 rounded-lg p-3"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                <AtSign className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">
                  @{member.username}
                </div>
                {member.status === 'active' && member.email ? (
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </div>
                ) : (
                  <div className="text-xs text-amber-500">Invited</div>
                )}
              </div>
              {member.status === 'invited' && (
                <button
                  onClick={() => handleResendInvite(member.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 text-neutral-300 rounded text-xs hover:bg-neutral-700 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Resend
                </button>
              )}
              <button
                onClick={() => handleRemove(member.id)}
                className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-neutral-900 rounded-lg">
          <Users className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-600">No team members yet</p>
        </div>
      )}

      {/* Invite Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="username"
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
          />
        </div>
        <button
          onClick={handleInvite}
          disabled={!newUsername.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Invite
        </button>
      </div>
    </div>
  );
}

export function ControlPanel({ settings, onUpdateSettings, onDeleteProject }: ControlPanelProps) {
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
      
      {/* ========== REPOSITORY SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Repository</h3>
              <p className="text-sm text-neutral-500">Source control & integration settings</p>
            </div>
          </div>
          {settings.repoProvider !== 'local' && settings.repoUrl && (
            <a
              href={settings.repoUrl}
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
            <label className="block text-sm text-neutral-400 mb-1.5">Provider</label>
            <select
              value={settings.repoProvider}
              onChange={(e) => handleChange('repoProvider', e.target.value as ProjectSettings['repoProvider'])}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700"
            >
              <option value="local">Local</option>
              <option value="github">GitHub</option>
              <option value="azure">Azure DevOps</option>
              <option value="gitlab">GitLab</option>
              <option value="bitbucket">Bitbucket</option>
            </select>
          </div>

          {settings.repoProvider !== 'local' && (
            <>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Repository URL</label>
                <input
                  type="text"
                  value={settings.repoUrl}
                  onChange={(e) => handleChange('repoUrl', e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Sync with Issues</span>
                  <Toggle
                    checked={settings.repoUseIssues}
                    onChange={(checked) => handleChange('repoUseIssues', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Create & Review PRs</span>
                  <Toggle
                    checked={settings.repoUsePRs}
                    onChange={(checked) => handleChange('repoUsePRs', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== AGENT SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Bot className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">AI Agent</h3>
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
        <div className="mb-4">
          <label className="block text-sm text-neutral-400 mb-2">Claude Skills</label>
          <SkillsList
            skills={settings.agentSkills}
            onChange={(skills) => handleChange('agentSkills', skills)}
          />
        </div>

        {/* Build Triggers */}
        <div className="pt-4 border-t border-neutral-800 space-y-3">
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


      {/* ========== SANDBOX SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Box className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Application Environment</h3>
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
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Snapshot
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
          >
            <History className="w-4 h-4" />
            Rollback
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

      

      {/* ========== PREVIEW SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Preview Settings</h3>
            <p className="text-sm text-neutral-500">Display defaults</p>
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
        </div>
      </div>

      {/* ========== MEMBERS SECTION ========== */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Team Members</h3>
            <p className="text-sm text-neutral-500">Manage project collaborators</p>
          </div>
        </div>

        <MembersList
          members={settings.teamMembers}
          onChange={(members) => handleChange('teamMembers', members)}
        />
      </div>

      {/* ========== DANGER ZONE ========== */}
      <div className="card p-5 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Danger Zone</h3>
            <p className="text-sm text-neutral-500">Irreversible actions</p>
          </div>
        </div>

        <p className="text-sm text-neutral-400 mb-4">
          Once you delete this project, there is no going back. All tasks, settings, and data will be permanently removed.
        </p>

        <button
          onClick={onDeleteProject}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </button>
      </div>
    </div>
  );
}
