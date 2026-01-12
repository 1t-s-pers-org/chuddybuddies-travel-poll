import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, LogOut, BarChart3, Users } from 'lucide-react';
import { WeightConfig } from './WeightConfig';
import { ResultsCharts } from './ResultsCharts';
import { Leaderboard } from './Leaderboard';
import { AllVotes } from './AllVotes';
import { Vote, WeightConfig as WeightConfigType, DestinationResult } from '@/types/poll';

interface AdminDashboardProps {
  votes: Vote[];
  weightConfig: WeightConfigType;
  hideResults: boolean;
  results: DestinationResult[];
  onWeightChange: (config: WeightConfigType) => void;
  onHideResultsChange: (hide: boolean) => void;
  onDeleteVote: (id: string) => void;
  onToggleExcludeVote: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onLogout: () => void;
}

export function AdminDashboard({
  votes,
  weightConfig,
  hideResults,
  results,
  onWeightChange,
  onHideResultsChange,
  onDeleteVote,
  onToggleExcludeVote,
  onExport,
  onImport,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('results');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Controls */}
      <div className="bg-card rounded-lg p-4 shadow-lg border-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Admin Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Label htmlFor="hide-results" className="text-sm">
            Hide Results from Public
          </Label>
          <Switch
            id="hide-results"
            checked={hideResults}
            onCheckedChange={onHideResultsChange}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="votes" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            All Votes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4 mt-4">
          <WeightConfig
            config={weightConfig}
            onChange={onWeightChange}
            totalParticipants={votes.length}
          />
          <ResultsCharts results={results} />
          <Leaderboard results={results} />
        </TabsContent>

        <TabsContent value="votes" className="mt-4">
          <AllVotes 
            votes={votes} 
            onDelete={onDeleteVote} 
            onToggleExclude={onToggleExcludeVote} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
