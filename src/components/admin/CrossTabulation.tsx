import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DestinationResult, Vote } from '@/types/poll';
import { ChevronDown, ChevronRight, Table as TableIcon } from 'lucide-react';
import { LOCATION_TO_COUNTRY } from '@/lib/geoData';

interface CrossTabulationProps {
  results: DestinationResult[];
  votes: Vote[];
}

export function CrossTabulation({ results, votes }: CrossTabulationProps) {
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(new Set());
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set());

  const activeVotes = useMemo(() => votes.filter(v => !v.excluded), [votes]);

  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    results.forEach(r => {
      const region = LOCATION_TO_COUNTRY[r.name.toLowerCase()] || r.name;
      uniqueRegions.add(region.charAt(0).toUpperCase() + region.slice(1));
    });
    return Array.from(uniqueRegions).sort();
  }, [results]);

  const toggleAllRows = (collapse: boolean) => {
    if (collapse) {
      setCollapsedRows(new Set(regions));
    } else {
      setCollapsedRows(new Set());
    }
  };

  const toggleAllCols = (collapse: boolean) => {
    if (collapse) {
      setCollapsedCols(new Set(activeVotes.map(v => v.id)));
    } else {
      setCollapsedCols(new Set());
    }
  };

  const toggleRow = (region: string) => {
    const newSet = new Set(collapsedRows);
    if (newSet.has(region)) newSet.delete(region);
    else newSet.add(region);
    setCollapsedRows(newSet);
  };

  const toggleCol = (voterId: string) => {
    const newSet = new Set(collapsedCols);
    if (newSet.has(voterId)) newSet.delete(voterId);
    else newSet.add(voterId);
    setCollapsedCols(newSet);
  };

  const matrix = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    
    regions.forEach(r => {
      data[r] = {};
      activeVotes.forEach(v => {
        data[r][v.id] = 0;
      });
    });

    activeVotes.forEach(v => {
      [v.firstChoice, v.secondChoice, v.thirdChoice].forEach((choice, index) => {
        if (!choice) return;
        const region = (LOCATION_TO_COUNTRY[choice.toLowerCase()] || choice);
        const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
        if (data[formattedRegion]) {
          const points = index === 0 ? 3 : index === 1 ? 2 : 1;
          data[formattedRegion][v.id] += points;
        }
      });
    });

    return data;
  }, [regions, activeVotes]);

  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    regions.forEach(r => {
      totals[r] = Object.values(matrix[r]).reduce((a, b) => a + b, 0);
    });
    return totals;
  }, [regions, matrix]);

  const colTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    activeVotes.forEach(v => {
      totals[v.id] = regions.reduce((acc, r) => acc + matrix[r][v.id], 0);
    });
    return totals;
  }, [regions, activeVotes, matrix]);

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TableIcon className="h-5 w-5" />
          Cross Tabulation Matrix
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <span className="text-[10px] font-medium px-2 uppercase tracking-wider text-muted-foreground">Rows</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px]"
              onClick={() => toggleAllRows(true)}
            >
              - Collapse
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px]"
              onClick={() => toggleAllRows(false)}
            >
              + Expand
            </Button>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <span className="text-[10px] font-medium px-2 uppercase tracking-wider text-muted-foreground">Cols</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px]"
              onClick={() => toggleAllCols(true)}
            >
              - Collapse
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px]"
              onClick={() => toggleAllCols(false)}
            >
              + Expand
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px] sticky left-0 bg-background z-20 border-r">
                Region / Voter
              </TableHead>
              {activeVotes.map(v => (
                <TableHead key={v.id} className="min-w-[100px] text-center p-2">
                  <div className="flex flex-col items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => toggleCol(v.id)}
                    >
                      {collapsedCols.has(v.id) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    <span className="text-[10px] truncate max-w-[80px]">{v.name}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[80px] text-center font-bold bg-muted/50">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.map(region => (
              <TableRow key={region}>
                <TableCell className="font-medium sticky left-0 bg-background z-10 border-r p-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRow(region)}
                    >
                      {collapsedRows.has(region) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    <span className="text-sm">{region}</span>
                  </div>
                </TableCell>
                {activeVotes.map(v => (
                  <TableCell key={v.id} className="text-center p-2 text-xs">
                    {!collapsedRows.has(region) && !collapsedCols.has(v.id) ? (
                      matrix[region][v.id] > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium">
                          {matrix[region][v.id]}
                        </span>
                      ) : <span className="text-muted-foreground/30">-</span>
                    ) : (
                      <span className="text-muted-foreground/20 italic">...</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold bg-muted/30">{rowTotals[region]}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableCell className="font-bold sticky left-0 bg-muted/50 z-10 border-r p-3">Voter Totals</TableCell>
              {activeVotes.map(v => (
                <TableCell key={v.id} className="text-center font-bold p-2">
                  {colTotals[v.id]}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-primary/10 text-primary p-3">
                {Object.values(rowTotals).reduce((a, b) => a + b, 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
