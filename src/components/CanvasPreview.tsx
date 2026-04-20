import { useEditorStore } from '../stores/useEditorStore';
import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';

export function CanvasPreview() {
  const { spriteUrl, cols, rows, frames, selectedFrameIndex, isPlaying, currentFrameIndex, zoom, addFrame, frameOffsets } = useEditorStore();
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currPos, setCurrPos] = useState({ x: 0, y: 0 });

  if (!spriteUrl) return <div className="text-text-secondary text-sm">Upload a sprite sheet to begin</div>;
  
  const isViewingSheet = !isPlaying && selectedFrameIndex === null;
  let displaySrc = spriteUrl;
  
  if (!isViewingSheet && frames.length > 0) {
    const idx = isPlaying ? currentFrameIndex : (selectedFrameIndex ?? 0);
    if (frames[idx]) {
      displaySrc = frames[idx];
    }
  }

  const offset = !isViewingSheet && frames.length > 0 ? (frameOffsets[isPlaying ? currentFrameIndex : (selectedFrameIndex ?? 0)] || { x: 0, y: 0 }) : { x: 0, y: 0 };

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isViewingSheet || !imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    // Using zoom factor to scale mouse coordinates appropriately
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setIsSelecting(true);
    setStartPos({ x, y });
    setCurrPos({ x, y });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    // Bound the coordinates within the image
    const x = Math.max(0, Math.min(imgRef.current.width, (e.clientX - rect.left) / scale));
    const y = Math.max(0, Math.min(imgRef.current.height, (e.clientY - rect.top) / scale));
    
    setCurrPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !imgRef.current) return;
    setIsSelecting(false);
    
    const x = Math.min(startPos.x, currPos.x);
    const y = Math.min(startPos.y, currPos.y);
    const w = Math.abs(currPos.x - startPos.x);
    const h = Math.abs(currPos.y - startPos.y);

    if (w < 5 || h < 5) return; // Prevent tiny accidental slices

    // Time to crop the image manually
    const naturalW = imgRef.current.naturalWidth;
    const naturalH = imgRef.current.naturalHeight;
    const displayedW = imgRef.current.width;
    const displayedH = imgRef.current.height;
    
    // Scale local bounding box to natural intrinsic resolution
    const scaleX = naturalW / displayedW;
    const scaleY = naturalH / displayedH;
    
    const cropX = Math.round(x * scaleX);
    const cropY = Math.round(y * scaleY);
    const cropW = Math.round(w * scaleX);
    const cropH = Math.round(h * scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(
      imgRef.current,
      cropX, cropY, cropW, cropH,
      0, 0, cropW, cropH
    );
    
    const frameData = canvas.toDataURL();
    addFrame(frameData);
  };

  const selX = Math.min(startPos.x, currPos.x);
  const selY = Math.min(startPos.y, currPos.y);
  const selW = Math.abs(currPos.x - startPos.x);
  const selH = Math.abs(currPos.y - startPos.y);

  return (
    <div className="relative flex shadow-2xl rounded-lg border border-border w-full h-full max-h-full bg-slate-950 overflow-auto custom-scrollbar">
      <div 
        className="flex min-w-full min-h-full items-center justify-center p-8"
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displaySrc ? (
          <div 
            className="relative inline-flex shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-100 origin-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <img 
              ref={imgRef}
              src={displaySrc} 
              alt="Sprite Content" 
              className="max-w-full max-h-full w-auto h-auto block"
              style={{ 
                imageRendering: 'pixelated',
                transform: !isViewingSheet ? `translate(${offset.x}px, ${offset.y}px)` : 'none'
              }}
              draggable={false}
              crossOrigin="anonymous"
            />
            
            {/* The Grid Overlay (only shown if viewing sheet and no selection active) */}
            {isViewingSheet && !isSelecting && (
              <div 
                className="absolute inset-0 grid pointer-events-none opacity-50" 
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`
                }}
              >
                {Array.from({ length: cols * rows }).map((_, i) => (
                  <div key={i} className="border border-accent/40" />
                ))}
              </div>
            )}

            {/* Interaction Layer for Drag Selection */}
            {isViewingSheet && (
              <div 
                className="absolute inset-0 cursor-crosshair touch-none"
                onMouseDown={handleMouseDown}
              >
                {isSelecting && (
                  <div 
                    className="absolute border border-white bg-accent/20 pointer-events-none"
                    style={{
                      left: selX,
                      top: selY,
                      width: selW,
                      height: selH
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-slate-500">Processing image...</span>
        )}
      </div>
    </div>
  );
}
