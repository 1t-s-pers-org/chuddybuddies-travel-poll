import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Download, Upload, LogOut, BarChart3, Users, RotateCcw, History, Lock, Map as MapIcon, Table } from 'lucide-react';
import { WeightConfig } from './WeightConfig';
import { ResultsCharts } from './ResultsCharts';
import { Leaderboard } from './Leaderboard';
import { AllVotes } from './AllVotes';
import { MapResults } from './MapResults';
import { CrossTabulation } from './CrossTabulation';
import { Vote, WeightConfig as WeightConfigType, DestinationResult, PollRound } from '@/types/poll';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  votes: Vote[];
  rounds: PollRound[];
  weightConfig: WeightConfigType;
  hideResults: boolean;
  results: DestinationResult[];
  onWeightChange: (config: WeightConfigType) => void;
  onHideResultsChange: (hide: boolean) => void;
  onDeleteVote: (id: string) => void;
  onToggleExcludeVote: (id: string) => void;
  onArchiveAndReset: () => void;
  onChangePassword: (password: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onLogout: () => void;
}

export function AdminDashboard({
  votes,
  rounds,
  weightConfig,
  hideResults,
  results,
  onWeightChange,
  onHideResultsChange,
  onDeleteVote,
  onToggleExcludeVote,
  onArchiveAndReset,
  onChangePassword,
  onExport,
  onImport,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('results');
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters long",
        variant: "destructive"
      });
      return;
    }
    onChangePassword(newPassword);
    setNewPassword('');
    toast({
      title: "Success",
      description: "Admin password has been updated",
    });
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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => {
              if (window.confirm('This will archive the current results and start a new round. Continue?')) {
                onArchiveAndReset();
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            New Round
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

        <form onSubmit={handlePasswordChange} className="pt-4 border-t border-border space-y-3">
          <Label className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Admin Password
          </Label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-9"
            />
            <Button type="submit" size="sm" variant="secondary">
              Update
            </Button>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="results" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1">
            <MapIcon className="h-4 w-4" />
            Map
          </TabsTrigger>
          <TabsTrigger value="crosstab" className="flex items-center gap-1">
            <Table className="h-4 w-4" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="votes" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Votes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4 mt-4">
          <WeightConfig
            config={weightConfig}
            onChange={onWeightChange}
            totalParticipants={votes.length}
          />
          <div className="text-center py-2 bg-muted/30 rounded-md border border-dashed border-border mb-2">
            <span className="text-sm font-medium text-muted-foreground">Current Round: #{rounds.length + 1}</span>
          </div>
          <ResultsCharts results={results} />
          <Leaderboard results={results} />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <MapResults results={results} />
        </TabsContent>

        <TabsContent value="crosstab" className="mt-4">
          <CrossTabulation results={results} votes={votes} />
        </TabsContent>

        <TabsContent value="votes" className="mt-4">
          <AllVotes 
            votes={votes} 
            onDelete={onDeleteVote} 
            onToggleExclude={onToggleExcludeVote} 
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          {rounds.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No archived rounds yet.</p>
              </CardContent>
            </Card>
          ) : (
            [...rounds].reverse().map((round) => (
              <Card key={round.id} className="shadow-lg border-0 overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b border-border flex justify-between items-center">
                  <span className="font-semibold">Round #{round.roundNumber}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(round.timestamp), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-background rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Votes</div>
                      <div className="font-bold">{round.votes.length}</div>
                    </div>
                    <div className="p-2 bg-background rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Top Choice</div>
                      <div className="font-bold truncate">{round.results[0]?.name || 'N/A'}</div>
                    </div>
                    <div className="p-2 bg-background rounded-md border border-border">
                      <div className="text-xs text-muted-foreground">Points</div>
                      <div className="font-bold">{round.results[0]?.totalPoints || 0}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leaderboard</p>
                    {round.results.slice(0, 3).map((res, i) => (
                      <div key={res.name} className="flex justify-between items-center text-sm p-2 bg-background rounded border border-border">
                        <span className="flex items-center gap-2">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                            i === 0 ? "bg-gold text-gold-foreground" : 
                            i === 1 ? "bg-silver text-silver-foreground" : 
                            "bg-bronze text-bronze-foreground"
                          )}>
                            {i + 1}
                          </span>
                          {res.name}
                        </span>
                        <span className="font-mono font-medium">{res.totalPoints} pts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
