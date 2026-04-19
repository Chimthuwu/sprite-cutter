import { useEditorStore } from '../stores/useEditorStore';
import { Button } from '../../components/ui/button';
import { Upload } from 'lucide-react';

export function FileUploader() {
  const setSpriteSheet = useEditorStore((state) => state.setSpriteSheet);

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-3 text-text-secondary hover:border-accent transition-colors cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="sprite-upload"
        onChange={(e) => e.target.files && setSpriteSheet(e.target.files[0])}
      />
      <label htmlFor="sprite-upload" className="flex flex-col items-center gap-2 cursor-pointer">
        <Upload className="w-8 h-8" />
        <span className="text-sm">Upload Sprite Sheet</span>
      </label>
    </div>
  );
}
