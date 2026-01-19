import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, LineChart, Trophy, Medal, Award } from 'lucide-react';
import { DestinationResult } from '@/types/poll';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  results: DestinationResult[];
}

export function Leaderboard({ results }: LeaderboardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (results.length === 0) {
    return null;
  }

  const totalVotes = results.reduce((acc, curr) => acc + curr.totalPoints, 0);

  const getRankStyles = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: <Trophy className="h-5 w-5 text-[#EAB308]" />,
          bg: "bg-[#FFFBEB]",
          bar: "bg-[#FDE68A]",
          text: "text-[#854D0E]",
          rank: "1"
        };
      case 1:
        return {
          icon: <Medal className="h-5 w-5 text-[#94A3B8]" />,
          bg: "bg-[#F8FAFC]",
          bar: "bg-[#E2E8F0]",
          text: "text-[#475569]",
          rank: "2"
        };
      case 2:
        return {
          icon: <Medal className="h-5 w-5 text-[#D97706]" />,
          bg: "bg-[#FFF7ED]",
          bar: "bg-[#FFEDD5]",
          text: "text-[#9A3412]",
          rank: "3"
        };
      case 3:
        return {
          icon: <span className="text-sm font-bold text-[#0EA5E9]">4</span>,
          bg: "bg-[#F0F9FF]",
          bar: "bg-[#E0F2FE]",
          text: "text-[#0369A1]",
          rank: "4"
        };
      default:
        return {
          icon: <span className="text-sm font-bold text-[#0EA5E9]">{index + 1}</span>,
          bg: "bg-[#F0F9FF]",
          bar: "bg-[#E0F2FE]",
          text: "text-[#0369A1]",
          rank: String(index + 1)
        };
    }
  };

  return (
    <Card className="shadow-none border-0 bg-transparent">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#0EA5E9] flex items-center justify-center">
            <LineChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-[#1E293B]">Leaderboard</CardTitle>
            <p className="text-sm text-[#64748B]">{totalVotes} total points</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        {results.map((result, index) => {
          const styles = getRankStyles(index);
          const percentage = Math.round((result.totalPoints / totalVotes) * 100);
          
          return (
            <div key={result.name} className="relative">
              <div 
                className={cn(
                  "relative z-10 flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] overflow-hidden group transition-all hover:shadow-md cursor-pointer",
                  styles.bg
                )}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                {/* Progress Bar Background Overlay */}
                <div 
                  className={cn("absolute inset-y-0 left-0 z-0 transition-all duration-1000 ease-out", styles.bar)}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm shadow-sm border border-white/40">
                    {styles.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {index === 0 ? "🏝️" : index === 1 ? "🗼" : index === 2 ? "🏛️" : index === 3 ? "🗼" : "🗽"}
                    </span>
                    <span className="font-bold text-[#1E293B]">{result.name}</span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#1E293B]">{result.totalPoints}</span>
                    <span className="text-sm text-[#64748B] ml-1">({percentage}%)</span>
                  </div>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-[#64748B]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#64748B]" />
                  )}
                </div>
              </div>

              {expandedIndex === index && (
                <div className="mx-4 p-4 pt-6 -mt-3 rounded-b-xl border-x border-b border-[#E2E8F0] bg-white/50 backdrop-blur-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#FFFBEB]/50 border border-[#FDE68A]/30 text-center">
                      <p className="text-lg font-bold text-[#854D0E]">{result.firstVotes}</p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-[#854D0E]/60">1st votes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FAFC]/50 border border-[#E2E8F0]/30 text-center">
                      <p className="text-lg font-bold text-[#475569]">{result.secondVotes}</p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-[#475569]/60">2nd votes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FFF7ED]/50 border border-[#FFEDD5]/30 text-center">
                      <p className="text-lg font-bold text-[#9A3412]">{result.thirdVotes}</p>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-[#9A3412]/60">3rd votes</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] mb-2">Detailed Voter List</p>
                    <div className="flex flex-wrap gap-2">
                      {result.voters.map((voter) => (
                        <span key={voter} className="px-2 py-1 rounded-md bg-[#F1F5F9] text-[#475569] text-xs font-medium border border-[#E2E8F0]">
                          {voter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
