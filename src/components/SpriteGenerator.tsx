import { useState } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Wand2, Sparkles, AlertCircle, Play } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const PRESETS = [
  {
    name: 'Pixel Wizard (Default)',
    url: 'https://i.ibb.co/KzS51L5v/image.png',
    prompt: '8-bit retro wizard spell casting animation sprite sheet',
    cols: 8,
    rows: 3,
    width: 128,
    height: 128,
  },
  {
    name: 'Red Dragon Flight',
    url: 'https://i.ibb.co/Z6MgzMmq/image.png', // Fallback or preset
    prompt: '2d pixel art red dragon flying cycle sprite sheet',
    cols: 4,
    rows: 2,
    width: 96,
    height: 96,
  },
  {
    name: 'Sci-Fi Robot Idle',
    url: 'https://i.ibb.co/G3Xm8q7W/image.png',
    prompt: 'futuristic robot walking cycle, side view, pixel art sprite sheet',
    cols: 6,
    rows: 1,
    width: 64,
    height: 64,
  }
];

export function SpriteGenerator() {
  const { apiKey, setSpriteUrl, isGenerating, setIsGenerating, setDimensions } = useEditorStore();
  const [prompt, setPrompt] = useState('retro 2d pixel art knight walking cycle, side view, horizontal sprite sheet, transparent background');
  const [frameCount, setFrameCount] = useState('8');
  const [style, setStyle] = useState('pixel-art');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    if (!apiKey) {
      setError('Please configure your Gemini API Key in the top-right settings to run live AI generations.');
      return;
    }

    setIsGenerating(true);
    try {
      const fullPrompt = `${prompt}. Arrange exactly ${frameCount} frames horizontally. Style: ${style}. Isolated on transparent/solid background, perfectly spaced grid.`;
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!imageBytes) {
        throw new Error('No image was returned from the model.');
      }

      const imageUrl = `data:image/png;base64,${imageBytes}`;
      setSpriteUrl(imageUrl);

      // Auto-set initial grid dimensions based on frameCount
      const frames = parseInt(frameCount) || 8;
      setDimensions({
        cols: frames,
        rows: 1,
        gridOffsetX: 0,
        gridOffsetY: 0,
      });

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to generate sprite sheet. Please check your API key and network connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPreset = (presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;
    setSpriteUrl(preset.url);
    setDimensions({
      cols: preset.cols,
      rows: preset.rows,
      tileWidth: preset.width,
      tileHeight: preset.height,
      gridOffsetX: 0,
      gridOffsetY: 0,
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-text-secondary flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent" />
          AI Sprite Sheet Generator
        </h3>
      </div>

      <div className="space-y-4">
        {/* Prompt Input */}
        <div className="space-y-1">
          <Label className="text-xs">Prompt</Label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. pixel art character running animation"
            className="w-full h-20 rounded-md border border-border bg-slate-900/40 p-2.5 text-xs text-text-primary placeholder:text-slate-500 focus:outline-none focus:border-accent resize-none transition-colors"
          />
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Style Preset</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-full text-xs bg-slate-900/40 border-border">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-border text-xs">
                <SelectItem value="pixel-art">Pixel Art (Recommended)</SelectItem>
                <SelectItem value="isometric-pixel">Isometric Pixel Art</SelectItem>
                <SelectItem value="vector-cartoon">2D Vector Cartoon</SelectItem>
                <SelectItem value="retro-arcade">Retro Arcade (16-bit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Frame Count</Label>
            <Select value={frameCount} onValueChange={setFrameCount}>
              <SelectTrigger className="w-full text-xs bg-slate-900/40 border-border">
                <SelectValue placeholder="Frames" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-border text-xs">
                <SelectItem value="4">4 Frames</SelectItem>
                <SelectItem value="6">6 Frames</SelectItem>
                <SelectItem value="8">8 Frames</SelectItem>
                <SelectItem value="12">12 Frames</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-[11px] text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin text-xs">...</span>
              Generating Spaced Sheet...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Sprite Sheet
            </>
          )}
        </Button>
      </div>

      {/* Preset Fallbacks Section */}
      <div className="border-t border-border/60 pt-4 mt-2">
        <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2.5">
          Or Load Premium Presets
        </h4>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleLoadPreset(index)}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-border/40 hover:border-accent/40 text-left transition-all text-xs cursor-pointer group"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] text-text-secondary truncate max-w-[200px]">
                  {preset.prompt}
                </span>
              </div>
              <Play className="w-3.5 h-3.5 text-text-secondary group-hover:text-accent transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
