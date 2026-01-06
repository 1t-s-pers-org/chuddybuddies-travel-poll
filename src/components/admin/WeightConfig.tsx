import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeightConfig as WeightConfigType, DEFAULT_WEIGHT_CONFIGS } from '@/types/poll';
import { cn } from '@/lib/utils';

interface WeightConfigProps {
  config: WeightConfigType;
  onChange: (config: WeightConfigType) => void;
  totalParticipants: number;
}

export function WeightConfig({ config, onChange, totalParticipants }: WeightConfigProps) {
  const handlePresetSelect = (preset: WeightConfigType) => {
    onChange(preset);
  };

  const handleCustomChange = (field: 'first' | 'second' | 'third', value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({
      ...config,
      id: 'custom',
      name: 'Custom',
      [field]: numValue,
    });
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Weight Configuration</CardTitle>
          <span className="text-sm text-muted-foreground">
            {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {DEFAULT_WEIGHT_CONFIGS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                config.id === preset.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className={cn(
                'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                config.id === preset.id ? 'border-primary' : 'border-muted-foreground'
              )}>
                {config.id === preset.id && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-sm font-medium">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <Label className="text-sm text-muted-foreground mb-3 block">
            Custom point values
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">1st Place</Label>
              <Input
                type="number"
                min="0"
                value={config.first}
                onChange={(e) => handleCustomChange('first', e.target.value)}
                className="text-center"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">2nd Place</Label>
              <Input
                type="number"
                min="0"
                value={config.second}
                onChange={(e) => handleCustomChange('second', e.target.value)}
                className="text-center"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">3rd Place</Label>
              <Input
                type="number"
                min="0"
                value={config.third}
                onChange={(e) => handleCustomChange('third', e.target.value)}
                className="text-center"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
