import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Users } from 'lucide-react';
import { Vote } from '@/types/poll';
import { format } from 'date-fns';

interface AllVotesProps {
  votes: Vote[];
  onDelete: (id: string) => void;
}

export function AllVotes({ votes, onDelete }: AllVotesProps) {
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
            className="flex items-start justify-between p-3 border border-border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{vote.name}</p>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vote.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
