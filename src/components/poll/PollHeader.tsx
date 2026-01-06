import { Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PollHeaderProps {
  totalVotes: number;
}

export function PollHeader({ totalVotes }: PollHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-accent to-primary px-6 py-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Plane className="h-8 w-8 text-primary-foreground" />
        <h1 className="text-2xl font-bold text-primary-foreground">
          Travel Destination Poll
        </h1>
      </div>
      <Badge 
        variant="secondary" 
        className="mt-3 bg-card/20 text-primary-foreground border-0 px-4 py-1"
      >
        Total Votes: {totalVotes}
      </Badge>
    </div>
  );
}
