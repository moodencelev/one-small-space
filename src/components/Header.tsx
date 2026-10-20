import React from 'react';
import { Sparkles, Play, Pause } from 'lucide-react';
import { DeclutterSession } from '../types';

interface HeaderProps {
  activeSession: DeclutterSession | null;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onToggleActiveSessionPause?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSession,
  currentScreen,
  onNavigate,
  onToggleActiveSessionPause,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E4DC] px-4 md:px-8 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-85"
        >
          <div className="w-8 h-8 rounded-xl bg-[#52796F] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-[#223326] whitespace-nowrap">
            One Small Space
          </span>
        </button>

        {/* Zone 2: Navigation Links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4D6052]">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#223326] ${
              currentScreen === 'home' ? 'text-[#223326] font-semibold' : ''
            }`}
          >
            Start
          </button>
          <button
            onClick={() => onNavigate('spaces')}
            className={`whitespace-nowrap transition-colors hover:text-[#223326] ${
              currentScreen === 'spaces' ? 'text-[#223326] font-semibold' : ''
            }`}
          >
            My Spaces
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`whitespace-nowrap transition-colors hover:text-[#223326] ${
              currentScreen === 'progress' ? 'text-[#223326] font-semibold' : ''
            }`}
          >
            Gentle Progress
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`whitespace-nowrap transition-colors hover:text-[#223326] ${
              currentScreen === 'settings' ? 'text-[#223326] font-semibold' : ''
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Active Session Quick Control or Action */}
        <div className="flex items-center gap-2 shrink-0">
          {activeSession && activeSession.status === 'active' ? (
            <button
              onClick={() => onNavigate('session')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-[#52796F] hover:bg-[#43645B] rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#A3C9A8] animate-pulse" />
              <span>In Session ({Math.ceil(activeSession.remainingSeconds / 60)}m left)</span>
            </button>
          ) : activeSession && activeSession.status === 'paused' ? (
            <button
              onClick={() => onNavigate('session')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4D6052] bg-[#EAE6DE] hover:bg-[#DDD8CE] rounded-lg transition-colors whitespace-nowrap"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Resume ({Math.ceil(activeSession.remainingSeconds / 60)}m)</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="px-3.5 py-1.5 text-xs font-medium text-[#223326] bg-[#E9E5DD] hover:bg-[#DDD8CE] rounded-lg transition-colors whitespace-nowrap"
            >
              New Space
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
