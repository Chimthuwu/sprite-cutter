/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEditorStore } from '@/stores/useEditorStore';
import { FileUploader } from './components/FileUploader';
import { SliceControls } from './components/SliceControls';
import { CanvasPreview } from './components/CanvasPreview';
import { Timeline } from './components/Timeline';
import { TransportControls } from './components/TransportControls';
import { ZoomControls } from './components/ZoomControls';

// @ts-ignore
import GIF from 'gif.js.optimized';
// @ts-ignore
import gifWorkerUrl from 'gif.js.optimized/dist/gif.worker.js?url';

export default function App() {
  const { frames } = useEditorStore();

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

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans">
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-sm z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
            <img src="https://i.ibb.co/Z6MgzMmq/image.png" alt="SpriteCut" className="h-8" referrerPolicy="no-referrer" />
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-md text-sm font-semibold text-text-secondary hover:bg-border transition-colors">GitHub</button>
          <button 
            className="px-4 py-1.5 rounded-md text-sm font-semibold text-text-secondary hover:bg-border transition-colors"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
          <button 
            className="px-4 py-1.5 rounded-md text-sm font-semibold bg-accent text-white shadow-lg shadow-accent/30 hover:opacity-90 transition-opacity"
            onClick={handleExport}
          >
            Export GIF
          </button>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-sidebar border-r border-border p-5 flex flex-col gap-6">
          <FileUploader />
          <SliceControls />
          <ZoomControls />
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


