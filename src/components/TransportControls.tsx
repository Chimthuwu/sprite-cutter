import { useEditorStore } from '@/stores/useEditorStore';
import { Button } from "../../components/ui/button";
import { Play, Pause } from 'lucide-react';
import { useEffect } from 'react';

export function TransportControls() {
  const { isPlaying, setIsPlaying, frames, setCurrentFrameIndex, selectedFrameIndex } = useEditorStore();
  const handlePlay = () => {
    if (isPlaying) return;
    if (frames.length === 0) return; // Cannot play if no frames
    // Starting play: ensure we start from the current selection if available
    setCurrentFrameIndex(selectedFrameIndex ?? 0);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && frames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % frames.length);
      }, 200); // 5 FPS
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames, setCurrentFrameIndex]);

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant={!isPlaying ? "secondary" : "ghost"} 
        size="sm" 
        onClick={handlePlay}
        className="h-8 w-8 p-0"
      >
        <Play size={16} />
      </Button>
      <Button 
        variant={isPlaying ? "secondary" : "ghost"} 
        size="sm" 
        onClick={handlePause}
        className="h-8 w-8 p-0"
      >
        <Pause size={16} />
      </Button>
    </div>
  );
}
