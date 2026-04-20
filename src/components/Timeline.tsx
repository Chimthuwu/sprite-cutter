import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';

export function Timeline() {
  const { frames, selectedFrameIndex, setSelectedFrameIndex, reorderFrames, isPlaying, currentFrameIndex, frameOffsets, setFrameOffset } = useEditorStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverTargetIndex, setDragOverTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (selectedFrameIndex === null) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedFrameIndex(Math.min(frames.length - 1, selectedFrameIndex + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedFrameIndex(Math.max(0, selectedFrameIndex - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFrameIndex, frames.length, setSelectedFrameIndex]);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setSelectedFrameIndex(index);
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverTargetIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderFrames(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverTargetIndex(null);
  };

  if (frames.length === 0) return <div className="text-text-secondary text-sm p-4">Slice the sprite sheet to see frames here.</div>;

  return (
      <div 
        className="flex gap-3 overflow-x-auto h-full min-h-0 min-w-0 p-2 custom-scrollbar" 
        onClick={() => setContextMenu(null)}
      >
      {frames.map((frame, index) => (
        <div 
          key={index} 
          className="flex flex-col gap-1 shrink-0"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(index)}
        >
          <span className="text-[10px] text-text-secondary text-center font-mono">#{index + 1}</span>
          <div 
            className={`w-24 h-24 rounded flex items-center justify-center border-2 cursor-pointer transition-all
              ${(isPlaying ? currentFrameIndex === index : selectedFrameIndex === index) ? 'border-accent bg-accent/20' : 'border-border bg-slate-800 hover:border-slate-600'}
              ${draggedIndex === index ? 'opacity-30 scale-95' : 'opacity-100'}
              ${dragOverTargetIndex === index && draggedIndex !== index ? 'border-white ring-2 ring-white/50 scale-105' : ''}`}
            onClick={() => setSelectedFrameIndex(index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
          >
            <img src={frame} alt={`Frame ${index}`} className="max-w-full max-h-full object-contain pointer-events-none" />
          </div>
        </div>
      ))}
      
      {contextMenu && (
        <div 
          className="fixed bg-slate-900 border border-border rounded shadow-xl z-50 p-3 w-48 space-y-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="text-xs font-bold text-text-secondary">Frame #{contextMenu.index + 1} Offset</div>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              className="bg-slate-800 p-1 text-sm rounded w-full"
              value={frameOffsets[contextMenu.index]?.x || 0}
              onChange={(e) => setFrameOffset(contextMenu.index, { ...frameOffsets[contextMenu.index], x: parseInt(e.target.value) || 0 })}
            />
            <input 
              type="number" 
              className="bg-slate-800 p-1 text-sm rounded w-full"
              value={frameOffsets[contextMenu.index]?.y || 0}
              onChange={(e) => setFrameOffset(contextMenu.index, { ...frameOffsets[contextMenu.index], y: parseInt(e.target.value) || 0 })}
            />
          </div>
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800 text-destructive rounded" onClick={() => {/* TODO */}}>Delete</button>
        </div>
      )}
      </div>
  );
}
