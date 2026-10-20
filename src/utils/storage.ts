import { AppSettings, DeclutterSession, SortedItem } from '../types';

const STORAGE_KEY_SESSIONS = 'oss_sessions_v1';
const STORAGE_KEY_SETTINGS = 'oss_settings_v1';
const STORAGE_KEY_ACTIVE_SESSION_ID = 'oss_active_session_id_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.6,
  hapticFeedback: true,
  remindersEnabled: false,
  reminderFrequency: 'daily',
  reminderTime: '18:30',
  aiPhotoConsentDefault: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadAllSessions(): DeclutterSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    const parsed: DeclutterSession[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSession(session: DeclutterSession): void {
  try {
    const sessions = loadAllSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: Date.now() };
    } else {
      sessions.unshift({ ...session, updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save session to localStorage', e);
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = loadAllSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    if (getActiveSessionId() === sessionId) {
      clearActiveSessionId();
    }
  } catch (e) {
    console.error('Failed to delete session', e);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION_ID);
  } catch {
    return null;
  }
}

export function setActiveSessionId(sessionId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION_ID, sessionId);
  } catch (e) {
    console.error('Failed to set active session ID', e);
  }
}

export function clearActiveSessionId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION_ID);
  } catch (e) {
    console.error('Failed to clear active session ID', e);
  }
}

export function removePhotoFromSession(sessionId: string, photoType: 'before' | 'after'): void {
  const sessions = loadAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    if (photoType === 'before') delete session.photoBefore;
    if (photoType === 'after') delete session.photoAfter;
    session.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }
}

export function deleteAllSavedData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION_ID);
  } catch (e) {
    console.error('Failed to clear all data', e);
  }
}

export function exportDataAsJson(): string {
  const data = {
    appName: 'One Small Space',
    exportedAt: new Date().toISOString(),
    sessions: loadAllSessions(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function calculateStats(sessions: DeclutterSession[]): {
  totalSessionsCompleted: number;
  totalMinutesSpent: number;
  totalStepsCompleted: number;
  totalItemsSorted: number;
  sortedByCategory: Record<string, number>;
} {
  let totalSessionsCompleted = 0;
  let totalSecondsSpent = 0;
  let totalStepsCompleted = 0;
  let totalItemsSorted = 0;
  const sortedByCategory: Record<string, number> = {
    keep: 0,
    donate: 0,
    recycle: 0,
    discard: 0,
    decide_later: 0,
  };

  sessions.forEach((s) => {
    if (s.status === 'completed') {
      totalSessionsCompleted++;
    }
    totalSecondsSpent += s.totalTimeSpentSeconds || 0;
    const completedInSession = s.steps.filter((st) => st.completed).length;
    totalStepsCompleted += completedInSession;

    if (Array.isArray(s.sortedItems)) {
      s.sortedItems.forEach((item) => {
        totalItemsSorted++;
        if (sortedByCategory[item.category] !== undefined) {
          sortedByCategory[item.category]++;
        }
      });
    }
  });

  return {
    totalSessionsCompleted,
    totalMinutesSpent: Math.round(totalSecondsSpent / 60),
    totalStepsCompleted,
    totalItemsSorted,
    sortedByCategory,
  };
}
