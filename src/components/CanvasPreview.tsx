import { useEditorStore } from '../stores/useEditorStore';

export function CanvasPreview() {
  const { spriteUrl, cols, rows, frames, selectedFrameIndex, isPlaying, currentFrameIndex, zoom } = useEditorStore();

  if (!spriteUrl) return <div className="text-text-secondary text-sm">Upload a sprite sheet to begin</div>;
  
  let displaySrc = spriteUrl;
  if ((isPlaying || selectedFrameIndex !== null) && frames.length > 0) {
    const idx = isPlaying ? currentFrameIndex : (selectedFrameIndex ?? 0);
    if (frames[idx]) {
      displaySrc = frames[idx];
    }
  }

  return (
    <div className="relative flex shadow-2xl rounded-lg overflow-hidden border border-border w-full h-full max-h-full bg-slate-950">
      <div className="flex flex-1 items-center justify-center w-full h-full overflow-hidden">
        {displaySrc ? (
          <img 
            src={displaySrc} 
            alt="Sprite Content" 
            className="max-w-full max-h-full object-contain transition-transform duration-100"
            style={{ transform: `scale(${zoom / 100})`, imageRendering: 'pixelated' }}
            draggable={false}
          />
        ) : (
          <span className="text-slate-500">Processing image...</span>
        )}
      </div>
      {!isPlaying && selectedFrameIndex === null && (
        <div 
          className="absolute inset-0 grid pointer-events-none" 
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}
        >
          {Array.from({ length: cols * rows }).map((_, i) => (
            <div key={i} className="border border-accent/40" />
          ))}
        </div>
      )}
    </div>
  );
}
