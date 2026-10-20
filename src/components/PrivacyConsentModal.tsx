import React from 'react';
import { ShieldCheck, Lock, Trash2, X, EyeOff } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmConsent: () => void;
  onChooseDescriptionOnly: () => void;
  onChooseManualChecklist: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onClose,
  onConfirmConsent,
  onChooseDescriptionOnly,
  onChooseManualChecklist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
        className="w-full max-w-lg bg-[#FAF7F2] rounded-2xl md:rounded-3xl shadow-xl border border-[#E4DFD5] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#EAE6DE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#52796F]/10 text-[#52796F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 id="privacy-modal-title" className="font-heading text-lg font-semibold text-[#223326]">
              Your Photo & Privacy
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-[#EAE6DE] flex items-center justify-center text-[#556658] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#3E4F42] leading-relaxed">
          <p className="font-medium text-[#223326]">
            Your home is personal. Before sending any photo to AI for analysis, we want you to know exactly how it works:
          </p>

          <div className="space-y-3 bg-[#F3EFE7] p-4 rounded-xl border border-[#E7E2D6]">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#52796F] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#223326] text-xs">Used only to detect micro-actions</p>
                <p className="text-xs text-[#546558] mt-0.5">
                  The image is inspected server-side solely to suggest one small surface and practical steps for your session.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <EyeOff className="w-4 h-4 text-[#52796F] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#223326] text-xs">Zero public model training</p>
                <p className="text-xs text-[#546558] mt-0.5">
                  Your household photos are never used to train public AI models or shared with third parties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Trash2 className="w-4 h-4 text-[#52796F] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#223326] text-xs">You control deletion</p>
                <p className="text-xs text-[#546558] mt-0.5">
                  Photos are kept only locally in your browser storage. You can delete individual photos or all data anytime in Settings.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#627366] italic">
            Prefer not to send photos? You can always type a 1-sentence description or use our gentle manual checklist.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 bg-[#F5F1E8] border-t border-[#EAE6DE] space-y-2.5">
          <button
            onClick={onConfirmConsent}
            className="w-full h-12 rounded-xl bg-[#52796F] hover:bg-[#43645B] text-white font-medium text-sm flex items-center justify-center transition-colors shadow-xs"
          >
            I Understand — Analyze with AI
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onChooseDescriptionOnly}
              className="h-10 px-3 rounded-lg bg-white hover:bg-[#EAE6DE] text-[#344639] border border-[#DDD8CE] text-xs font-medium transition-colors"
            >
              Describe in words instead
            </button>
            <button
              onClick={onChooseManualChecklist}
              className="h-10 px-3 rounded-lg bg-white hover:bg-[#EAE6DE] text-[#344639] border border-[#DDD8CE] text-xs font-medium transition-colors"
            >
              Use manual checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
