import { useState, useCallback } from 'react';
import { Video, Phone, ExternalLink, Eye } from 'lucide-react';
import type { ProjectSettings } from '../db/schema';

// Generate a stable room ID using crypto
const generateRoomId = () => crypto.randomUUID().slice(0, 8);

interface Conversation {
  id: string;
  type: 'Meeting';
  started: string;
  ended: string | null;
  userId: string;
}

interface MeetingEmbedProps {
  settings: ProjectSettings;
  onUpdateSettings: (updates: Partial<ProjectSettings>) => void;
}

export function MeetingEmbed({ settings, onUpdateSettings }: MeetingEmbedProps) {
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      type: 'Meeting',
      started: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ended: null,
      userId: `vitest-user|${crypto.randomUUID().slice(0, 32)}`,
    }
  ]);

  const getMeetingUrl = useCallback(() => {
    if (!settings.meetingUrl) {
      // Generate a random room name if none set
      const roomName = `customware-${generateRoomId()}`;
      onUpdateSettings({ meetingUrl: roomName });
      return `https://meet.jit.si/${roomName}`;
    }
    
    if (settings.meetingProvider === 'jitsi' && !settings.meetingUrl.includes('://')) {
      return `https://meet.jit.si/${settings.meetingUrl}`;
    }
    return settings.meetingUrl;
  }, [settings.meetingUrl, settings.meetingProvider, onUpdateSettings]);

  const handleStartMeeting = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      type: 'Meeting',
      started: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ended: null,
      userId: `vitest-user|${crypto.randomUUID().slice(0, 32)}`,
    };
    setConversations([newConversation, ...conversations]);
    setIsInMeeting(true);
  };

  const handleEndMeeting = () => {
    setConversations(convs => 
      convs.map((c, i) => 
        i === 0 && !c.ended 
          ? { ...c, ended: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          : c
      )
    );
    setIsInMeeting(false);
  };

  return (
    <div>
      {/* Meeting Area */}
      <div className="card overflow-hidden mb-8">
        {isInMeeting ? (
          <>
            {/* Active Meeting */}
            <div className="relative">
              <iframe
                src={getMeetingUrl()}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-[500px] bg-black"
                title="Meeting Room"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={handleEndMeeting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 rotate-[135deg]" />
                  End Meeting
                </button>
                <a
                  href={getMeetingUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Tab
                </a>
              </div>
            </div>
          </>
        ) : (
          /* Placeholder State */
          <div className="flex flex-col items-center justify-center py-32 bg-neutral-950">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
              <Video className="w-7 h-7 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Virtual Meeting Room</h3>
            <p className="text-neutral-500 mb-6">Connect with your consult any time</p>
            <button
              onClick={handleStartMeeting}
              className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Start Meeting
            </button>
          </div>
        )}
      </div>

      {/* Conversations History */}
      <div>
        <h3 className="text-white font-medium mb-4">Conversations</h3>
        
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-neutral-800 text-sm text-neutral-500">
            <div>Type</div>
            <div>Started</div>
            <div>Ended</div>
            <div>User ID</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-600">
              No conversations yet
            </div>
          ) : (
            <div>
              {conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-neutral-800 last:border-b-0 text-sm items-center"
                >
                  <div>
                    <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs">
                      {conv.type}
                    </span>
                  </div>
                  <div className="text-neutral-400">{conv.started}</div>
                  <div className={conv.ended ? 'text-neutral-400' : 'text-green-500'}>
                    {conv.ended || 'In progress'}
                  </div>
                  <div className="text-neutral-500 font-mono text-xs truncate">
                    {conv.userId}
                  </div>
                  <div className="text-right">
                    <button className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm">
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
