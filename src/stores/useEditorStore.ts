import { create } from 'zustand';

interface EditorState {
  spriteSheet: File | null;
  spriteUrl: string | null;
  frames: string[];
  selectedFrameIndex: number | null;
  method: 'grid' | 'manual';
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  setSpriteSheet: (file: File | null) => void;
  setFrames: (frames: string[]) => void;
  reorderFrames: (from: number, to: number) => void;
  setSelectedFrameIndex: (index: number | null) => void;
  setMethod: (method: 'grid' | 'manual') => void;
  setDimensions: (dims: { cols?: number; rows?: number; tileWidth?: number; tileHeight?: number }) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  spriteSheet: null,
  spriteUrl: null,
  frames: [],
  selectedFrameIndex: null,
  method: 'grid',
  cols: 6,
  rows: 4,
  tileWidth: 80,
  tileHeight: 80,
  setSpriteSheet: (file) => set({ 
    spriteSheet: file, 
    spriteUrl: file ? URL.createObjectURL(file) : null,
    frames: [],
    selectedFrameIndex: null
  }),
  setFrames: (frames) => set({ frames }),
  reorderFrames: (from, to) => set((state) => {
    const newFrames = [...state.frames];
    const [moved] = newFrames.splice(from, 1);
    newFrames.splice(to, 0, moved);
    return { frames: newFrames };
  }),
  setSelectedFrameIndex: (index) => set({ selectedFrameIndex: index }),
  setMethod: (method) => set({ method }),
  setDimensions: (dims) => set((state) => ({ ...state, ...dims })),
}));
