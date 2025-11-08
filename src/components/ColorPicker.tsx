import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#4CAF50', // Green (Primary)
  '#2196F3', // Blue (Secondary)
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#64748b', // Slate
  '#0ea5e9', // Sky
];

export const ColorPicker = ({ value, onChange, className }: ColorPickerProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  // Sync customColor when value changes externally
  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      onChange(color);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-10 w-20 p-0 border-2 shadow-sm transition-all relative overflow-hidden',
                'hover:border-primary/50 hover:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'bg-transparent hover:bg-transparent'
              )}
              style={{ 
                backgroundColor: value,
                borderColor: open ? 'hsl(var(--primary))' : 'hsl(var(--border))'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              {open && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                  <Check className="h-4 w-4 text-white drop-shadow-md" />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="start">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">{t('coresPredefinidas')}</label>
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handlePresetClick(color)}
                      className={cn(
                        'h-8 w-8 rounded-md border-2 transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        value === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {value === color && (
                        <div className="flex h-full items-center justify-center">
                          <Check className="h-3 w-3 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t('corPersonalizada')}</label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-16 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: customColor }}
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </div>
  );
};

