import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Users, EyeOff, Eye } from 'lucide-react';
import { Vote } from '@/types/poll';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AllVotesProps {
  votes: Vote[];
  onDelete: (id: string) => void;
  onToggleExclude: (id: string) => void;
}

export function AllVotes({ votes, onDelete, onToggleExclude }: AllVotesProps) {
  if (votes.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No votes submitted yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          All Votes ({votes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {votes.map((vote) => (
          <div
            key={vote.id}
            className={cn(
              "flex items-start justify-between p-3 border rounded-lg transition-opacity",
              vote.excluded ? "bg-muted/50 border-muted opacity-60" : "border-border"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{vote.name}</p>
                {vote.excluded && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    Excluded
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                <p>
                  <span className="text-gold font-medium">1st:</span> {vote.firstChoice || '—'}
                </p>
                <p>
                  <span className="text-silver font-medium">2nd:</span> {vote.secondChoice || '—'}
                </p>
                <p>
                  <span className="text-bronze font-medium">3rd:</span> {vote.thirdChoice || '—'}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Last edited: {format(new Date(vote.updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleExclude(vote.id)}
                className={cn(
                  "hover:bg-accent",
                  vote.excluded ? "text-primary" : "text-muted-foreground"
                )}
                title={vote.excluded ? "Include in results" : "Exclude from results"}
              >
                {vote.excluded ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(vote.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
