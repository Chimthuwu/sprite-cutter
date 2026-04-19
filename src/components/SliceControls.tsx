import { useEditorStore } from '@/stores/useEditorStore';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

export function SliceControls() {
  const { cols, rows, tileWidth, tileHeight, setDimensions, spriteSheet, setFrames } = useEditorStore();

  const handleSlice = () => {
    if (!spriteSheet) {
      alert("Please upload a sprite sheet image first.");
      return;
    }

    const img = new Image();
    img.src = useEditorStore.getState().spriteUrl!;
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
            c * tileWidth, r * tileHeight, tileWidth, tileHeight, // Source
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
        </div>
        <Button className="w-full bg-accent text-white font-semibold" onClick={handleSlice}>Slice Sprite Sheet</Button>
      </div>
    </div>
  );
}
