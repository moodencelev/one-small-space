import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  Trash2,
  Download,
  Shield,
  Server,
  Sparkles,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AppSettings, DeclutterSession } from '../types';
import { sound } from '../utils/sound';
import {
  exportDataAsJson,
  deleteAllSavedData,
  loadAllSessions,
  saveSession,
} from '../utils/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onDataReset: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
}) => {
  const [serverStatus, setServerStatus] = useState<{
    ok: boolean;
    aiAvailable: boolean;
    model: string;
    message: string;
  } | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(true);

  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState<boolean>(false);
  const [showConfirmDeletePhotos, setShowConfirmDeletePhotos] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchServerStatus();
  }, []);

  const fetchServerStatus = async () => {
    setIsCheckingServer(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setServerStatus(data);
    } catch {
      setServerStatus({
        ok: false,
        aiAvailable: false,
        model: 'gemini-2.5-flash',
        message: 'Could not connect to server status endpoint.',
      });
    } finally {
      setIsCheckingServer(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestSound = () => {
    sound.playStepComplete(settings.soundVolume);
  };

  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') {
      showToast('Notifications are not supported in this browser.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        onUpdateSettings({ ...settings, remindersEnabled: true });
        new Notification('One Small Space', {
          body: 'Gentle reminder set! We will gently nudge you when it is time for a quiet 5-minute clearing.',
          icon: '/favicon.ico',
        });
        showToast('Notifications enabled successfully.');
      } else {
        onUpdateSettings({ ...settings, remindersEnabled: false });
        showToast('Notification permission was not granted.');
      }
    } catch (e) {
      showToast('Could not request notification permission.');
    }
  };

  const handleExportData = () => {
    const jsonString = exportDataAsJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-small-space-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported as JSON file.');
  };

  const handleDeleteAllPhotosOnly = () => {
    const sessions = loadAllSessions();
    sessions.forEach((s) => {
      delete s.photoBefore;
      delete s.photoAfter;
      saveSession(s);
    });
    setShowConfirmDeletePhotos(false);
    showToast('All before and after photos deleted from local storage.');
    onDataReset();
  };

  const handleDeleteAllDataConfirmed = () => {
    deleteAllSavedData();
    setShowConfirmDeleteAll(false);
    showToast('All application data completely erased.');
    onDataReset();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#223326] text-white text-xs font-medium shadow-lg animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#223326]">
          Settings & Privacy
        </h1>
        <p className="text-sm text-[#526455] mt-1">
          Control audio feedback, notifications, privacy consent, and data storage.
        </p>
      </div>

      {/* Integration Status Section */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-[#223326]">
                Integration & AI Status
              </h2>
              <p className="text-xs text-[#627366]">
                Server-side Gemini 2.5 Flash & storage health
              </p>
            </div>
          </div>
          <button
            onClick={fetchServerStatus}
            disabled={isCheckingServer}
            title="Refresh status"
            className="p-2 rounded-lg hover:bg-[#EAE6DE] text-[#556758] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingServer ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {serverStatus && (
          <div className="space-y-3">
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                serverStatus.aiAvailable
                  ? 'bg-[#EBF2EC] border-[#CADBCC] text-[#24422B]'
                  : 'bg-[#F9EFE9] border-[#E8D4C8] text-[#5D321F]'
              }`}
            >
              {serverStatus.aiAvailable ? (
                <Check className="w-4 h-4 text-[#2D5A37] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#A64B2A] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {serverStatus.aiAvailable
                    ? 'Gemini 3.8 Flash Server Integration: Active'
                    : 'Gemini API Key: Setup Needed for AI features'}
                </p>
                <p className="text-[11px] opacity-90">{serverStatus.message}</p>
              </div>
            </div>

            <div className="text-xs text-[#526455] bg-[#F5F2EB] p-3.5 rounded-2xl space-y-2 border border-[#E4DFD5]">
              <p className="font-semibold text-[#223326]">Required vs Optional Setup:</p>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Manual Checklists:</strong> Always ready offline. No API key needed.
                </li>
                <li>
                  <strong>AI Vision & Personalized Steps:</strong> Powered securely on the server via <code className="text-[#344639] bg-white px-1 py-0.5 rounded">GEMINI_API_KEY</code>.
                </li>
                <li>
                  <strong>Secrets Configuration:</strong> If needed, configure the <code className="text-[#344639] bg-white px-1 py-0.5 rounded">GEMINI_API_KEY</code> secret in the AI Studio Secrets panel. The server automatically detects it without exposing keys to the browser.
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Audio Chimes */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-[#223326]">
                Calm Audio Chimes
              </h2>
              <p className="text-xs text-[#627366]">
                Gentle singing bowl & bell chimes on completion
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#D7D2C8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D7D2C8] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#52796F]"></div>
          </label>
        </div>

        {settings.soundEnabled && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-[#526455]">
              <span>Chime Volume</span>
              <span>{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  soundVolume: parseFloat(e.target.value),
                })
              }
              className="w-full accent-[#52796F] cursor-pointer"
            />
            <button
              onClick={handleTestSound}
              className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE6DE] border border-[#DDD8CE] text-xs font-medium text-[#38493C] transition-colors"
            >
              Test Gentle Chime
            </button>
          </div>
        )}
      </section>

      {/* Tactile Haptic Vibration */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-[#223326]">
                Tactile Haptic Confirmation
              </h2>
              <p className="text-xs text-[#627366]">
                Subtle vibration on mobile when completing tasks or using the timer
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hapticFeedback}
              onChange={(e) =>
                onUpdateSettings({ ...settings, hapticFeedback: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#D7D2C8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D7D2C8] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#52796F]"></div>
          </label>
        </div>

        {settings.hapticFeedback && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-[#526455]">
              <span>Vibration API Hardware Support</span>
              <span className="font-semibold text-[#52796F]">
                {typeof navigator !== 'undefined' && 'vibrate' in navigator
                  ? 'Supported on this device'
                  : 'Desktop / Unvibrated'}
              </span>
            </div>
            <button
              onClick={() => {
                import('../utils/haptics').then(({ haptics }) => {
                  const didVibrate = haptics.vibrateTaskComplete(true);
                  if (didVibrate) {
                    showToast('Task complete vibration pulse triggered!');
                  } else {
                    showToast('Vibration triggered (supported on mobile touch devices).');
                  }
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EAE6DE] border border-[#DDD8CE] text-xs font-medium text-[#38493C] transition-colors"
            >
              Test Task Complete Vibration
            </button>
          </div>
        )}
      </section>

      {/* Gentle Reminders */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-[#223326]">
                Optional Gentle Reminders
              </h2>
              <p className="text-xs text-[#627366]">
                A quiet nudge to take 5 minutes when it suits you
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestNotification}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              notificationPermission === 'granted' && settings.remindersEnabled
                ? 'bg-[#EBF2EC] text-[#2D5A37] border border-[#CADBCC]'
                : 'bg-[#52796F] text-white hover:bg-[#43645B]'
            }`}
          >
            {notificationPermission === 'granted' && settings.remindersEnabled
              ? 'Enabled'
              : 'Enable'}
          </button>
        </div>

        {notificationPermission === 'granted' && settings.remindersEnabled && (
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[#526455] mb-1">Time of Day</label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, reminderTime: e.target.value })
                }
                className="w-full p-2 rounded-xl border border-[#D7D2C8] bg-white text-xs text-[#223326]"
              />
            </div>
            <div>
              <label className="block text-[#526455] mb-1">Frequency</label>
              <select
                value={settings.reminderFrequency}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    reminderFrequency: e.target.value as any,
                  })
                }
                className="w-full p-2 rounded-xl border border-[#D7D2C8] bg-white text-xs text-[#223326]"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends only</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Data Management & Deletion */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-[#223326]">
              Your Data & Deletion Controls
            </h2>
            <p className="text-xs text-[#627366]">
              You own all your records. Delete or export anytime.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleExportData}
            className="w-full p-3 rounded-2xl bg-[#F5F2EB] hover:bg-[#EFEAE0] border border-[#E3DDD1] text-xs font-medium text-[#223326] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#52796F]" />
              <span>Export all data as JSON</span>
            </div>
            <span className="text-[#708173]">Download</span>
          </button>

          <button
            onClick={() => setShowConfirmDeletePhotos(true)}
            className="w-full p-3 rounded-2xl bg-[#F5F2EB] hover:bg-[#EFEAE0] border border-[#E3DDD1] text-xs font-medium text-[#82542B] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#82542B]" />
              <span>Delete all before/after photos</span>
            </div>
            <span className="text-[#82542B]">Clear photos</span>
          </button>

          <button
            onClick={() => setShowConfirmDeleteAll(true)}
            className="w-full p-3 rounded-2xl bg-[#FAF0F0] hover:bg-[#F6E5E5] border border-[#EED0D0] text-xs font-medium text-red-700 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete all saved data completely</span>
            </div>
            <span className="text-red-700">Wipe data</span>
          </button>
        </div>
      </section>

      {/* Modal: Confirm Delete All Photos */}
      {showConfirmDeletePhotos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-[#E4DFD5] space-y-4">
            <h3 className="font-heading text-base font-semibold text-[#223326]">
              Delete all space photos?
            </h3>
            <p className="text-xs text-[#526455] leading-relaxed">
              This will remove all Before and After photos stored in your browser. Your session dates and statistics will be preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDeletePhotos(false)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#526455] hover:bg-[#EAE6DE]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllPhotosOnly}
                className="px-4 py-2 rounded-xl bg-[#82542B] hover:bg-[#6D421F] text-white text-xs font-medium"
              >
                Yes, delete photos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete All Data */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-red-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-heading text-base font-semibold text-red-900">
                Erase all saved data?
              </h3>
            </div>
            <p className="text-xs text-[#526455] leading-relaxed">
              This will permanently delete all your sessions, photos, settings, and sorted item history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#526455] hover:bg-[#EAE6DE]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllDataConfirmed}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
              >
                Yes, erase everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
