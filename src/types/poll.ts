export interface Vote {
  id: string;
  name: string;
  firstChoice: string;
  secondChoice: string;
  thirdChoice: string;
  createdAt: string;
  updatedAt: string;
  excluded?: boolean;
}

export interface WeightConfig {
  id: string;
  name: string;
  first: number;
  second: number;
  third: number;
}

export const DEFAULT_WEIGHT_CONFIGS: WeightConfig[] = [
  { id: 'default', name: 'Default (3-2-1)', first: 3, second: 2, third: 1 },
  { id: 'light', name: 'Lightly Skewed (5-3-1)', first: 5, second: 3, third: 1 },
  { id: 'heavy', name: 'Heavily Skewed (10-5-2)', first: 10, second: 5, third: 2 },
];

export interface DestinationResult {
  name: string;
  totalPoints: number;
  firstVotes: number;
  secondVotes: number;
  thirdVotes: number;
  voters: string[];
}
