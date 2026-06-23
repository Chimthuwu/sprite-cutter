import { useState } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Wand2, Sparkles, Brain } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function SliceControls() {
  const { cols, rows, tileWidth, tileHeight, gridOffsetX, gridOffsetY, setDimensions, spriteSheet, setFrames } = useEditorStore();
  const [isDetecting, setIsDetecting] = useState(false);

  const getSpriteSheetBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const spriteUrl = useEditorStore.getState().spriteUrl;
      if (!spriteUrl) return reject("No sprite sheet loaded.");
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = spriteUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleAIGridDetect = async () => {
    const key = useEditorStore.getState().apiKey;
    if (!key) {
      alert("Please configure your Gemini API Key in the top-right settings to run AI Grid Detection.");
      return;
    }
    
    setIsDetecting(true);
    try {
      const base64 = await getSpriteSheetBase64();
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: base64,
              mimeType: 'image/png'
            }
          },
          `Analyze this sprite sheet image. Count the columns and rows of sprite frames, and detect the dimensions of each individual sprite frame (tileWidth, tileHeight) and any offset (gridOffsetX, gridOffsetY) from the top-left corner. Return the grid parameters in JSON format.`
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              cols: { type: 'INTEGER', description: "Number of columns in the grid" },
              rows: { type: 'INTEGER', description: "Number of rows in the grid" },
              tileWidth: { type: 'INTEGER', description: "Width of each tile/frame in pixels" },
              tileHeight: { type: 'INTEGER', description: "Height of each tile/frame in pixels" },
              gridOffsetX: { type: 'INTEGER', description: "X offset of the first tile in pixels" },
              gridOffsetY: { type: 'INTEGER', description: "Y offset of the first tile in pixels" }
            },
            required: ['cols', 'rows', 'tileWidth', 'tileHeight', 'gridOffsetX', 'gridOffsetY']
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const result = JSON.parse(text);
        setDimensions({
          cols: Number(result.cols) || 1,
          rows: Number(result.rows) || 1,
          tileWidth: Number(result.tileWidth) || 64,
          tileHeight: Number(result.tileHeight) || 64,
          gridOffsetX: Number(result.gridOffsetX) || 0,
          gridOffsetY: Number(result.gridOffsetY) || 0
        });
      }
    } catch (err: any) {
      console.error(err);
      alert("AI Grid Detection failed: " + (err.message || err));
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAutoSpacer = () => {
    const spriteUrl = useEditorStore.getState().spriteUrl;
    if (!spriteUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spriteUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // 1. Projection profiling: detect active pixels
        const xProj = new Array(img.width).fill(0);
        const yProj = new Array(img.height).fill(0);

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const idx = (y * img.width + x) * 4;
            const alpha = data[idx + 3];
            if (alpha > 15) { // alpha > 15 threshold
              xProj[x]++;
              yProj[y]++;
            }
          }
        }

        // 2. Identify segments (connected regions of sprites along X and Y axes)
        const findSegments = (proj: number[], minVal = 1) => {
          const segments: { start: number; end: number }[] = [];
          let inSegment = false;
          let start = 0;
          for (let i = 0; i < proj.length; i++) {
            const isActive = proj[i] > minVal;
            if (isActive && !inSegment) {
              inSegment = true;
              start = i;
            } else if (!isActive && inSegment) {
              inSegment = false;
              segments.push({ start, end: i });
            }
          }
          if (inSegment) {
            segments.push({ start, end: proj.length });
          }
          return segments;
        };

        const xSegments = findSegments(xProj);
        const ySegments = findSegments(yProj);

        if (xSegments.length === 0 || ySegments.length === 0) {
          alert("Smart Auto-Spacer: No distinct sprite shapes found. Adjust transparency or background colors.");
          return;
        }

        // 3. Compute median widths/heights
        const widths = xSegments.map(s => s.end - s.start);
        const heights = ySegments.map(s => s.end - s.start);
        const medianWidth = widths.sort((a, b) => a - b)[Math.floor(widths.length / 2)];
        const medianHeight = heights.sort((a, b) => a - b)[Math.floor(heights.length / 2)];

        // 4. Calculate grid dimensions
        const firstX = xSegments[0].start;
        const lastX = xSegments[xSegments.length - 1].end;
        const firstY = ySegments[0].start;
        const lastY = ySegments[ySegments.length - 1].end;

        // We estimate padding based on spacing between segments
        let colStride = medianWidth;
        if (xSegments.length > 1) {
          const striders: number[] = [];
          for (let i = 1; i < xSegments.length; i++) {
            striders.push(xSegments[i].start - xSegments[i - 1].start);
          }
          colStride = striders.sort((a, b) => a - b)[Math.floor(striders.length / 2)];
        }

        let rowStride = medianHeight;
        if (ySegments.length > 1) {
          const striders: number[] = [];
          for (let i = 1; i < ySegments.length; i++) {
            striders.push(ySegments[i].start - ySegments[i - 1].start);
          }
          rowStride = striders.sort((a, b) => a - b)[Math.floor(striders.length / 2)];
        }

        const calculatedCols = xSegments.length;
        const calculatedRows = ySegments.length;

        setDimensions({
          cols: calculatedCols,
          rows: calculatedRows,
          tileWidth: Math.round(colStride),
          tileHeight: Math.round(rowStride),
          gridOffsetX: firstX,
          gridOffsetY: firstY
        });
      } catch (err: any) {
        console.error(err);
        alert("Smart Auto-Spacer failed: Could not read image pixel data. If this is a cross-origin image, please download and re-upload it.");
      }
    };
    img.onerror = () => {
      alert("Smart Auto-Spacer: Failed to load the image.");
    };
  };

  const handleAutoSize = () => {
    const { imageWidth, imageHeight, cols, rows, gridOffsetX, gridOffsetY } = useEditorStore.getState();
    if (!imageWidth || !imageHeight) {
      alert("No image dimensions found. Make sure the image is loaded.");
      return;
    }
    const newWidth = Math.max(1, Math.round((imageWidth - gridOffsetX) / cols));
    const newHeight = Math.max(1, Math.round((imageHeight - gridOffsetY) / rows));
    setDimensions({ tileWidth: newWidth, tileHeight: newHeight });
  };

  const handleAutoGrid = () => {
    const { imageWidth, imageHeight, tileWidth, tileHeight, gridOffsetX, gridOffsetY } = useEditorStore.getState();
    if (!imageWidth || !imageHeight) {
      alert("No image dimensions found. Make sure the image is loaded.");
      return;
    }
    const newCols = Math.max(1, Math.round((imageWidth - gridOffsetX) / tileWidth));
    const newRows = Math.max(1, Math.round((imageHeight - gridOffsetY) / tileHeight));
    setDimensions({ cols: newCols, rows: newRows });
  };

  const handleSlice = () => {
    const spriteUrl = useEditorStore.getState().spriteUrl;
    if (!spriteUrl) {
      alert("Please upload a sprite sheet image first.");
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spriteUrl;
    img.onload = () => {
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          canvas.width = tileWidth;
          canvas.height = tileHeight;
          ctx.clearRect(0, 0, tileWidth, tileHeight);
          ctx.drawImage(
            img,
            c * tileWidth + gridOffsetX, r * tileHeight + gridOffsetY, tileWidth, tileHeight, // Source
            0, 0, tileWidth, tileHeight // Destination
          );

          // Check for emptiness (fully transparent pixels)
          const imageData = ctx.getImageData(0, 0, tileWidth, tileHeight);
          let isEmpty = true;
          for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 10) { // If alpha > 10 (slight tolerance for anti-aliasing)
              isEmpty = false;
              break;
            }
          }
          
          if (!isEmpty) {
            frames.push(canvas.toDataURL());
          }
        }
      }
      
      setFrames(frames);
    };
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-bold uppercase text-text-secondary">Slice Settings</h3>
      <div className="flex flex-col gap-4 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Cols</Label>
            <Input 
              type="number" 
              value={cols} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  const { imageWidth, gridOffsetX } = useEditorStore.getState();
                  const newWidth = Math.max(1, Math.round((imageWidth - gridOffsetX) / val));
                  setDimensions({ cols: val, tileWidth: newWidth });
                }
              }} 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rows</Label>
            <Input 
              type="number" 
              value={rows} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  const { imageHeight, gridOffsetY } = useEditorStore.getState();
                  const newHeight = Math.max(1, Math.round((imageHeight - gridOffsetY) / val));
                  setDimensions({ rows: val, tileHeight: newHeight });
                }
              }} 
            />
          </div>
            <div className="space-y-1">
            <Label className="text-xs">Tile Width</Label>
            <Input 
              type="number" 
              value={tileWidth} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  const { imageWidth, gridOffsetX } = useEditorStore.getState();
                  const newCols = Math.max(1, Math.round((imageWidth - gridOffsetX) / val));
                  setDimensions({ tileWidth: val, cols: newCols });
                }
              }} 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tile Height</Label>
            <Input 
              type="number" 
              value={tileHeight} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  const { imageHeight, gridOffsetY } = useEditorStore.getState();
                  const newRows = Math.max(1, Math.round((imageHeight - gridOffsetY) / val));
                  setDimensions({ tileHeight: val, rows: newRows });
                }
              }} 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Grid Offset X</Label>
            <Input 
              type="number" 
              value={gridOffsetX} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  const { imageWidth, cols } = useEditorStore.getState();
                  const newWidth = Math.max(1, Math.round((imageWidth - val) / cols));
                  setDimensions({ gridOffsetX: val, tileWidth: newWidth });
                }
              }} 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Grid Offset Y</Label>
            <Input 
              type="number" 
              value={gridOffsetY} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  const { imageHeight, rows } = useEditorStore.getState();
                  const newHeight = Math.max(1, Math.round((imageHeight - val) / rows));
                  setDimensions({ gridOffsetY: val, tileHeight: newHeight });
                }
              }} 
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 text-xs border border-accent/40 bg-slate-950 hover:bg-accent/10 hover:text-accent font-bold flex items-center justify-center gap-1.5 cursor-pointer" 
            onClick={handleAutoSpacer} 
            title="Detect spacing & grid dimensions automatically from image contents"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Smart Auto-Spacer
          </Button>

          <Button 
            variant="outline" 
            className="flex-1 text-xs border border-purple-500/40 bg-slate-950 hover:bg-purple-500/10 hover:text-purple-400 font-bold flex items-center justify-center gap-1.5 cursor-pointer" 
            onClick={handleAIGridDetect}
            disabled={isDetecting}
            title="Use Gemini AI vision to detect correct columns, rows, size and offsets"
          >
            <Brain className={`w-3.5 h-3.5 text-purple-400 ${isDetecting ? 'animate-pulse' : ''}`} />
            {isDetecting ? 'AI Analyzing...' : 'AI Grid Assist'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-xs cursor-pointer" onClick={handleAutoGrid} title="Calculate Cols/Rows from current Tile Size">
            <Wand2 className="w-3 h-3 mr-2" />
            Auto Grid
          </Button>
          <Button variant="outline" className="flex-1 text-xs cursor-pointer" onClick={handleAutoSize} title="Calculate Tile Size from current Cols/Rows">
            <Wand2 className="w-3 h-3 mr-2" />
            Auto Size
          </Button>
        </div>

        <Button className="w-full bg-accent text-white font-semibold cursor-pointer" onClick={handleSlice}>Slice Sprite Sheet</Button>
      </div>
    </div>
  );
}
