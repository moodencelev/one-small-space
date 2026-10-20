import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Battery,
  BatteryMedium,
  BatteryCharging,
  ArrowRight,
  BedDouble,
  Utensils,
  Laptop,
  DoorOpen,
  Sofa,
  Shirt,
  Box,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { DeclutterSession, EnergyLevel, SessionDuration } from '../types';
import { ROOMS } from '../data/rooms';

interface HomeScreenProps {
  onStartSessionSetup: (config: {
    room: string;
    customRoomName?: string;
    energy: EnergyLevel;
    duration: SessionDuration;
  }) => void;
  activeSession: DeclutterSession | null;
  onResumeSession: () => void;
  onDismissActiveSession: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartSessionSetup,
  activeSession,
  onResumeSession,
  onDismissActiveSession,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('nightstand');
  const [customRoom, setCustomRoom] = useState<string>('');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('low');
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(5);

  const energyOptions: Array<{
    level: EnergyLevel;
    label: string;
    subtitle: string;
    icon: typeof Battery;
  }> = [
    {
      level: 'low',
      label: 'Low energy',
      subtitle: 'Just 1 tiny thing · Zero heavy lifting',
      icon: Battery,
    },
    {
      level: 'medium',
      label: 'Medium energy',
      subtitle: 'Steady pace · Reclaim one surface',
      icon: BatteryMedium,
    },
    {
      level: 'high',
      label: 'High energy',
      subtitle: 'Feeling ready · Clear an entire small zone',
      icon: BatteryCharging,
    },
  ];

  const durations: SessionDuration[] = [2, 5, 10, 15];

  const handleBegin = () => {
    onStartSessionSetup({
      room: selectedRoom,
      customRoomName: selectedRoom === 'other' ? customRoom : undefined,
      energy: selectedEnergy,
      duration: selectedDuration,
    });
  };

  const getRoomIcon = (iconName: string) => {
    switch (iconName) {
      case 'BedDouble':
        return <BedDouble className="w-5 h-5 text-[#52796F]" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-[#52796F]" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-[#52796F]" />;
      case 'DoorOpen':
        return <DoorOpen className="w-5 h-5 text-[#52796F]" />;
      case 'Sofa':
        return <Sofa className="w-5 h-5 text-[#52796F]" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-[#52796F]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#52796F]" />;
      default:
        return <Box className="w-5 h-5 text-[#52796F]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Unfinished Space Banner */}
      {activeSession && (activeSession.status === 'active' || activeSession.status === 'paused') && (
        <div className="bg-[#EBF1EC] border border-[#CADCCC] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#52796F] text-white flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#223326]">
                You have a space in progress
              </p>
              <p className="text-xs text-[#526455] mt-0.5">
                {activeSession.microAreaTitle || activeSession.room} · {activeSession.steps.filter((s) => !s.completed).length} micro-actions left
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onResumeSession}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#52796F] hover:bg-[#43645B] text-white text-xs font-medium transition-colors shadow-xs"
            >
              Resume Space
            </button>
            <button
              onClick={onDismissActiveSession}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#EAE6DE] border border-[#CADCCC] text-xs font-medium text-[#506353] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#52796F] bg-[#EBF1EC] px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>No signup needed · Start anytime</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#223326]">
          One Small Space
        </h1>
        <p className="text-sm sm:text-base text-[#526455] max-w-xl leading-relaxed">
          You don’t have to fix your entire home today. Pick one tiny spot, set a gentle timer, and let’s take it one micro-step at a time.
        </p>
      </div>

      {/* Step 1: Choose Room */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4D6052]">
            1. Where would you like a little breathing room?
          </h2>
          <span className="text-xs text-[#708173]">
            {ROOMS.find((r) => r.id === selectedRoom)?.name || 'Selected'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROOMS.map((room) => {
            const isSelected = selectedRoom === room.id;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoom(room.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'bg-white border-[#52796F] ring-2 ring-[#52796F]/20 shadow-xs'
                    : 'bg-[#F5F2EB] border-[#E4DFD5] hover:bg-[#EFEAE0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#EBF1EC]' : 'bg-[#EAE5DC]'}`}>
                    {getRoomIcon(room.iconName)}
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#52796F]" />}
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-[#223326] leading-tight">
                    {room.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedRoom === 'other' && (
          <div className="pt-1">
            <input
              type="text"
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              placeholder="e.g. Craft corner, hallway coat shelf, junk drawer..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D7D2C8] bg-white text-sm text-[#223326] placeholder-[#8C9C8F] focus:outline-none focus:ring-2 focus:ring-[#52796F]/40"
            />
          </div>
        )}
      </section>

      {/* Step 2: Energy Level */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4D6052]">
          2. How is your energy right now?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {energyOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedEnergy === opt.level;
            return (
              <button
                key={opt.level}
                type="button"
                onClick={() => setSelectedEnergy(opt.level)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-white border-[#52796F] ring-2 ring-[#52796F]/20 shadow-xs'
                    : 'bg-[#F5F2EB] border-[#E4DFD5] hover:bg-[#EFEAE0]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#52796F]' : 'text-[#708173]'}`} />
                  <span className="font-semibold text-xs sm:text-sm text-[#223326]">
                    {opt.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#556758] leading-tight">
                  {opt.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Session Duration */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4D6052]">
            3. Choose your timer (short & sweet)
          </h2>
          <span className="text-xs text-[#708173] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pausable anytime</span>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {durations.map((duration) => {
            const isSelected = selectedDuration === duration;
            return (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#52796F] text-white border-[#52796F] shadow-xs'
                    : 'bg-[#F5F2EB] text-[#344639] border-[#E4DFD5] hover:bg-[#EFEAE0]'
                }`}
              >
                <span className="block font-heading text-lg font-bold leading-none">
                  {duration}
                </span>
                <span className="text-[10px] uppercase tracking-wider opacity-85">
                  min
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={handleBegin}
          className="w-full h-14 rounded-2xl bg-[#52796F] hover:bg-[#43645B] text-white font-medium text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#52796F]/15 active:scale-[0.99] transition-all"
        >
          <span>Next: Look at your space</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Non-judgmental reassurance quote */}
      <div className="p-4 rounded-2xl bg-[#F4EFE5] border border-[#E3DDD1] text-center space-y-1">
        <p className="text-xs text-[#526455] italic">
          “Clutter is not a character flaw. It’s just physical decisions waiting for a quiet moment.”
        </p>
      </div>
    </div>
  );
};
