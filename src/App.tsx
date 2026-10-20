import React, { useState, useEffect } from 'react';
import { DeclutterSession, AppSettings, EnergyLevel, SessionDuration } from './types';
import {
  loadSettings,
  saveSettings,
  loadAllSessions,
  saveSession,
  deleteSession,
  getActiveSessionId,
  setActiveSessionId,
  clearActiveSessionId,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { IntakeScreen } from './screens/IntakeScreen';
import { SessionScreen } from './screens/SessionScreen';
import { SessionCompleteScreen } from './screens/SessionCompleteScreen';
import { MySpacesScreen } from './screens/MySpacesScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [allSessions, setAllSessions] = useState<DeclutterSession[]>(loadAllSessions);
  const [activeSession, setActiveSession] = useState<DeclutterSession | null>(null);

  // Staged session config from Step 1 before Intake
  const [sessionConfig, setSessionConfig] = useState<{
    room: string;
    customRoomName?: string;
    energy: EnergyLevel;
    duration: SessionDuration;
  }>({
    room: 'nightstand',
    energy: 'low',
    duration: 5,
  });

  // Load existing active or paused session on mount
  useEffect(() => {
    const activeId = getActiveSessionId();
    if (activeId) {
      const match = allSessions.find((s) => s.id === activeId);
      if (match && match.status !== 'completed' && match.status !== 'abandoned') {
        setActiveSession(match);
      }
    }
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleStartSessionSetup = (config: {
    room: string;
    customRoomName?: string;
    energy: EnergyLevel;
    duration: SessionDuration;
  }) => {
    setSessionConfig(config);
    setCurrentScreen('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSessionReady = (session: DeclutterSession) => {
    setActiveSession(session);
    setActiveSessionId(session.id);
    saveSession(session);
    setAllSessions(loadAllSessions());
    setCurrentScreen('session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSession = (updated: DeclutterSession) => {
    setActiveSession(updated);
    saveSession(updated);
    setAllSessions(loadAllSessions());
  };

  const handleCompleteSession = (completed: DeclutterSession) => {
    setActiveSession(completed);
    saveSession(completed);
    setAllSessions(loadAllSessions());
    setCurrentScreen('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndFinish = (finalSession: DeclutterSession) => {
    saveSession(finalSession);
    clearActiveSessionId();
    setActiveSession(null);
    setAllSessions(loadAllSessions());
    setCurrentScreen('spaces');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeSession = (sessionToResume?: DeclutterSession) => {
    const target = sessionToResume || activeSession;
    if (target) {
      setActiveSession(target);
      setActiveSessionId(target.id);
      setCurrentScreen('session');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDismissActiveSession = () => {
    clearActiveSessionId();
    setActiveSession(null);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (activeSession?.id === id) {
      setActiveSession(null);
    }
    setAllSessions(loadAllSessions());
  };

  const handleRefreshSessions = () => {
    setAllSessions(loadAllSessions());
  };

  const handleDataReset = () => {
    setSettings(loadSettings());
    setAllSessions(loadAllSessions());
    setActiveSession(null);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#243329] flex flex-col font-sans selection:bg-[#D7E3D4] selection:text-[#18261D]">
      {/* Top Bar Contract */}
      <Header
        activeSession={activeSession}
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Responsive Viewport Canvas */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-5 md:py-8 pb-24 md:pb-12">
        {currentScreen === 'home' && (
          <HomeScreen
            onStartSessionSetup={handleStartSessionSetup}
            activeSession={activeSession}
            onResumeSession={() => handleResumeSession()}
            onDismissActiveSession={handleDismissActiveSession}
          />
        )}

        {currentScreen === 'intake' && (
          <IntakeScreen
            sessionConfig={sessionConfig}
            onBack={() => setCurrentScreen('home')}
            onSessionReady={handleSessionReady}
            defaultConsent={settings.aiPhotoConsentDefault}
          />
        )}

        {currentScreen === 'session' && activeSession && (
          <SessionScreen
            session={activeSession}
            onUpdateSession={handleUpdateSession}
            onCompleteSession={handleCompleteSession}
            onAbandonSession={() => {
              clearActiveSessionId();
              setActiveSession(null);
              setCurrentScreen('home');
            }}
            soundEnabled={settings.soundEnabled}
            soundVolume={settings.soundVolume}
            hapticFeedback={settings.hapticFeedback}
          />
        )}

        {currentScreen === 'session' && !activeSession && (
          <div className="p-8 rounded-3xl bg-white border border-[#E4DFD5] text-center space-y-3">
            <h2 className="font-heading text-lg font-bold text-[#223326]">
              No session in progress
            </h2>
            <p className="text-xs text-[#526455]">
              Choose a room and timer to start your next peaceful clearing.
            </p>
            <button
              onClick={() => setCurrentScreen('home')}
              className="px-5 py-2.5 rounded-xl bg-[#52796F] text-white text-xs font-medium"
            >
              Start New Space
            </button>
          </div>
        )}

        {currentScreen === 'complete' && activeSession && (
          <SessionCompleteScreen
            session={activeSession}
            onSaveAndFinish={handleSaveAndFinish}
            onNavigateHome={() => {
              clearActiveSessionId();
              setActiveSession(null);
              setCurrentScreen('home');
            }}
          />
        )}

        {currentScreen === 'spaces' && (
          <MySpacesScreen
            sessions={allSessions}
            onResumeSession={(s) => handleResumeSession(s)}
            onDeleteSession={handleDeleteSession}
            onRefreshSessions={handleRefreshSessions}
            onStartNew={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressScreen
            sessions={allSessions}
            onStartNew={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataReset={handleDataReset}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar for Mobile Ergonomics */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeSession={activeSession}
      />
    </div>
  );
}
