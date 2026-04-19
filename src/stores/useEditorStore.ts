import { create } from 'zustand';

interface EditorState {
  spriteSheet: File | null;
  spriteUrl: string | null;
  frames: string[];
  method: 'grid' | 'manual';
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  setSpriteSheet: (file: File | null) => void;
  setFrames: (frames: string[]) => void;
  setMethod: (method: 'grid' | 'manual') => void;
  setDimensions: (dims: { cols?: number; rows?: number; tileWidth?: number; tileHeight?: number }) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  spriteSheet: null,
  spriteUrl: null,
  frames: [],
  method: 'grid',
  cols: 6,
  rows: 4,
  tileWidth: 80,
  tileHeight: 80,
  setSpriteSheet: (file) => set({ 
    spriteSheet: file, 
    spriteUrl: file ? URL.createObjectURL(file) : null 
  }),
  setFrames: (frames) => set({ frames }),
  setMethod: (method) => set({ method }),
  setDimensions: (dims) => set((state) => ({ ...state, ...dims })),
}));
