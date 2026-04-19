import React, { useState } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';

export function Timeline() {
  const { frames, selectedFrameIndex, setSelectedFrameIndex, reorderFrames } = useEditorStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setSelectedFrameIndex(index);
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderFrames(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  if (frames.length === 0) return <div className="text-text-secondary text-sm p-4">Slice the sprite sheet to see frames here.</div>;

  return (
    <div className="flex gap-3 overflow-x-auto h-full p-2" onClick={() => setContextMenu(null)}>
      {frames.map((frame, index) => (
        <div 
          key={index} 
          className="flex flex-col gap-1 shrink-0"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
        >
          <span className="text-[10px] text-text-secondary text-center font-mono">#{index + 1}</span>
          <div 
            className={`w-24 h-24 rounded flex items-center justify-center border-2 cursor-pointer transition-colors
              ${selectedFrameIndex === index ? 'border-accent bg-accent/20' : 'border-border bg-slate-800 hover:border-slate-600'}
              ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
            onClick={() => setSelectedFrameIndex(index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
          >
            <img src={frame} alt={`Frame ${index}`} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      ))}
      
      {contextMenu && (
        <div 
          className="fixed bg-slate-900 border border-border rounded shadow-xl z-50 p-1 w-32"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800 rounded" onClick={() => {/* TODO */}}>Duplicate</button>
          <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800 text-destructive rounded" onClick={() => {/* TODO */}}>Delete</button>
        </div>
      )}
    </div>
  );
}
