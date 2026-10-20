import React, { useState } from 'react';
import { Columns2, Sliders, Trash2, X } from 'lucide-react';

interface BeforeAfterViewerProps {
  photoBefore?: string;
  photoAfter?: string;
  spaceTitle: string;
  onDeletePhoto?: (type: 'before' | 'after') => void;
  onClose?: () => void;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  photoBefore,
  photoAfter,
  spaceTitle,
  onDeletePhoto,
  onClose,
}) => {
  const [mode, setMode] = useState<'side_by_side' | 'slider'>('side_by_side');
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!photoBefore && !photoAfter) return null;

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#4D6052] uppercase tracking-wider">
          Space Visuals
        </span>
        {photoBefore && photoAfter && (
          <div className="flex items-center gap-1 p-0.5 bg-[#EAE6DE] rounded-lg">
            <button
              onClick={() => setMode('side_by_side')}
              className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                mode === 'side_by_side' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#607363]'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Side by Side</span>
            </button>
            <button
              onClick={() => setMode('slider')}
              className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                mode === 'slider' ? 'bg-white text-[#223326] shadow-xs' : 'text-[#607363]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Slider</span>
            </button>
          </div>
        )}
      </div>

      {/* Side-by-Side Mode */}
      {mode === 'side_by_side' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {photoBefore ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#DCD6CA] bg-[#EAE5DC] group">
              <img
                src={photoBefore}
                alt="Before decluttering"
                className="w-full h-52 object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
                Before
              </div>
              {onDeletePhoto && (
                <button
                  onClick={() => onDeletePhoto('before')}
                  title="Delete Before photo"
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-red-600/80 text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="h-52 rounded-2xl border border-dashed border-[#D3CCC0] bg-[#FAF7F2] flex flex-col items-center justify-center p-4 text-center">
              <span className="text-xs text-[#708173]">No Before photo recorded</span>
            </div>
          )}

          {photoAfter ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#DCD6CA] bg-[#EAE5DC] group">
              <img
                src={photoAfter}
                alt="After decluttering"
                className="w-full h-52 object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-[#52796F]/90 backdrop-blur-xs text-white text-[11px] font-medium">
                After
              </div>
              {onDeletePhoto && (
                <button
                  onClick={() => onDeletePhoto('after')}
                  title="Delete After photo"
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-red-600/80 text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="h-52 rounded-2xl border border-dashed border-[#D3CCC0] bg-[#FAF7F2] flex flex-col items-center justify-center p-4 text-center">
              <span className="text-xs text-[#708173]">No After photo taken yet</span>
            </div>
          )}
        </div>
      )}

      {/* Interactive Slider Comparison Mode */}
      {mode === 'slider' && photoBefore && photoAfter && (
        <div className="relative rounded-2xl overflow-hidden border border-[#DCD6CA] bg-[#EAE5DC] h-64 select-none">
          {/* Base image: After */}
          <img
            src={photoAfter}
            alt="After"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-[#52796F]/90 text-white text-[11px] font-medium z-10">
            After
          </div>

          {/* Clipped image: Before */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={photoBefore}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '100%', minWidth: '100%', height: '100%' }}
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 text-white text-[11px] font-medium z-10">
              Before
            </div>
          </div>

          {/* Slider divider line and thumb */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-[#223326] shadow-md flex items-center justify-center text-[10px] font-bold">
              ↔
            </div>
          </div>

          {/* Range input overlay */}
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            aria-label="Drag before and after comparison slider"
          />
        </div>
      )}
    </div>
  );
};
