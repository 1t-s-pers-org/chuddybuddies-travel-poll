import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { DestinationResult } from '@/types/poll';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  results: DestinationResult[];
}

export function Leaderboard({ results }: LeaderboardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-gold';
    if (index === 1) return 'text-silver';
    if (index === 2) return 'text-bronze';
    return 'text-muted-foreground';
  };

  const getMedalBg = (index: number) => {
    if (index === 0) return 'bg-gold/10';
    if (index === 1) return 'bg-silver/10';
    if (index === 2) return 'bg-bronze/10';
    return 'bg-muted';
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          Detailed Rankings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.map((result, index) => (
          <div
            key={result.name}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm',
                  getMedalBg(index),
                  getMedalColor(index)
                )}>
                  {index + 1}
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{result.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.totalPoints} pts
                  </p>
                </div>
              </div>
              {expandedIndex === index ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedIndex === index && (
              <div className="px-3 pb-3 pt-1 border-t border-border bg-muted/30">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-card">
                    <p className="text-lg font-bold text-gold">{result.firstVotes}</p>
                    <p className="text-xs text-muted-foreground">1st votes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-card">
                    <p className="text-lg font-bold text-silver">{result.secondVotes}</p>
                    <p className="text-xs text-muted-foreground">2nd votes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-card">
                    <p className="text-lg font-bold text-bronze">{result.thirdVotes}</p>
                    <p className="text-xs text-muted-foreground">3rd votes</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Voters:</p>
                  <p className="text-sm text-foreground">
                    {result.voters.join(', ') || 'No voters'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
