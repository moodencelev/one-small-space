import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Plus,
  Check,
  SkipForward,
  Minimize2,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  Flag,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { DeclutterSession, MicroStep, SortedItem } from '../types';
import { sound } from '../utils/sound';
import { haptics } from '../utils/haptics';
import { SortingHelperModal } from '../components/SortingHelperModal';

interface SessionScreenProps {
  session: DeclutterSession;
  onUpdateSession: (updated: DeclutterSession) => void;
  onCompleteSession: (completedSession: DeclutterSession) => void;
  onAbandonSession: () => void;
  soundEnabled: boolean;
  soundVolume: number;
  hapticFeedback?: boolean;
}

export const SessionScreen: React.FC<SessionScreenProps> = ({
  session,
  onUpdateSession,
  onCompleteSession,
  onAbandonSession,
  soundEnabled,
  soundVolume,
  hapticFeedback = true,
}) => {
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(session.isTimerRunning);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(session.remainingSeconds);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(session.totalTimeSpentSeconds || 0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(session.currentStepIndex || 0);
  const [steps, setSteps] = useState<MicroStep[]>(session.steps || []);
  const [sortedItems, setSortedItems] = useState<SortedItem[]>(session.sortedItems || []);
  const [clarificationAnswer, setClarificationAnswer] = useState<string | undefined>(session.clarificationAnswer);
  
  const [isSortingModalOpen, setIsSortingModalOpen] = useState<boolean>(false);
  const [isSimplifyingStep, setIsSimplifyingStep] = useState<boolean>(false);

  // Timer interval reference
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Timer expired: sound + tactile feedback
            if (soundEnabled) {
              sound.playSessionComplete(soundVolume);
            }
            haptics.vibrateTimerExpire(hapticFeedback);
            return 0;
          }
          return prev - 1;
        });

        setTotalTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, soundEnabled, soundVolume, hapticFeedback]);

  // Sync back to storage on major state updates
  useEffect(() => {
    onUpdateSession({
      ...session,
      steps,
      currentStepIndex,
      remainingSeconds,
      totalTimeSpentSeconds: totalTimeSpent,
      isTimerRunning,
      sortedItems,
      clarificationAnswer,
      status: remainingSeconds === 0 ? 'completed' : 'active',
    });
  }, [remainingSeconds, currentStepIndex, steps, isTimerRunning, sortedItems, clarificationAnswer]);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex >= steps.length - 1;
  const completedCount = steps.filter((s) => s.completed).length;

  const handleToggleTimer = () => {
    if (soundEnabled) sound.playSoftTap(soundVolume);
    haptics.vibrateSoftTap(hapticFeedback);
    setIsTimerRunning((prev) => !prev);
  };

  const handleAddMinute = () => {
    if (soundEnabled) sound.playSoftTap(soundVolume);
    haptics.vibrateSoftTap(hapticFeedback);
    setRemainingSeconds((prev) => prev + 60);
  };

  const handleStepDone = () => {
    // Subtle tactile confirmation when a user completes a task!
    haptics.vibrateTaskComplete(hapticFeedback);
    if (soundEnabled) sound.playStepComplete(soundVolume);

    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      completed: true,
      skipped: false,
    };
    setSteps(updatedSteps);

    if (isLastStep) {
      // Completed all steps!
      haptics.vibrateSessionComplete(hapticFeedback);
      if (soundEnabled) sound.playSessionComplete(soundVolume);
      finishSession(updatedSteps);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepSkip = () => {
    haptics.vibrateSkip(hapticFeedback);
    if (soundEnabled) sound.playSoftTap(soundVolume);

    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      completed: false,
      skipped: true,
    };
    setSteps(updatedSteps);

    if (isLastStep) {
      finishSession(updatedSteps);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleMakeEasier = async () => {
    if (!currentStep || isSimplifyingStep) return;
    setIsSimplifyingStep(true);
    haptics.vibrateMakeEasier(hapticFeedback);

    try {
      const response = await fetch('/api/make-easier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStepTitle: currentStep.title,
          currentStepInstruction: currentStep.instruction,
          room: session.room,
          energy: session.energy,
        }),
      });

      const data = await response.json();
      if (data.ok && data.simplifiedStep) {
        const updatedSteps = [...steps];
        updatedSteps[currentStepIndex] = {
          ...updatedSteps[currentStepIndex],
          title: data.simplifiedStep.title,
          instruction: data.simplifiedStep.instruction,
          suggestedSeconds: data.simplifiedStep.suggestedSeconds,
          wasSimplified: true,
        };
        setSteps(updatedSteps);
        haptics.vibrateTaskComplete(hapticFeedback);
        if (soundEnabled) sound.playStepComplete(soundVolume * 0.8);
      }
    } catch (err) {
      // Instant gentle client breakdown fallback
      const updatedSteps = [...steps];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        title: `Just 1 item: ${currentStep.title}`,
        instruction: `Instead of all of it, just pick up ONE single item from this spot and move it. You are done with this step after that!`,
        wasSimplified: true,
      };
      setSteps(updatedSteps);
      haptics.vibrateTaskComplete(hapticFeedback);
    } finally {
      setIsSimplifyingStep(false);
    }
  };

  const handleClarificationSelect = (opt: string) => {
    setClarificationAnswer(opt);
    haptics.vibrateSoftTap(hapticFeedback);
    if (soundEnabled) sound.playSoftTap(soundVolume);
  };

  const handleItemSorted = (item: SortedItem) => {
    haptics.vibrateTaskComplete(hapticFeedback);
    if (soundEnabled) sound.playStepComplete(soundVolume * 0.7);
    setSortedItems((prev) => [item, ...prev]);
  };

  const finishSession = (finalSteps = steps) => {
    onCompleteSession({
      ...session,
      steps: finalSteps,
      status: 'completed',
      remainingSeconds,
      totalTimeSpentSeconds: totalTimeSpent,
      sortedItems,
    });
  };

  // Format timer into mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DE]">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#52796F]">
            Focus Zone
          </span>
          <h1 className="font-heading text-lg font-bold text-[#223326] leading-tight">
            {session.microAreaTitle}
          </h1>
        </div>

        <button
          onClick={() => finishSession()}
          className="text-xs font-medium text-[#506353] hover:text-[#223326] px-3 py-1.5 rounded-lg border border-[#D7D2C8] bg-white transition-colors"
        >
          Finish early
        </button>
      </div>

      {/* Gentle Insight Pill */}
      {session.warmInsight && (
        <div className="p-3.5 rounded-2xl bg-[#EBF1EC] border border-[#CADCCC] text-xs text-[#334838] leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#52796F] shrink-0 mt-0.5" />
          <p>{session.warmInsight}</p>
        </div>
      )}

      {/* Clarifying Prompt (if present and unanswered) */}
      {session.clarifyingPrompt && !clarificationAnswer && (
        <div className="p-4 rounded-2xl bg-[#F5F0E6] border border-[#E5DECD] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#82542B]">
            <HelpCircle className="w-4 h-4" />
            <span>Quick Clarification:</span>
          </div>
          <p className="text-xs text-[#403326]">{session.clarifyingPrompt.question}</p>
          <div className="flex flex-wrap gap-2">
            {session.clarifyingPrompt.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleClarificationSelect(opt)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D7CDBE] hover:border-[#82542B] text-xs font-medium text-[#382E24] transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Centerpiece 1: Pausable Timer */}
      <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-3">
        <div className="text-center">
          <div className="font-heading text-5xl sm:text-6xl font-bold tracking-tight text-[#223326] tabular-nums">
            {formatTime(remainingSeconds)}
          </div>
          <p className="text-xs text-[#708173] mt-1">
            {isTimerRunning ? 'Pacing gently...' : 'Timer paused — no rush'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTimer}
            className={`min-h-[48px] px-5 rounded-2xl flex items-center gap-2 font-medium text-xs sm:text-sm transition-all shadow-xs ${
              isTimerRunning
                ? 'bg-[#EAE5DC] hover:bg-[#DFD9CD] text-[#223326]'
                : 'bg-[#52796F] hover:bg-[#43645B] text-white'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddMinute}
            className="min-h-[48px] px-4 rounded-2xl border border-[#D7D2C8] bg-white hover:bg-[#F5F2EB] text-[#344639] font-medium text-xs flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>1 min</span>
          </button>
        </div>
      </div>

      {/* Centerpiece 2: Active ONE Action Card */}
      {currentStep ? (
        <div className="p-6 rounded-3xl bg-[#FBF9F5] border-2 border-[#52796F]/30 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#52796F] uppercase tracking-wider">
              Action {currentStepIndex + 1} of {steps.length}
            </span>
            {currentStep.wasSimplified && (
              <span className="text-[11px] font-medium text-[#82542B] bg-[#F4EFE7] px-2.5 py-0.5 rounded-full border border-[#DFD3C3]">
                Gentle micro-step
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#223326] leading-snug">
              {currentStep.title}
            </h2>
            <p className="text-sm sm:text-base text-[#465749] leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>

          {/* Action Buttons: Done, Make Easier, Skip */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleStepDone}
              className="w-full h-14 rounded-2xl bg-[#52796F] hover:bg-[#43645B] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#52796F]/15 active:scale-[0.99] transition-all"
            >
              <Check className="w-5 h-5" />
              <span>{isLastStep ? 'Done — Finish Space!' : 'Done with this step'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleMakeEasier}
                disabled={isSimplifyingStep}
                className="h-11 px-3 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#DDD5C7] text-[#7A5026] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span>{isSimplifyingStep ? 'Simplifying...' : 'Make easier'}</span>
              </button>

              <button
                onClick={handleStepSkip}
                className="h-11 px-3 rounded-xl bg-white hover:bg-[#EAE6DE] border border-[#D7D2C8] text-[#556758] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip for now</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white border border-[#E4DFD5] text-center space-y-3">
          <p className="text-base font-semibold text-[#223326]">
            All micro-actions cleared!
          </p>
          <button
            onClick={() => finishSession()}
            className="px-6 py-3 rounded-2xl bg-[#52796F] text-white font-medium text-sm"
          >
            See completed celebration
          </button>
        </div>
      )}

      {/* Sorting Bins Drawer Trigger */}
      <div className="pt-1">
        <button
          onClick={() => setIsSortingModalOpen(true)}
          className="w-full p-4 rounded-2xl bg-[#F5F2EB] hover:bg-[#EFEAE0] border border-[#E3DDD1] flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📦</span>
            <div>
              <p className="font-semibold text-xs sm:text-sm text-[#223326]">
                Sorting Trays (Keep, Donate, Recycle, Discard, Later)
              </p>
              <p className="text-[11px] text-[#637567]">
                {sortedItems.length > 0
                  ? `${sortedItems.length} items sorted so far`
                  : 'Holding something difficult? Tap for gentle advice'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#708173]" />
        </button>
      </div>

      {/* Sorting Modal */}
      <SortingHelperModal
        isOpen={isSortingModalOpen}
        onClose={() => setIsSortingModalOpen(false)}
        onItemSorted={handleItemSorted}
        recentSortedItems={sortedItems}
      />
    </div>
  );
};
