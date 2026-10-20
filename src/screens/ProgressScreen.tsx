import React from 'react';
import { Heart, Sparkles, Clock, CheckCircle2, ShieldAlert, Award, Coffee } from 'lucide-react';
import { DeclutterSession } from '../types';
import { calculateStats } from '../utils/storage';
import { CATEGORY_INFO } from '../components/SortingHelperModal';

interface ProgressScreenProps {
  sessions: DeclutterSession[];
  onStartNew: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  sessions,
  onStartNew,
}) => {
  const stats = calculateStats(sessions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#223326]">
          Gentle Progress
        </h1>
        <p className="text-sm text-[#526455] mt-1">
          No toxic streaks. No guilt if life got busy. Just an honest celebration of the minutes you claimed back.
        </p>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E4DFD5] shadow-xs">
          <div className="flex items-center gap-2 text-[#52796F] mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Calm Created</span>
          </div>
          <span className="block font-heading text-2xl sm:text-3xl font-bold text-[#223326] tabular-nums">
            {stats.totalMinutesSpent}
          </span>
          <span className="text-xs text-[#708173]">minutes invested</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4DFD5] shadow-xs">
          <div className="flex items-center gap-2 text-[#52796F] mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Spaces</span>
          </div>
          <span className="block font-heading text-2xl sm:text-3xl font-bold text-[#223326] tabular-nums">
            {stats.totalSessionsCompleted}
          </span>
          <span className="text-xs text-[#708173]">corners refreshed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4DFD5] shadow-xs">
          <div className="flex items-center gap-2 text-[#52796F] mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Actions</span>
          </div>
          <span className="block font-heading text-2xl sm:text-3xl font-bold text-[#223326] tabular-nums">
            {stats.totalStepsCompleted}
          </span>
          <span className="text-xs text-[#708173]">micro-steps done</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4DFD5] shadow-xs">
          <div className="flex items-center gap-2 text-[#82542B] mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Items</span>
          </div>
          <span className="block font-heading text-2xl sm:text-3xl font-bold text-[#82542B] tabular-nums">
            {stats.totalItemsSorted}
          </span>
          <span className="text-xs text-[#708173]">items sorted</span>
        </div>
      </div>

      {/* 5-Tray Sorting Breakdown */}
      <div className="p-5 rounded-3xl bg-white border border-[#E4DFD5] shadow-xs space-y-4">
        <h2 className="font-heading text-base font-semibold text-[#223326]">
          Where Your Items Went
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {Object.entries(CATEGORY_INFO).map(([key, info]) => {
            const count = stats.sortedByCategory[key] || 0;
            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border text-center ${info.badgeBg} ${info.borderCol}`}
              >
                <span className="text-xl block mb-1">{info.icon}</span>
                <span className={`block font-heading text-xl font-bold ${info.textCol} tabular-nums`}>
                  {count}
                </span>
                <span className="text-xs font-medium text-[#465749]">{info.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anti-Guilt Constitution Card */}
      <div className="p-5 rounded-3xl bg-[#F5EFE6] border border-[#E4DDD0] space-y-3">
        <div className="flex items-center gap-2 text-[#82542B]">
          <Heart className="w-5 h-5" />
          <h3 className="font-semibold text-sm text-[#241A11]">
            Why You Will Never See a "Streak" Here
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#4E3D2D] leading-relaxed">
          Gamified streaks turn self-care into a chore. If you don't declutter for two weeks, you didn't "fail" — you just lived your life. Whenever you have 2 minutes and a tired mind, One Small Space is here to welcome you without judgment.
        </p>
        <div className="pt-1">
          <button
            onClick={onStartNew}
            className="px-4 py-2 rounded-xl bg-[#82542B] hover:bg-[#6C4421] text-white text-xs font-medium transition-colors shadow-xs"
          >
            Clear a 2-minute space today
          </button>
        </div>
      </div>

      {/* Reflection Note */}
      <div className="p-4 rounded-2xl bg-white border border-[#E4DFD5] flex items-start gap-3">
        <Coffee className="w-5 h-5 text-[#52796F] shrink-0 mt-0.5" />
        <div className="text-xs text-[#526455] leading-relaxed">
          <strong>Daily thought:</strong> You cannot organize clutter that you don't actually need. The lightest room is the one where things are allowed to leave with gratitude.
        </div>
      </div>
    </div>
  );
};
