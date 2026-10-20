import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  Heart,
  Share2,
} from 'lucide-react';
import { DeclutterSession } from '../types';
import { BeforeAfterViewer } from '../components/BeforeAfterViewer';
import { compressImage } from '../utils/imageCompressor';

interface SessionCompleteScreenProps {
  session: DeclutterSession;
  onSaveAndFinish: (updatedSession: DeclutterSession) => void;
  onNavigateHome: () => void;
}

export const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({
  session,
  onSaveAndFinish,
  onNavigateHome,
}) => {
  const [photoAfter, setPhotoAfter] = useState<string | undefined>(session.photoAfter);
  const [isProcessingAfterPhoto, setIsProcessingAfterPhoto] = useState<boolean>(false);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const completedSteps = session.steps.filter((s) => s.completed);
  const totalMinutes = Math.max(1, Math.round((session.totalTimeSpentSeconds || 60) / 60));

  const handleAfterPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingAfterPhoto(true);
      const compressed = await compressImage(file, 1200, 0.8);
      setPhotoAfter(compressed);
    } catch (err) {
      console.error('Failed to process after photo', err);
    } finally {
      setIsProcessingAfterPhoto(false);
    }
  };

  const handleFinish = () => {
    onSaveAndFinish({
      ...session,
      photoAfter,
      status: 'completed',
    });
  };

  return (
    <div className="space-y-6">
      {/* Celebration Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-14 h-14 rounded-2xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#223326]">
          You created space today
        </h1>
        <p className="text-sm text-[#526455] max-w-md mx-auto leading-relaxed">
          Every cleared surface is a quiet gift to your future self. Celebrate showing up.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#E4DFD5] text-center shadow-xs">
          <span className="block font-heading text-xl sm:text-2xl font-bold text-[#223326] tabular-nums">
            {totalMinutes}
          </span>
          <span className="text-[11px] text-[#6E8071] uppercase tracking-wider">
            min of calm
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E4DFD5] text-center shadow-xs">
          <span className="block font-heading text-xl sm:text-2xl font-bold text-[#52796F] tabular-nums">
            {completedSteps.length}
          </span>
          <span className="text-[11px] text-[#6E8071] uppercase tracking-wider">
            actions done
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#E4DFD5] text-center shadow-xs">
          <span className="block font-heading text-xl sm:text-2xl font-bold text-[#82542B] tabular-nums">
            {session.sortedItems.length}
          </span>
          <span className="text-[11px] text-[#6E8071] uppercase tracking-wider">
            items sorted
          </span>
        </div>
      </div>

      {/* Optional Real Before/After Photos */}
      <div className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-[#223326]">
              Before & After
            </h2>
            <p className="text-xs text-[#637567]">
              Optional real photo comparison to anchor your visual progress.
            </p>
          </div>
          {!photoAfter && (
            <button
              onClick={() => afterInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#52796F] hover:bg-[#43645B] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Add "After"</span>
            </button>
          )}
        </div>

        <input
          type="file"
          ref={afterInputRef}
          onChange={handleAfterPhotoChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {session.photoBefore || photoAfter ? (
          <BeforeAfterViewer
            photoBefore={session.photoBefore}
            photoAfter={photoAfter}
            spaceTitle={session.microAreaTitle}
            onDeletePhoto={(type) => {
              if (type === 'after') setPhotoAfter(undefined);
            }}
          />
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-[#D7D2C8] bg-[#FAF7F2] text-center space-y-2">
            <p className="text-xs text-[#627366]">
              No photos taken for this session. That is completely fine — your physical space speaks for itself!
            </p>
            <button
              onClick={() => afterInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#D7D2C8] text-xs font-medium text-[#38493C] hover:bg-[#EAE6DE]"
            >
              Take an After photo now
            </button>
          </div>
        )}
      </div>

      {/* One Suggested Next Step */}
      <div className="p-4 rounded-2xl bg-[#F5F0E6] border border-[#E6DDCC] space-y-1.5">
        <span className="text-[11px] font-semibold text-[#82542B] uppercase tracking-wider">
          One Suggested Next Step
        </span>
        <p className="text-sm font-medium text-[#292016] leading-relaxed">
          {session.suggestedNextStep || 'Put your donate bag right by the doorway, then rest your hands and drink a glass of water.'}
        </p>
      </div>

      {/* Primary Finish Button */}
      <div className="pt-2 space-y-2">
        <button
          onClick={handleFinish}
          className="w-full h-14 rounded-2xl bg-[#52796F] hover:bg-[#43645B] text-white font-medium text-base flex items-center justify-center gap-2 shadow-md shadow-[#52796F]/15 active:scale-[0.99] transition-all"
        >
          <span>Save to My Spaces & Finish</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
