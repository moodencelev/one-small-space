import React from 'react';
import { Sparkles, Timer, Layers, Heart, Settings } from 'lucide-react';
import { DeclutterSession } from '../types';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  activeSession: DeclutterSession | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  activeSession,
}) => {
  const isSessionRunning = activeSession?.status === 'active';
  const hasActiveSession = Boolean(activeSession && (activeSession.status === 'active' || activeSession.status === 'paused'));

  return (
    <nav
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8E4DC] pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentScreen === 'home' ? 'text-[#52796F] font-semibold' : 'text-[#6C7D70] hover:text-[#223326]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Start</span>
        </button>

        {/* Tab 2: Session */}
        <button
          onClick={() => onNavigate('session')}
          className={`relative min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentScreen === 'session' ? 'text-[#52796F] font-semibold' : 'text-[#6C7D70] hover:text-[#223326]'
          }`}
        >
          <div className="relative">
            <Timer className="w-5 h-5" />
            {isSessionRunning && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#52796F] ring-2 ring-[#FAF7F2] animate-pulse" />
            )}
            {!isSessionRunning && hasActiveSession && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C68B59] ring-2 ring-[#FAF7F2]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">
            {hasActiveSession ? 'Session' : 'Focus'}
          </span>
        </button>

        {/* Tab 3: My Spaces */}
        <button
          onClick={() => onNavigate('spaces')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentScreen === 'spaces' ? 'text-[#52796F] font-semibold' : 'text-[#6C7D70] hover:text-[#223326]'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Spaces</span>
        </button>

        {/* Tab 4: Progress */}
        <button
          onClick={() => onNavigate('progress')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentScreen === 'progress' ? 'text-[#52796F] font-semibold' : 'text-[#6C7D70] hover:text-[#223326]'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Calm</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          onClick={() => onNavigate('settings')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            currentScreen === 'settings' ? 'text-[#52796F] font-semibold' : 'text-[#6C7D70] hover:text-[#223326]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
