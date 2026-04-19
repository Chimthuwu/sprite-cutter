import { useEditorStore } from '@/stores/useEditorStore';

export function CanvasPreview() {
  const { spriteUrl, cols, rows } = useEditorStore();

  if (!spriteUrl) return <div className="text-text-secondary text-sm">Upload a sprite sheet to begin</div>;

  return (
    <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-border">
      <img src={spriteUrl} alt="Sprite Sheet" className="max-h-[60vh] object-contain" />
      <div 
        className="absolute inset-0 grid" 
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)` 
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => (
          <div key={i} className="border border-accent/40" />
        ))}
      </div>
    </div>
  );
}
