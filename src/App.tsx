import { useState } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { FileUploader } from './components/FileUploader';
import { SliceControls } from './components/SliceControls';
import { CanvasPreview } from './components/CanvasPreview';
import { Timeline } from './components/Timeline';
import { TransportControls } from './components/TransportControls';
import { ZoomControls } from './components/ZoomControls';
import { GoogleAuth } from './components/GoogleAuth';
import { SpriteGenerator } from './components/SpriteGenerator';
import JSZip from 'jszip';

// @ts-ignore
import GIF from 'gif.js.optimized';
// @ts-ignore
import gifWorkerUrl from 'gif.js.optimized/dist/gif.worker.js?url';

export default function App() {
  const { frames } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'ai'>('upload');

  const handleExport = async () => {
    if (frames.length === 0) return;

    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    const firstImg = await loadImage(frames[0]);

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: firstImg.width,
      height: firstImg.height,
      workerScript: gifWorkerUrl
    });

    for (const frame of frames) {
      const img = await loadImage(frame);
      gif.addFrame(img, { delay: 200 });
    }

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'animation.gif';
      a.click();
    });

    gif.render();
  };

  const handleDownloadZip = async () => {
    if (frames.length === 0) return;

    const zip = new JSZip();

    frames.forEach((frame, index) => {
      const commaIndex = frame.indexOf(',');
      if (commaIndex !== -1) {
        const base64Data = frame.substring(commaIndex + 1);
        zip.file(`frame_${String(index + 1).padStart(3, '0')}.png`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprite_frames.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans">
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-sm z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
            <img src="https://i.ibb.co/Z6MgzMmq/image.png" alt="SpriteCut" className="h-8" referrerPolicy="no-referrer" />
        </h1>
        <div className="flex gap-3 text-center items-center">
          <GoogleAuth />
          <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-border transition-colors cursor-pointer">GitHub</button>
          <button 
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-border transition-colors cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              frames.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-text-secondary'
                : 'border border-border text-text-primary hover:bg-border'
            }`}
            onClick={handleDownloadZip}
            disabled={frames.length === 0}
          >
            Download ZIP
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold shadow-lg transition-all cursor-pointer ${
              frames.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-text-secondary shadow-none'
                : 'bg-accent text-white shadow-accent/30 hover:opacity-90'
            }`}
            onClick={handleExport}
            disabled={frames.length === 0}
          >
            Export GIF
          </button>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-sidebar border-r border-border p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          {/* Sidebar Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-border shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 text-center py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Upload Sprite
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 text-center py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ai' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              AI Generator
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {activeTab === 'upload' ? <FileUploader /> : <SpriteGenerator />}
            <div className="border-t border-border/60 pt-4">
              <SliceControls />
            </div>
            <div className="border-t border-border/60 pt-4">
              <ZoomControls />
            </div>
          </div>
        </aside>
        <section className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-8 bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:20px_20px] min-h-0 overflow-hidden relative">
             <div className="absolute inset-8">
               <CanvasPreview />
             </div>
          </div>
          <div className="h-64 bg-sidebar border-t border-border flex flex-col shrink-0">
            <div className="px-6 py-3 border-b border-border flex items-center text-xs font-semibold text-text-primary gap-4">
                <div className="shrink-0 flex items-center gap-4">
                    <TransportControls />
                    <span className="text-text-secondary">|</span>
                    <span>ANIMATION TIMELINE</span>
                </div>
            </div>
            <div className="flex-1 p-4 flex gap-3 overflow-x-auto custom-scrollbar">
                <Timeline />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


