import { useState } from 'react';
import { 
  Monitor, 
  RefreshCw, 
  ExternalLink,
  Smartphone,
  Tablet,
  Play,
  Pause,
  Camera,
  History,
  Upload,
  Copy
} from 'lucide-react';
import type { ProjectSettings } from '../db/schema';

interface ApplicationPreviewProps {
  previewUrl: string;
  settings: ProjectSettings;
  isRunning: boolean;
  publishedAt?: string;
  onUpdatePreviewUrl: (url: string) => void;
  onToggleRunning: () => void;
  onToggleEnvironment: () => void;
  onPublish: () => void;
}

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

export function ApplicationPreview({ 
  previewUrl, 
  settings,
  isRunning,
  publishedAt,
  onUpdatePreviewUrl,
  onToggleRunning,
  onToggleEnvironment,
  onPublish,
}: ApplicationPreviewProps) {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>(settings.previewDefaultDevice || 'desktop');
  const [localUrl, setLocalUrl] = useState(previewUrl || '');
  const [refreshKey, setRefreshKey] = useState(0);

  const displayUrl = previewUrl;

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

  const isDevelopment = settings.activeEnvironment === 'development';
  const hasPublished = !!publishedAt;

  return (
    <div>
      {/* Top Toolbar */}
      <div className="flex items-center gap-3 mb-4 justify-between">
        {/* Environment Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleEnvironment}
            disabled={!hasPublished}
            className={`relative w-11 h-6 bg-neutral-700 rounded-full transition-colors ${
              hasPublished ? 'hover:bg-neutral-600 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
            title={hasPublished ? undefined : 'Publish to production first to enable environment toggle'}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                isDevelopment 
                  ? 'left-1 bg-amber-500' 
                  : 'left-6 bg-green-500'
              }`}
            />
          </button>
          <span className={`text-sm ${isDevelopment ? 'text-amber-400' : 'text-green-400'} ${!hasPublished ? 'opacity-50' : ''}`}>
            {isDevelopment ? 'Development' : 'Production'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRunning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 transition-colors"
            title={isRunning ? 'Stop' : 'Start'}
          >
            {isRunning ? (
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 transition-colors"
            title="Snapshot"
          >
            <Camera className="w-4 h-4" />
            Snapshot
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 transition-colors"
            title="Rollback"
          >
            <History className="w-4 h-4" />
            Rollback
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-800 mx-1" />

          {/* Publish/Copy Button */}
          {isDevelopment ? (
            <button
              onClick={onPublish}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
              title="Publish to Production"
            >
              <Upload className="w-4 h-4" />
              Publish
            </button>
          ) : (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600 transition-colors"
              title="Copy URL"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          )}
        </div>
      </div>

      {/* Browser Frame */}
      <div className="card overflow-hidden">
        {/* Browser Chrome */}
        <div className="flex items-center px-4 py-3 bg-neutral-900 border-b border-neutral-800 gap-3">
          {/* Device Size Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDeviceSize('desktop')}
              className={`p-1.5 rounded transition-colors ${
                deviceSize === 'desktop' 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceSize('tablet')}
              className={`p-1.5 rounded transition-colors ${
                deviceSize === 'tablet' 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Tablet"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceSize('mobile')}
              className={`p-1.5 rounded transition-colors ${
                deviceSize === 'mobile' 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* URL Input */}
          <form onSubmit={handleUrlSubmit} className="flex-1">
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/preview"
              className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </form>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={displayUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded transition-colors ${
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
