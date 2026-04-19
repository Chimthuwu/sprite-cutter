/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileUploader } from './components/FileUploader';
import { SliceControls } from './components/SliceControls';
import { CanvasPreview } from './components/CanvasPreview';
import { Timeline } from './components/Timeline';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans">
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-sm z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-xs font-bold text-white">K</div> 
            KUT.IO
        </h1>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-md text-sm font-semibold text-text-secondary hover:bg-border transition-colors">GitHub</button>
          <button 
            className="px-4 py-1.5 rounded-md text-sm font-semibold text-text-secondary hover:bg-border transition-colors"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
          <button className="px-4 py-1.5 rounded-md text-sm font-semibold bg-accent text-white shadow-lg shadow-accent/30 hover:opacity-90 transition-opacity">Export GIF</button>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-sidebar border-r border-border p-5 flex flex-col gap-6">
          <FileUploader />
          <SliceControls />
        </aside>
        <section className="flex-1 flex flex-col">
          <div className="flex-1 p-8 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--border)_1px,_transparent_1px)] [background-size:20px_20px]">
             <CanvasPreview />
          </div>
          <div className="h-64 bg-sidebar border-t border-border flex flex-col">
            <div className="px-6 py-3 border-b border-border flex justify-between items-center text-xs font-semibold text-text-primary">
                ANIMATION TIMELINE
            </div>
            <div className="flex-1 p-4 flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                <Timeline />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


