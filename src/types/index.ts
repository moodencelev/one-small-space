export type EnergyLevel = 'low' | 'medium' | 'high';

export type SessionDuration = 2 | 5 | 10 | 15;

export type SortCategory = 'keep' | 'donate' | 'recycle' | 'discard' | 'decide_later';

export interface MicroStep {
  id: string;
  title: string;
  instruction: string;
  suggestedSeconds: number;
  completed: boolean;
  skipped?: boolean;
  wasSimplified?: boolean;
}

export interface ClarifyingPrompt {
  question: string;
  options: string[];
}

export interface DeclutterSession {
  id: string;
  room: string;
  customRoomName?: string;
  energy: EnergyLevel;
  durationMinutes: SessionDuration;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
  
  // Intake
  inputType: 'photo' | 'description' | 'manual';
  photoBefore?: string; // base64 or object url
  photoAfter?: string;
  description?: string;
  userConsentedToAi: boolean;
  
  // Plan
  microAreaTitle: string;
  warmInsight: string;
  steps: MicroStep[];
  currentStepIndex: number;
  clarifyingPrompt?: ClarifyingPrompt;
  clarificationAnswer?: string;
  
  // Timer state
  remainingSeconds: number;
  totalTimeSpentSeconds: number;
  isTimerRunning: boolean;
  
  // Completed metrics
  sortedItems: SortedItem[];
  suggestedNextStep?: string;
  isAiGenerated: boolean;
}

export interface SortedItem {
  id: string;
  name: string;
  category: SortCategory;
  timestamp: number;
  notes?: string;
}

export interface RoomOption {
  id: string;
  name: string;
  description: string;
  iconName: string;
  typicalMicroAreas: string[];
}

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  hapticFeedback: boolean;
  remindersEnabled: boolean;
  reminderFrequency: 'daily' | 'weekdays' | 'weekends' | 'none';
  reminderTime: string; // "19:00"
  aiPhotoConsentDefault: boolean;
}

export interface ItemStuckAdvice {
  reflectiveQuestions: string[];
  gentleGuidance: string;
  suggestedCategory: SortCategory;
}
