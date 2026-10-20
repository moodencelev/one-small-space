import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { DeclutterSession } from '../types';
import { BeforeAfterViewer } from '../components/BeforeAfterViewer';
import { removePhotoFromSession } from '../utils/storage';

interface MySpacesScreenProps {
  sessions: DeclutterSession[];
  onResumeSession: (session: DeclutterSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onRefreshSessions: () => void;
  onStartNew: () => void;
}

export const MySpacesScreen: React.FC<MySpacesScreenProps> = ({
  sessions,
  onResumeSession,
  onDeleteSession,
  onRefreshSessions,
  onStartNew,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDeletePhoto = (sessionId: string, type: 'before' | 'after') => {
    removePhotoFromSession(sessionId, type);
    onRefreshSessions();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#223326]">
            My Spaces
          </h1>
          <p className="text-xs sm:text-sm text-[#556758] mt-0.5">
            Your catalog of small clearings and spaces in progress.
          </p>
        </div>
        <button
          onClick={onStartNew}
          className="px-3.5 py-2 rounded-xl bg-[#52796F] hover:bg-[#43645B] text-white text-xs font-medium transition-colors shadow-xs"
        >
          New Space
        </button>
      </div>

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-[#E4DFD5] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF1EC] text-[#52796F] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-[#223326]">
              No spaces tackled yet
            </h3>
            <p className="text-xs text-[#556758] max-w-sm mx-auto leading-relaxed">
              When you complete or pause your first decluttering session, it will live right here with before & after photos and notes.
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="px-5 py-2.5 rounded-xl bg-[#52796F] text-white text-xs font-medium hover:bg-[#43645B] transition-colors"
          >
            Start a 2-minute space
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sessions.map((item) => {
            const isExpanded = expandedId === item.id;
            const completedCount = item.steps.filter((s) => s.completed).length;
            const isUnfinished = item.status !== 'completed';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E4DFD5] overflow-hidden shadow-xs transition-all"
              >
                {/* Space Card Header */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer hover:bg-[#FAF7F2] transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#223326] truncate">
                        {item.microAreaTitle || item.room}
                      </span>
                      {isUnfinished ? (
                        <span className="text-[10px] font-medium text-[#82542B] bg-[#F4EFE7] px-2 py-0.5 rounded-full border border-[#DFD3C3]">
                          In Progress ({item.steps.length - completedCount} left)
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-[#2D5A37] bg-[#EBF2EC] px-2 py-0.5 rounded-full border border-[#CADBCC] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Refreshed</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#627366]">
                      <span className="capitalize">{item.room.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.createdAt)}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.max(1, Math.round((item.totalTimeSpentSeconds || 60) / 60))}m spent</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(item.photoBefore || item.photoAfter) && (
                      <div className="w-8 h-8 rounded-lg bg-[#EAE6DE] flex items-center justify-center text-[#556758]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label="Expand space details"
                      className="w-8 h-8 rounded-lg hover:bg-[#EAE6DE] flex items-center justify-center text-[#556758]"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-[#EAE6DE] space-y-4 bg-[#FAF7F2]">
                    {/* Unfinished Resume Bar */}
                    {isUnfinished && (
                      <div className="p-3.5 rounded-xl bg-[#EBF1EC] border border-[#CADCCC] flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#223326]">
                            Ready to continue this space?
                          </p>
                          <p className="text-[11px] text-[#556758]">
                            Resume exactly where you left off.
                          </p>
                        </div>
                        <button
                          onClick={() => onResumeSession(item)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#52796F] hover:bg-[#43645B] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </button>
                      </div>
                    )}

                    {/* Before & After Viewer */}
                    {(item.photoBefore || item.photoAfter) && (
                      <BeforeAfterViewer
                        photoBefore={item.photoBefore}
                        photoAfter={item.photoAfter}
                        spaceTitle={item.microAreaTitle}
                        onDeletePhoto={(type) => handleDeletePhoto(item.id, type)}
                      />
                    )}

                    {/* Steps Checklist */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#4D6052] mb-2">
                        Micro-Actions ({completedCount}/{item.steps.length} done):
                      </p>
                      <ul className="space-y-1.5 text-xs text-[#344637]">
                        {item.steps.map((s, idx) => (
                          <li
                            key={s.id || idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              s.completed
                                ? 'bg-white/80 border-[#CADBCC] text-[#2D5A37]'
                                : 'bg-white border-[#E4DFD5] text-[#556758]'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {s.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-[#52796F] shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-[#B5C2B7] shrink-0" />
                              )}
                              <span>{s.title}</span>
                            </span>
                            {s.wasSimplified && (
                              <span className="text-[10px] text-[#82542B] italic">Simplified</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sorted Items summary */}
                    {item.sortedItems && item.sortedItems.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#4D6052] mb-1.5">
                          Items sorted ({item.sortedItems.length}):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.sortedItems.map((si) => (
                            <span
                              key={si.id}
                              className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#D7D2C8] text-[#344639]"
                            >
                              {si.name} ({si.category.replace('_', ' ')})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Session Confirmation */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#EAE6DE]">
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-700 font-medium">Delete this space record?</span>
                          <button
                            onClick={() => {
                              onDeleteSession(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                          >
                            Yes, delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded-md text-xs text-[#556758] hover:bg-[#EAE6DE]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="text-xs text-[#708173] hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete space</span>
                        </button>
                      )}

                      {isUnfinished && (
                        <button
                          onClick={() => onResumeSession(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#52796F] hover:bg-[#43645B] text-white text-xs font-medium flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Resume now</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
