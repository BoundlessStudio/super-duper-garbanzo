import { useState } from 'react';
import { 
  Monitor, 
  RefreshCw, 
  ExternalLink,
  Smartphone,
  Tablet
} from 'lucide-react';
import type { ProjectSettings } from '../db/schema';

interface ApplicationPreviewProps {
  previewUrl: string;
  settings: ProjectSettings;
  onUpdatePreviewUrl: (url: string) => void;
  onUpdateSettings: (updates: Partial<ProjectSettings>) => void;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

export function ApplicationPreview({ 
  previewUrl, 
  settings, 
  onUpdatePreviewUrl,
}: ApplicationPreviewProps) {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [localUrl, setLocalUrl] = useState(previewUrl || settings.sandboxUrl || '');
  const [refreshKey, setRefreshKey] = useState(0);

  const displayUrl = previewUrl || settings.sandboxUrl;

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localUrl.trim()) {
      onUpdatePreviewUrl(localUrl.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (localUrl.trim()) {
        onUpdatePreviewUrl(localUrl.trim());
      }
    }
  };

  return (
    <div>
      {/* Top Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        {/* URL Input */}
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <input
            type="text"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/preview"
            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={displayUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-lg transition-colors ${
              displayUrl 
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' 
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Open in new tab"
            onClick={(e) => !displayUrl && e.preventDefault()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-800" />

        {/* Device Size Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeviceSize('desktop')}
            className={`p-2.5 rounded-lg transition-colors ${
              deviceSize === 'desktop' 
                ? 'bg-neutral-800 text-white' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceSize('tablet')}
            className={`p-2.5 rounded-lg transition-colors ${
              deviceSize === 'tablet' 
                ? 'bg-neutral-800 text-white' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceSize('mobile')}
            className={`p-2.5 rounded-lg transition-colors ${
              deviceSize === 'mobile' 
                ? 'bg-neutral-800 text-white' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Frame */}
      <div className="card overflow-hidden">
        {/* Browser Chrome */}
        <div className="flex items-center px-4 py-3 bg-neutral-900 border-b border-neutral-800">
          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          
          {/* URL Bar */}
          <div className="flex-1 flex justify-center">
            <span className="text-sm text-neutral-500">
              {displayUrl || 'https://example.com/preview'}
            </span>
          </div>
          
          {/* Spacer for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* Content Area */}
        <div className="bg-neutral-950 min-h-[500px] flex items-center justify-center">
          {displayUrl ? (
            <div className={`${getDeviceWidth()} w-full h-[500px] mx-auto transition-all duration-300`}>
              <iframe
                key={refreshKey}
                src={displayUrl}
                className="w-full h-full bg-white"
                title="Application Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          ) : (
            <div className="text-center">
              <Monitor className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
              <h3 className="text-neutral-400 font-medium mb-1">Application Preview</h3>
              <p className="text-sm text-neutral-600">Connect your preview URL to see live updates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
