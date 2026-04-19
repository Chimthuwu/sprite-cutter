import { useEditorStore } from '@/stores/useEditorStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SliceControls() {
  const { cols, rows, tileWidth, tileHeight, setDimensions } = useEditorStore();

  return (
    <Accordion type="single" collapsible defaultValue="slice-settings" className="w-full">
      <AccordionItem value="slice-settings" className="border-border">
        <AccordionTrigger className="text-sm font-bold uppercase text-text-secondary">Slice Settings</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Cols</Label>
              <Input type="number" value={cols} onChange={(e) => setDimensions({ cols: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Rows</Label>
              <Input type="number" value={rows} onChange={(e) => setDimensions({ rows: parseInt(e.target.value) })} />
            </div>
             <div className="space-y-1">
              <Label className="text-xs">Tile Width</Label>
              <Input type="number" value={tileWidth} onChange={(e) => setDimensions({ tileWidth: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tile Height</Label>
              <Input type="number" value={tileHeight} onChange={(e) => setDimensions({ tileHeight: parseInt(e.target.value) })} />
            </div>
          </div>
          <Button className="w-full bg-accent text-white font-semibold">Slice Sprite Sheet</Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
