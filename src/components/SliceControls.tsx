import { useEditorStore } from '@/stores/useEditorStore';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Wand2 } from 'lucide-react';

export function SliceControls() {
  const { cols, rows, tileWidth, tileHeight, gridOffsetX, gridOffsetY, setDimensions, spriteSheet, setFrames } = useEditorStore();

  const handleAutoSize = () => {
    const spriteUrl = useEditorStore.getState().spriteUrl;
    if (!spriteUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spriteUrl;
    img.onload = () => {
      const newWidth = Math.max(1, Math.round(img.width / cols));
      const newHeight = Math.max(1, Math.round(img.height / rows));
      setDimensions({ tileWidth: newWidth, tileHeight: newHeight });
    };
  };

  const handleAutoGrid = () => {
    const spriteUrl = useEditorStore.getState().spriteUrl;
    if (!spriteUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = spriteUrl;
    img.onload = () => {
      const newCols = Math.max(1, Math.round(img.width / tileWidth));
      const newRows = Math.max(1, Math.round(img.height / tileHeight));
      setDimensions({ cols: newCols, rows: newRows });
    };
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
                if (!isNaN(val)) setDimensions({ cols: val });
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
                if (!isNaN(val)) setDimensions({ rows: val });
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
                if (!isNaN(val)) setDimensions({ tileWidth: val });
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
                if (!isNaN(val)) setDimensions({ tileHeight: val });
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
                if (!isNaN(val)) setDimensions({ gridOffsetX: val });
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
                if (!isNaN(val)) setDimensions({ gridOffsetY: val });
              }} 
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-xs" onClick={handleAutoGrid} title="Calculate Cols/Rows from current Tile Size">
            <Wand2 className="w-3 h-3 mr-2" />
            Auto Grid
          </Button>
          <Button variant="outline" className="flex-1 text-xs" onClick={handleAutoSize} title="Calculate Tile Size from current Cols/Rows">
            <Wand2 className="w-3 h-3 mr-2" />
            Auto Size
          </Button>
        </div>

        <Button className="w-full bg-accent text-white font-semibold" onClick={handleSlice}>Slice Sprite Sheet</Button>
      </div>
    </div>
  );
}
