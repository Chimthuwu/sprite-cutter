import { useEditorStore } from '@/stores/useEditorStore';
import { Button } from "../../components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function ZoomControls() {
  const { zoom, setZoom } = useEditorStore();

  return (
    <div className="flex bg-slate-900 rounded-md p-1 shadow-lg border border-border gap-1">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(zoom - 10)}>
        <ZoomOut size={16} />
      </Button>
      <div className="text-xs font-mono flex items-center min-w-[3rem] justify-center text-text-secondary">{zoom}%</div>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(zoom + 10)}>
        <ZoomIn size={16} />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(100)}>
        <RotateCcw size={16} />
      </Button>
    </div>
  );
}
