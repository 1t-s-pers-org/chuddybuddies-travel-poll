import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DestinationResult } from '@/types/poll';

interface ResultsChartsProps {
  results: DestinationResult[];
}

const COLORS = [
  'hsl(258, 90%, 66%)',
  'hsl(220, 70%, 55%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(180, 60%, 45%)',
  'hsl(30, 80%, 55%)',
];

export function ResultsCharts({ results }: ResultsChartsProps) {
  const pointsData = results.slice(0, 8).map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + '...' : r.name,
    fullName: r.name,
    points: r.totalPoints,
  }));

  const votersData = results.slice(0, 8).map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + '...' : r.name,
    fullName: r.name,
    voters: r.voters.length,
  }));

  if (results.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="py-12 text-center text-muted-foreground">
          No votes yet. Results will appear here once votes are submitted.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Total Points by Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="points" radius={[0, 4, 4, 0]}>
                  {pointsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Number of Voters per Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={votersData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="voters" radius={[0, 4, 4, 0]}>
                  {votersData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
