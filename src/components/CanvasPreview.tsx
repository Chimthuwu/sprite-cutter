import { useEditorStore } from '../stores/useEditorStore';
export function CanvasPreview() {
  const { spriteUrl, cols, rows, frames, selectedFrameIndex, isPlaying, currentFrameIndex, zoom } = useEditorStore();

  if (!spriteUrl) return <div className="text-text-secondary text-sm">Upload a sprite sheet to begin</div>;
  
  const displaySrc = isPlaying ? frames[currentFrameIndex] : 
                     (selectedFrameIndex !== null ? frames[selectedFrameIndex] : spriteUrl);

  return (
    <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-border">
      <div className="max-h-[60vh] overflow-auto flex items-center justify-center p-8 bg-slate-950">
        <img 
          src={displaySrc} 
          alt="Sprite Content" 
          className="object-contain transition-transform duration-100"
          style={{ transform: `scale(${zoom / 100})` }}
        />
      </div>
      {!isPlaying && selectedFrameIndex === null && (
        <div 
          className="absolute inset-0 grid" 
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}
        >
          {Array.from({ length: cols * rows }).map((_, i) => (
            <div key={i} className="border border-accent/40 hover:bg-accent/20 transition-colors" />
          ))}
        </div>
      )}
    </div>
  );
}
