import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Vote } from '@/types/poll';
import { toast } from '@/hooks/use-toast';
import { validatePollSubmission } from '@/lib/validation';

interface PollFormProps {
  onSubmit: (vote: Omit<Vote, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// Maximum character limits for inputs
const MAX_NAME_LENGTH = 100;
const MAX_CHOICE_LENGTH = 200;

export function PollForm({ onSubmit }: PollFormProps) {
  const [name, setName] = useState('');
  const [firstChoice, setFirstChoice] = useState('');
  const [secondChoice, setSecondChoice] = useState('');
  const [thirdChoice, setThirdChoice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all inputs using zod schema
    const validationResult = validatePollSubmission({
      name,
      firstChoice,
      secondChoice,
      thirdChoice,
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.errors?.[0] || 'Invalid input';
      toast({ title: errorMessage, variant: 'destructive' });
      return;
    }

    const validatedData = validationResult.data!;
    
    onSubmit({
      name: validatedData.name,
      firstChoice: validatedData.firstChoice,
      secondChoice: validatedData.secondChoice || '',
      thirdChoice: validatedData.thirdChoice || '',
    });

    setName('');
    setFirstChoice('');
    setSecondChoice('');
    setThirdChoice('');

    toast({ title: 'Vote submitted successfully!' });
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Submit Your Vote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="first" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-foreground">
                1
              </span>
              First Choice
            </Label>
            <Input
              id="first"
              placeholder="Your top destination"
              value={firstChoice}
              onChange={(e) => setFirstChoice(e.target.value)}
              maxLength={MAX_CHOICE_LENGTH}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="second" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-silver text-xs font-bold text-foreground">
                2
              </span>
              Second Choice
            </Label>
            <Input
              id="second"
              placeholder="Your second destination"
              value={secondChoice}
              onChange={(e) => setSecondChoice(e.target.value)}
              maxLength={MAX_CHOICE_LENGTH}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="third" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bronze text-xs font-bold text-foreground">
                3
              </span>
              Third Choice
            </Label>
            <Input
              id="third"
              placeholder="Your third destination"
              value={thirdChoice}
              onChange={(e) => setThirdChoice(e.target.value)}
              maxLength={MAX_CHOICE_LENGTH}
            />
          </div>

          <Button type="submit" className="w-full mt-6" size="lg">
            Submit Vote
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
