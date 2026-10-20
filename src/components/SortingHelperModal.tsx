import React, { useState } from 'react';
import { X, HelpCircle, Check, ArrowRight, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { SortCategory, SortedItem } from '../types';

interface SortingHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSorted: (item: SortedItem) => void;
  recentSortedItems: SortedItem[];
}

export const CATEGORY_INFO: Record<
  SortCategory,
  { label: string; sub: string; badgeBg: string; textCol: string; borderCol: string; icon: string }
> = {
  keep: {
    label: 'Keep',
    sub: 'Has a clear home & purpose',
    badgeBg: 'bg-[#EBF2EC]',
    textCol: 'text-[#2D5A37]',
    borderCol: 'border-[#CADBCC]',
    icon: '✨',
  },
  donate: {
    label: 'Donate',
    sub: 'Usable condition for someone else',
    badgeBg: 'bg-[#F2ECE4]',
    textCol: 'text-[#82542B]',
    borderCol: 'border-[#DFCFC0]',
    icon: '🎁',
  },
  recycle: {
    label: 'Recycle',
    sub: 'Paper, card, clean packaging',
    badgeBg: 'bg-[#E7F0F3]',
    textCol: 'text-[#2C6274]',
    borderCol: 'border-[#C8DFE6]',
    icon: '♻️',
  },
  discard: {
    label: 'Discard',
    sub: 'Broken, expired, trash',
    badgeBg: 'bg-[#F4ECEE]',
    textCol: 'text-[#843647]',
    borderCol: 'border-[#DEC4CB]',
    icon: '🗑️',
  },
  decide_later: {
    label: 'Decide Later',
    sub: '48-hour "Thinking Box"',
    badgeBg: 'bg-[#F0ECF5]',
    textCol: 'text-[#5E3D85]',
    borderCol: 'border-[#D9CFE6]',
    icon: '📦',
  },
};

export const SortingHelperModal: React.FC<SortingHelperModalProps> = ({
  isOpen,
  onClose,
  onItemSorted,
  recentSortedItems,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'stuck'>('quick');
  const [itemName, setItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SortCategory>('keep');
  
  // Stuck state
  const [stuckItemName, setStuckItemName] = useState('');
  const [stuckReason, setStuckReason] = useState('sentimental');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [advice, setAdvice] = useState<{
    questions: string[];
    guidance: string;
    suggestion: SortCategory;
  } | null>(null);

  if (!isOpen) return null;

  const handleQuickSort = (category: SortCategory) => {
    const finalName = itemName.trim() || `Item in ${category}`;
    onItemSorted({
      id: `sort_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: finalName,
      category,
      timestamp: Date.now(),
    });
    setItemName('');
  };

  const handleFetchAdvice = async () => {
    if (!stuckItemName.trim()) return;
    setIsLoadingAdvice(true);
    setAdvice(null);

    try {
      const response = await fetch('/api/item-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: stuckItemName,
          reasonForHesitation: stuckReason,
        }),
      });

      if (!response.ok) throw new Error('Helper endpoint error');
      const data = await response.json();
      setAdvice({
        questions: data.reflectiveQuestions || [
          'Have you used or enjoyed this in the last 6 months?',
          'Does looking at this bring peace, or a feeling of guilt?',
          'Could taking a photo preserve the memory without keeping the bulk?',
        ],
        guidance: data.gentleGuidance || 'Your peace of mind is worth more than unused physical bulk.',
        suggestion: (data.suggestedCategory as SortCategory) || 'decide_later',
      });
    } catch {
      // Gentle offline fallback
      setAdvice({
        questions: [
          'Does keeping this serve your present daily life, or an unlived past/future version?',
          'If this were lost today, would you spend your hard-earned money to replace it?',
          'Could you take a quick photo of it to treasure the memory?',
        ],
        guidance: 'You have permission to let go of guilt. Objects are not memories; memories reside in you.',
        suggestion: 'decide_later',
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const handleResolveStuckItem = (category: SortCategory) => {
    onItemSorted({
      id: `sort_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: stuckItemName.trim() || 'Difficult item',
      category,
      timestamp: Date.now(),
      notes: `Reflected with: ${stuckReason}`,
    });
    setStuckItemName('');
    setAdvice(null);
    setActiveTab('quick');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sorting-modal-title"
        className="w-full max-w-lg bg-[#FAF7F2] rounded-2xl md:rounded-3xl shadow-xl border border-[#E4DFD5] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#EAE6DE]">
          <h2 id="sorting-modal-title" className="font-heading text-lg font-semibold text-[#223326]">
            Sorting Trays
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-[#EAE6DE] flex items-center justify-center text-[#556658] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Quick Sort vs Stuck Helper */}
        <div className="px-6 pt-3">
          <div className="grid grid-cols-2 p-1 bg-[#EAE6DE] rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('quick')}
              className={`py-2 rounded-lg transition-colors ${
                activeTab === 'quick' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#566859] hover:text-[#223326]'
              }`}
            >
              5 Sorting Bins
            </button>
            <button
              onClick={() => setActiveTab('stuck')}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'stuck' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#566859] hover:text-[#223326]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#52796F]" />
              <span>Stuck on an item?</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'quick' ? (
            <>
              <div>
                <label htmlFor="quick-item-input" className="block text-xs font-medium text-[#4D6052] mb-1.5">
                  What item are you holding? (Optional)
                </label>
                <input
                  id="quick-item-input"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Empty mug, old magazine, expired lotion..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D7D2C8] bg-white text-sm text-[#223326] placeholder-[#8C9C8F] focus:outline-none focus:ring-2 focus:ring-[#52796F]/40"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#4D6052] mb-2">Tap a bin to sort it:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(CATEGORY_INFO) as SortCategory[]).map((cat) => {
                    const info = CATEGORY_INFO[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => handleQuickSort(cat)}
                        className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-3 ${info.badgeBg} ${info.borderCol}`}
                      >
                        <span className="text-xl shrink-0">{info.icon}</span>
                        <div>
                          <p className={`font-semibold text-sm ${info.textCol}`}>{info.label}</p>
                          <p className="text-[11px] text-[#556758]">{info.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {recentSortedItems.length > 0 && (
                <div className="pt-2 border-t border-[#EAE6DE]">
                  <p className="text-xs font-medium text-[#5B6C5E] mb-2">Sorted in this session ({recentSortedItems.length}):</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {recentSortedItems.slice(0, 10).map((item) => (
                      <span
                        key={item.id}
                        className={`px-2.5 py-1 rounded-lg text-xs border ${CATEGORY_INFO[item.category].badgeBg} ${CATEGORY_INFO[item.category].textCol} ${CATEGORY_INFO[item.category].borderCol}`}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Stuck Item Helper Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4D6052] mb-1">
                  What item is making you hesitate?
                </label>
                <input
                  type="text"
                  value={stuckItemName}
                  onChange={(e) => setStuckItemName(e.target.value)}
                  placeholder="e.g. Coat I spent $100 on, grandma's teacup, project notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D7D2C8] bg-white text-sm text-[#223326] placeholder-[#8C9C8F] focus:outline-none focus:ring-2 focus:ring-[#52796F]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4D6052] mb-1.5">
                  Why does it feel hard to let go?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'sentimental', label: 'Sentimental / memories' },
                    { id: 'money', label: 'Spent good money on it' },
                    { id: 'someday', label: 'Might need it "someday"' },
                    { id: 'gift', label: 'Gift / feel guilty tossing' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setStuckReason(r.id)}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        stuckReason === r.id
                          ? 'bg-[#52796F] text-white border-[#52796F]'
                          : 'bg-white text-[#3E4F42] border-[#D7D2C8] hover:bg-[#F3EFE7]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {!advice && (
                <button
                  onClick={handleFetchAdvice}
                  disabled={!stuckItemName.trim() || isLoadingAdvice}
                  className="w-full h-11 rounded-xl bg-[#52796F] hover:bg-[#43645B] disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {isLoadingAdvice ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reflecting with gentle guidance...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ask Gentle Questions</span>
                    </>
                  )}
                </button>
              )}

              {advice && (
                <div className="space-y-4 bg-[#F2EDE2] p-4 rounded-2xl border border-[#E1DBCF]">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#223326] uppercase tracking-wider">
                      Consider these 3 questions:
                    </p>
                    <ul className="space-y-2 text-xs text-[#334637]">
                      {advice.questions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-[#DDD6C8]">
                          <span className="font-semibold text-[#52796F] shrink-0">{idx + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-[#4F6152] italic bg-[#E9E3D6] p-2.5 rounded-lg border border-[#D9D1C2]">
                    💭 {advice.guidance}
                  </p>

                  <div className="pt-2">
                    <p className="text-xs font-medium text-[#223326] mb-2">You decide where it goes:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleResolveStuckItem('decide_later')}
                        className="p-2.5 rounded-xl bg-[#5E3D85]/10 border border-[#D9CFE6] text-[#5E3D85] text-xs font-medium hover:bg-[#5E3D85]/15 transition-colors"
                      >
                        📦 Put in Thinking Box (48h)
                      </button>
                      <button
                        onClick={() => handleResolveStuckItem('donate')}
                        className="p-2.5 rounded-xl bg-[#82542B]/10 border border-[#DFCFC0] text-[#82542B] text-xs font-medium hover:bg-[#82542B]/15 transition-colors"
                      >
                        🎁 Donate with Gratitude
                      </button>
                      <button
                        onClick={() => handleResolveStuckItem('keep')}
                        className="p-2.5 rounded-xl bg-[#2D5A37]/10 border border-[#CADBCC] text-[#2D5A37] text-xs font-medium hover:bg-[#2D5A37]/15 transition-colors"
                      >
                        ✨ Keep & Give a Home
                      </button>
                      <button
                        onClick={() => handleResolveStuckItem('discard')}
                        className="p-2.5 rounded-xl bg-[#843647]/10 border border-[#DEC4CB] text-[#843647] text-xs font-medium hover:bg-[#843647]/15 transition-colors"
                      >
                        🗑️ Let Go / Discard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F5F1E8] border-t border-[#EAE6DE] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#D7D2C8] text-xs font-medium text-[#384A3B] hover:bg-[#EAE6DE] transition-colors"
          >
            Done with sorting
          </button>
        </div>
      </div>
    </div>
  );
};
