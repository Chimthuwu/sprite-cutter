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
  gridOffsetX: number;
  gridOffsetY: number;
  frameOffsets: Record<number, { x: number; y: number }>;
  apiKey: string;
  userProfile: { name: string; email: string; avatar: string } | null;
  isGenerating: boolean;
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
  setDimensions: (dims: { cols?: number; rows?: number; tileWidth?: number; tileHeight?: number; gridOffsetX?: number; gridOffsetY?: number }) => void;
  setFrameOffset: (index: number, offset: { x: number; y: number }) => void;
  setApiKey: (apiKey: string) => void;
  setUserProfile: (profile: { name: string; email: string; avatar: string } | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setSpriteUrl: (url: string | null) => void;
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
  cols: 8,
  rows: 3,
  tileWidth: 128,
  tileHeight: 128,
  gridOffsetX: 0,
  gridOffsetY: 0,
  frameOffsets: {},
  apiKey: localStorage.getItem('spritecut_api_key') || '',
  userProfile: localStorage.getItem('spritecut_user') ? JSON.parse(localStorage.getItem('spritecut_user')!) : null,
  isGenerating: false,
  setSpriteSheet: (file) => {
    const url = file ? URL.createObjectURL(file) : null;
    if (url) {
      const img = new Image();
      img.onload = () => {
        const commonSizes = [16, 24, 32, 48, 64, 128, 256];
        let bestTileSize = 64; // Fallback
        
        // Find best matching common size (prioritize exact divisions of width or height)
        for (const size of [...commonSizes].reverse()) {
          // If the size evenly divides width and height, or comes very close (like 1-2px padding)
          if (img.width % size === 0 || img.height % size === 0) {
            bestTileSize = size;
            break;
          }
        }
        
        const calculatedCols = Math.max(1, Math.round(img.width / bestTileSize));
        const calculatedRows = Math.max(1, Math.round(img.height / bestTileSize));
        
        set({
          cols: calculatedCols,
          rows: calculatedRows,
          tileWidth: bestTileSize,
          tileHeight: bestTileSize,
          gridOffsetX: 0,
          gridOffsetY: 0,
          frameOffsets: {}
        });
      };
      img.src = url;
    }

    set({ 
      spriteSheet: file, 
      spriteUrl: url,
      frames: [],
      selectedFrameIndex: null,
      isPlaying: false,
      currentFrameIndex: 0,
      zoom: 100,
      gridOffsetX: 0,
      gridOffsetY: 0,
      frameOffsets: {}
    });
  },
  setFrames: (frames) => set({ frames, currentFrameIndex: 0, selectedFrameIndex: null, isPlaying: false, frameOffsets: {} }),
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
    
    // Also reorder frame offsets
    const newOffsets: Record<number, { x: number; y: number }> = {};
    const oldOffsets = state.frameOffsets;
    
    // Simple naive reorder approach - re-mapping indices based on new frame order
    // In a real app we'd map by frameID instead of frameIndex for persistence
    const frameMap = new Map();
    state.frames.forEach((f, i) => frameMap.set(f, oldOffsets[i] || { x: 0, y: 0 }));
    newFrames.forEach((f, i) => newOffsets[i] = frameMap.get(f));
    
    return { frames: newFrames, frameOffsets: newOffsets };
  }),
  setMethod: (method) => set({ method }),
  setDimensions: (dims) => set((state) => ({ ...state, ...dims })),
  setFrameOffset: (index, offset) => set((state) => ({ 
    frameOffsets: { ...state.frameOffsets, [index]: offset }
  })),
  setApiKey: (apiKey) => {
    localStorage.setItem('spritecut_api_key', apiKey);
    set({ apiKey });
  },
  setUserProfile: (profile) => {
    if (profile) {
      localStorage.setItem('spritecut_user', JSON.stringify(profile));
    } else {
      localStorage.removeItem('spritecut_user');
    }
    set({ userProfile: profile });
  },
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setSpriteUrl: (url) => set({ spriteUrl: url, frames: [], selectedFrameIndex: null, currentFrameIndex: 0, frameOffsets: {} }),
}));