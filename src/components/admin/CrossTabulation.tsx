import { DestinationResult, Vote } from '@/types/poll';
import { ChevronDown, Table as TableIcon } from 'lucide-react';
import { LOCATION_TO_COUNTRY } from '@/lib/geoData';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface CrossTabulationProps {
  results: DestinationResult[];
  votes: Vote[];
}

export function CrossTabulation({ results, votes }: CrossTabulationProps) {
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [activeCol, setActiveCol] = useState<string | null>(null);
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

  const visibleRegions = useMemo(() => {
    if (activeCol) {
      return regions.filter(r => matrix[r][activeCol] > 0);
    }
    return regions.filter(r => !collapsedRows.has(r));
  }, [regions, collapsedRows, activeCol, matrix]);

  const visibleVotes = useMemo(() => {
    if (activeRow) {
      return activeVotes.filter(v => matrix[activeRow][v.id] > 0);
    }
    return activeVotes.filter(v => !collapsedCols.has(v.id));
  }, [activeVotes, collapsedCols, activeRow, matrix]);

  const toggleAllRows = (collapse: boolean) => {
    if (collapse) {
      setCollapsedRows(new Set(regions));
    } else {
      setCollapsedRows(new Set());
    }
    setActiveCol(null);
  };

  const toggleAllCols = (collapse: boolean) => {
    if (collapse) {
      setCollapsedCols(new Set(activeVotes.map(v => v.id)));
    } else {
      setCollapsedCols(new Set());
    }
    setActiveRow(null);
  };

  const toggleRow = (region: string) => {
    setActiveCol(null);
    if (activeRow === region) {
      setActiveRow(null);
    } else {
      setActiveRow(region);
    }
  };

  const toggleCol = (voterId: string) => {
    setActiveRow(null);
    if (activeCol === voterId) {
      setActiveCol(null);
    } else {
      setActiveCol(voterId);
    }
  };

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
      <CardContent className="p-0 max-h-[600px] overflow-auto">
        <Table className="relative border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-40 bg-background shadow-sm">
            <TableRow>
              <TableHead className="w-[50px] sticky left-0 top-0 z-50 bg-background border-r border-b text-center font-bold">
                #
              </TableHead>
              <TableHead className="min-w-[150px] sticky left-[50px] top-0 z-50 bg-background border-r border-b">
                Region / Voter
              </TableHead>
              {visibleVotes.map(v => (
                <TableHead key={v.id} className="min-w-[100px] text-center p-2 border-b sticky top-0 z-30 bg-background">
                  <div className="flex flex-col items-center gap-1">
                    <Button 
                      variant={activeCol === v.id ? "secondary" : "ghost"}
                      size="sm" 
                      className={cn("h-6 w-6 p-0", activeCol === v.id && "bg-primary/20 text-primary")}
                      onClick={() => toggleCol(v.id)}
                    >
                      <ChevronDown className={cn("h-3 w-3 transition-transform", activeCol === v.id && "rotate-180")} />
                    </Button>
                    <span className="text-[10px] truncate max-w-[80px] text-center">{v.name}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="min-w-[80px] text-center font-bold bg-muted/50 border-b sticky top-0 right-0 z-40">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRegions.map((region, idx) => (
              <TableRow key={region} className="hover:bg-muted/30">
                <TableCell className="sticky left-0 z-20 bg-background border-r text-center text-[10px] font-medium text-muted-foreground p-2 border-b">
                  {idx + 1}
                </TableCell>
                <TableCell className="font-medium sticky left-[50px] z-20 bg-background border-r p-2 border-b">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={activeRow === region ? "secondary" : "ghost"}
                      size="sm" 
                      className={cn("h-6 w-6 p-0", activeRow === region && "bg-primary/20 text-primary")}
                      onClick={() => toggleRow(region)}
                    >
                      <ChevronDown className={cn("h-3 w-3 transition-transform", activeRow === region && "rotate-180")} />
                    </Button>
                    <span className="text-sm">{region}</span>
                  </div>
                </TableCell>
                {visibleVotes.map(v => (
                  <TableCell key={v.id} className="text-center p-2 text-xs border-r border-b last:border-r-0">
                    {matrix[region][v.id] > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium">
                        {matrix[region][v.id]}
                      </span>
                    ) : <span className="text-muted-foreground/30">-</span>}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold bg-muted/30 sticky right-0 z-10 border-b">{rowTotals[region]}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 hover:bg-muted/50 sticky bottom-0 z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
              <TableCell className="sticky left-0 z-30 bg-muted/50 border-r"></TableCell>
              <TableCell className="font-bold sticky left-[50px] z-30 bg-muted/50 border-r p-3">Voter Totals</TableCell>
              {visibleVotes.map(v => (
                <TableCell key={v.id} className="text-center font-bold p-2">
                  {colTotals[v.id]}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-primary/10 text-primary p-3 sticky right-0 z-10">
                {Object.values(rowTotals).reduce((a, b) => a + b, 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
