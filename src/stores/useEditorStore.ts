import { create } from 'zustand';

interface EditorState {
  spriteSheet: File | null;
  spriteUrl: string | null;
  frames: string[];
  selectedFrameIndex: number | null;
  isPlaying: boolean;
  isLooping: boolean;
  currentFrameIndex: number;
  zoom: number;
  method: 'grid' | 'manual';
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  setSpriteSheet: (file: File | null) => void;
  setFrames: (frames: string[]) => void;
  addFrame: (frame: string) => void;
  setSelectedFrameIndex: (index: number | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLooping: (isLooping: boolean) => void;
  setCurrentFrameIndex: (index: number | ((prev: number) => number)) => void;
  setZoom: (zoom: number) => void;
  reorderFrames: (from: number, to: number) => void;
  setMethod: (method: 'grid' | 'manual') => void;
  setDimensions: (dims: { cols?: number; rows?: number; tileWidth?: number; tileHeight?: number }) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  spriteSheet: null,
  spriteUrl: 'https://i.ibb.co/KzS51L5v/image.png',
  frames: [],
  selectedFrameIndex: null,
  isPlaying: false,
  isLooping: true,
  currentFrameIndex: 0,
  zoom: 100,
  method: 'grid',
  cols: 6,
  rows: 2,
  tileWidth: 80,
  tileHeight: 80,
  setSpriteSheet: (file) => set({ 
    spriteSheet: file, 
    spriteUrl: file ? URL.createObjectURL(file) : null,
    frames: [],
    selectedFrameIndex: null,
    isPlaying: false,
    currentFrameIndex: 0,
    zoom: 100
  }),
  setFrames: (frames) => set({ frames, currentFrameIndex: 0, selectedFrameIndex: null, isPlaying: false }),
  addFrame: (frame) => set((state) => ({ frames: [...state.frames, frame], selectedFrameIndex: state.frames.length, currentFrameIndex: state.frames.length, isPlaying: false })),
  setSelectedFrameIndex: (index) => set({ selectedFrameIndex: index, currentFrameIndex: index ?? 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLooping: (isLooping) => set({ isLooping }),
  setCurrentFrameIndex: (index) => set((state) => ({ 
    currentFrameIndex: typeof index === 'function' ? index(state.currentFrameIndex) : index 
  })),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(zoom, 400)) }),
  reorderFrames: (from, to) => set((state) => {
    const newFrames = [...state.frames];
    const [moved] = newFrames.splice(from, 1);
    newFrames.splice(to, 0, moved);
    return { frames: newFrames };
  }),
  setMethod: (method) => set({ method }),
  setDimensions: (dims) => set((state) => ({ ...state, ...dims })),
}));
