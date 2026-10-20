import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  X,
  AlertCircle,
  RefreshCw,
  ListChecks,
} from 'lucide-react';
import { DeclutterSession, EnergyLevel, SessionDuration } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { PrivacyConsentModal } from '../components/PrivacyConsentModal';
import { getManualChecklist } from '../data/manualChecklists';

interface IntakeScreenProps {
  sessionConfig: {
    room: string;
    customRoomName?: string;
    energy: EnergyLevel;
    duration: SessionDuration;
  };
  onBack: () => void;
  onSessionReady: (session: DeclutterSession) => void;
  defaultConsent: boolean;
}

export const IntakeScreen: React.FC<IntakeScreenProps> = ({
  sessionConfig,
  onBack,
  onSessionReady,
  defaultConsent,
}) => {
  const [tab, setTab] = useState<'photo' | 'description' | 'manual'>('photo');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [descriptionText, setDescriptionText] = useState<string>('');
  const [hasConsented, setHasConsented] = useState<boolean>(defaultConsent);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{ message: string; canFallback: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const roomDisplayName = sessionConfig.customRoomName || sessionConfig.room.replace('_', ' ');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setErrorState(null);
      const compressed = await compressImage(file, 1200, 0.8);
      setPhotoDataUrl(compressed);
    } catch (err: any) {
      setErrorState({
        message: 'Could not process that image. You can try another photo or describe the space in words.',
        canFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAnalysis = () => {
    if (tab === 'photo' && photoDataUrl && !hasConsented) {
      setShowConsentModal(true);
      return;
    }
    executeAnalysis();
  };

  const executeAnalysis = async () => {
    setIsLoading(true);
    setErrorState(null);

    const sessionId = `session_${Date.now()}`;

    // If manual checklist chosen directly
    if (tab === 'manual') {
      const manual = getManualChecklist(sessionConfig.room, sessionConfig.energy, sessionConfig.duration);
      const session: DeclutterSession = {
        id: sessionId,
        room: sessionConfig.room,
        customRoomName: sessionConfig.customRoomName,
        energy: sessionConfig.energy,
        durationMinutes: sessionConfig.duration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
        inputType: 'manual',
        userConsentedToAi: false,
        microAreaTitle: manual.microAreaTitle,
        warmInsight: manual.warmInsight,
        steps: manual.steps,
        currentStepIndex: 0,
        remainingSeconds: sessionConfig.duration * 60,
        totalTimeSpentSeconds: 0,
        isTimerRunning: true,
        sortedItems: [],
        suggestedNextStep: manual.suggestedNextStep,
        isAiGenerated: false,
      };
      onSessionReady(session);
      return;
    }

    try {
      const response = await fetch('/api/analyze-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: tab === 'photo' ? photoDataUrl : undefined,
          description: tab === 'description' ? descriptionText : undefined,
          room: sessionConfig.customRoomName || sessionConfig.room,
          energy: sessionConfig.energy,
          durationMinutes: sessionConfig.duration,
          userConsentedToAi: hasConsented,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'AI service unavailable');
      }

      const data = await response.json();

      const session: DeclutterSession = {
        id: sessionId,
        room: sessionConfig.room,
        customRoomName: sessionConfig.customRoomName,
        energy: sessionConfig.energy,
        durationMinutes: sessionConfig.duration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
        inputType: tab === 'photo' ? 'photo' : 'description',
        photoBefore: tab === 'photo' && photoDataUrl ? photoDataUrl : undefined,
        description: tab === 'description' ? descriptionText : undefined,
        userConsentedToAi: hasConsented,
        microAreaTitle: data.microAreaTitle || 'One Calm Surface',
        warmInsight: data.warmInsight || 'Every small space you clear creates a little more breathing room.',
        steps: data.steps || [],
        currentStepIndex: 0,
        clarifyingPrompt: data.clarifyingPrompt || undefined,
        remainingSeconds: sessionConfig.duration * 60,
        totalTimeSpentSeconds: 0,
        isTimerRunning: true,
        sortedItems: [],
        suggestedNextStep: data.suggestedNextStep,
        isAiGenerated: true,
      };

      onSessionReady(session);
    } catch (err: any) {
      console.warn('AI analysis failed; offering honest manual fallback:', err);
      setErrorState({
        message:
          'AI analysis is currently unavailable (API key not configured or connection issue). We never fake analysis — would you like to use our curated gentle manual checklist for this room?',
        canFallback: true,
      });
      setIsLoading(false);
    }
  };

  const handleUseFallbackManual = () => {
    const sessionId = `session_${Date.now()}`;
    const manual = getManualChecklist(sessionConfig.room, sessionConfig.energy, sessionConfig.duration);
    const session: DeclutterSession = {
      id: sessionId,
      room: sessionConfig.room,
      customRoomName: sessionConfig.customRoomName,
      energy: sessionConfig.energy,
      durationMinutes: sessionConfig.duration,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      inputType: 'manual',
      photoBefore: photoDataUrl || undefined,
      description: descriptionText || undefined,
      userConsentedToAi: false,
      microAreaTitle: manual.microAreaTitle,
      warmInsight: manual.warmInsight,
      steps: manual.steps,
      currentStepIndex: 0,
      remainingSeconds: sessionConfig.duration * 60,
      totalTimeSpentSeconds: 0,
      isTimerRunning: true,
      sortedItems: [],
      suggestedNextStep: manual.suggestedNextStep,
      isAiGenerated: false,
    };
    onSessionReady(session);
  };

  return (
    <div className="space-y-6">
      {/* Back & Context */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-[#4D6052] hover:text-[#223326] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change room or timer</span>
        </button>
        <span className="text-xs text-[#627366] capitalize">
          {roomDisplayName} · {sessionConfig.duration} min · {sessionConfig.energy} energy
        </span>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#223326]">
          Show or describe your space
        </h1>
        <p className="text-sm text-[#526455] mt-1 leading-relaxed">
          AI will look for just <em>one single micro-surface</em> so you never feel overloaded.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-3 p-1 bg-[#EAE6DE] rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => { setTab('photo'); setErrorState(null); }}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'photo' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#566859] hover:text-[#223326]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Photo</span>
        </button>
        <button
          type="button"
          onClick={() => { setTab('description'); setErrorState(null); }}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'description' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#566859] hover:text-[#223326]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Describe</span>
        </button>
        <button
          type="button"
          onClick={() => { setTab('manual'); setErrorState(null); }}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'manual' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#566859] hover:text-[#223326]'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5 text-[#52796F]" />
          <span>Manual</span>
        </button>
      </div>

      {/* Error / Offline Alert */}
      {errorState && (
        <div className="p-4 rounded-2xl bg-[#F8EFEA] border border-[#E9D6CA] space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#A64B2A] shrink-0 mt-0.5" />
            <p className="text-xs text-[#5D301E] leading-relaxed">
              {errorState.message}
            </p>
          </div>
          {errorState.canFallback && (
            <button
              onClick={handleUseFallbackManual}
              className="w-full h-11 rounded-xl bg-[#52796F] hover:bg-[#43645B] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ListChecks className="w-4 h-4" />
              <span>Continue with Curated Manual Steps</span>
            </button>
          )}
        </div>
      )}

      {/* Tab 1: Photo Intake */}
      {tab === 'photo' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {!photoDataUrl ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="h-36 rounded-2xl border-2 border-dashed border-[#D5CEC2] hover:border-[#52796F] bg-[#F5F2EB] flex flex-col items-center justify-center gap-2 p-4 text-center transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAE5DC] group-hover:bg-[#EBF1EC] text-[#52796F] flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-[#223326]">Take Photo</p>
                  <p className="text-[11px] text-[#637567]">Snap right now with camera</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-36 rounded-2xl border-2 border-dashed border-[#D5CEC2] hover:border-[#52796F] bg-[#F5F2EB] flex flex-col items-center justify-center gap-2 p-4 text-center transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAE5DC] group-hover:bg-[#EBF1EC] text-[#52796F] flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-[#223326]">Upload from Library</p>
                  <p className="text-[11px] text-[#637567]">Select an existing image</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-[#D5CEC2] bg-[#EAE5DC]">
              <img
                src={photoDataUrl}
                alt="Selected space"
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setPhotoDataUrl(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-xs">
                Photo ready for analysis
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-[#EBF1EC] border border-[#CADCCC] flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#52796F] shrink-0 mt-0.5" />
              <p className="text-[#36493A]">
                <strong>Privacy Guaranteed:</strong> Your photo is only processed to locate small micro-steps. It is stored on your device and never used for public AI training.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowConsentModal(true)}
              className="text-[#52796F] font-semibold underline shrink-0 hover:text-[#43645B]"
            >
              Details
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Text Description Intake */}
      {tab === 'description' && (
        <div className="space-y-3">
          <label htmlFor="space-description-input" className="block text-xs font-medium text-[#4D6052]">
            Describe what you see in 1 or 2 calm sentences:
          </label>
          <textarea
            id="space-description-input"
            rows={4}
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            placeholder="e.g. There are 3 coffee cups from this week, a stack of junk mail, some charging cables, and dust around the lamp base."
            className="w-full p-3.5 rounded-2xl border border-[#D7D2C8] bg-white text-sm text-[#223326] placeholder-[#8C9C8F] focus:outline-none focus:ring-2 focus:ring-[#52796F]/40 leading-relaxed"
          />
          <p className="text-xs text-[#637567] italic">
            Tip: You don't have to list everything. Even "a pile of paper and 2 glasses" is plenty.
          </p>
        </div>
      )}

      {/* Tab 3: Curated Manual Checklist */}
      {tab === 'manual' && (
        <div className="p-5 rounded-2xl bg-[#F5F2EB] border border-[#E3DDD1] space-y-3">
          <div className="flex items-center gap-2 text-[#52796F]">
            <ListChecks className="w-5 h-5" />
            <h3 className="font-semibold text-sm text-[#223326]">
              Curated Manual Checklist ({sessionConfig.duration} min)
            </h3>
          </div>
          <p className="text-xs text-[#526455] leading-relaxed">
            Prefer not to use AI at all? No problem. We will guide you through an ultra-gentle, proven {sessionConfig.duration}-minute micro-checklist designed specifically for the {roomDisplayName}.
          </p>
          <ul className="text-xs text-[#3E5042] space-y-1.5 list-disc list-inside">
            <li>Zero battery or network strain</li>
            <li>No data sent anywhere</li>
            <li>One clear action at a time with a pausable timer</li>
          </ul>
        </div>
      )}

      {/* Submit Action */}
      <div className="pt-2">
        <button
          onClick={handleStartAnalysis}
          disabled={
            isLoading ||
            (tab === 'photo' && !photoDataUrl) ||
            (tab === 'description' && !descriptionText.trim())
          }
          className="w-full h-14 rounded-2xl bg-[#52796F] hover:bg-[#43645B] disabled:opacity-45 text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#52796F]/15 active:scale-[0.99] transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Gently finding one small spot...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>
                {tab === 'manual'
                  ? 'Start Manual Session'
                  : 'Find My One Small Space'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Modal */}
      <PrivacyConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConfirmConsent={() => {
          setHasConsented(true);
          setShowConsentModal(false);
          executeAnalysis();
        }}
        onChooseDescriptionOnly={() => {
          setShowConsentModal(false);
          setTab('description');
        }}
        onChooseManualChecklist={() => {
          setShowConsentModal(false);
          setTab('manual');
        }}
      />
    </div>
  );
};
