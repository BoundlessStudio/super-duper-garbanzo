import { useState } from 'react';
import { 
  Bot, 
  GitBranch, 
  Box,
  Pause,
  Play,
  RotateCcw,
  Settings,
  ExternalLink,
  Terminal,
  RefreshCw
} from 'lucide-react';
import type { ProjectSettings } from '../types';

interface ControlPanelProps {
  settings: ProjectSettings;
  onUpdateSettings: (updates: Partial<ProjectSettings>) => void;
}

export function ControlPanel({ settings, onUpdateSettings }: ControlPanelProps) {
  const [agentRunning, setAgentRunning] = useState(settings.agentEnabled);
  const [lastAction] = useState('Analyzing codebase for optimization opportunities...');

  const handleChange = (key: keyof ProjectSettings, value: unknown) => {
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Background Agent Section */}
      <div className="card p-5">
        {/* Header */}
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
            <span className={`w-2 h-2 rounded-full ${agentRunning ? 'bg-green-500' : 'bg-neutral-600'}`} />
            <span className={`text-sm ${agentRunning ? 'text-green-500' : 'text-neutral-500'}`}>
              {agentRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setAgentRunning(!agentRunning)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors"
          >
            {agentRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          <button className="p-1.5 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Last Action */}
        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 rounded-lg">
          <Terminal className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-500">Last action:</span>
          <span className="text-sm text-neutral-300">{lastAction}</span>
        </div>
      </div>

      {/* GitHub Repository Section */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">GitHub Repository</h3>
              <p className="text-sm text-neutral-500">
                {settings.githubRepo || 'customware/ecommerce-platform'}
              </p>
            </div>
          </div>
          <a
            href={settings.githubRepo ? `https://github.com/${settings.githubRepo}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-500 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Auto-sync changes</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.githubAutoSync}
                onChange={(e) => handleChange('githubAutoSync', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Auto-deploy on push</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.agentAutoRun}
                onChange={(e) => handleChange('agentAutoRun', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">PR reviews by agent</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.agentEnabled}
                onChange={(e) => handleChange('agentEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-700 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sandbox Environment Section */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Box className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Sandbox Environment</h3>
              <p className="text-sm text-neutral-500">Isolated development container</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-green-500">Active</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-neutral-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-white">2</div>
            <div className="text-sm text-neutral-500">vCPUs</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-white">4GB</div>
            <div className="text-sm text-neutral-500">Memory</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold text-white">10GB</div>
            <div className="text-sm text-neutral-500">Storage</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors">
            <Terminal className="w-4 h-4" />
            Open Terminal
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-neutral-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
