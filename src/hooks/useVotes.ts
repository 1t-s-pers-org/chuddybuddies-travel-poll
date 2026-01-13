import { useState, useEffect, useCallback } from 'react';
import { Vote, WeightConfig, DestinationResult, DEFAULT_WEIGHT_CONFIGS, PollRound } from '@/types/poll';

const VOTES_KEY = 'travel-poll-votes';
const ADMIN_PASSWORD_KEY = 'travel-poll-admin-password';
const WEIGHT_CONFIG_KEY = 'travel-poll-weight-config';
const HIDE_RESULTS_KEY = 'travel-poll-hide-results';
const POLL_ROUNDS_KEY = 'travel-poll-rounds';

const DEFAULT_ADMIN_PASSWORD = 'admin123';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [rounds, setRounds] = useState<PollRound[]>([]);
  const [weightConfig, setWeightConfigState] = useState<WeightConfig>(DEFAULT_WEIGHT_CONFIGS[0]);
  const [hideResults, setHideResultsState] = useState(false);

  useEffect(() => {
    const storedVotes = localStorage.getItem(VOTES_KEY);
    if (storedVotes) {
      setVotes(JSON.parse(storedVotes));
    }

    const storedRounds = localStorage.getItem(POLL_ROUNDS_KEY);
    if (storedRounds) {
      setRounds(JSON.parse(storedRounds));
    }

    const storedWeight = localStorage.getItem(WEIGHT_CONFIG_KEY);
    if (storedWeight) {
      setWeightConfigState(JSON.parse(storedWeight));
    }

    const storedHide = localStorage.getItem(HIDE_RESULTS_KEY);
    if (storedHide) {
      setHideResultsState(JSON.parse(storedHide));
    }

    // Initialize admin password if not set
    if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
      localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD);
    }
  }, []);

  const saveVotes = useCallback((newVotes: Vote[]) => {
    setVotes(newVotes);
    localStorage.setItem(VOTES_KEY, JSON.stringify(newVotes));
  }, []);

  const addVote = useCallback((vote: Omit<Vote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newVote: Vote = {
      ...vote,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    saveVotes([...votes, newVote]);
    return newVote;
  }, [votes, saveVotes]);

  const deleteVote = useCallback((id: string) => {
    saveVotes(votes.filter(v => v.id !== id));
  }, [votes, saveVotes]);

  const toggleExcludeVote = useCallback((id: string) => {
    saveVotes(votes.map(v => v.id === id ? { ...v, excluded: !v.excluded, updatedAt: new Date().toISOString() } : v));
  }, [votes, saveVotes]);

  const calculateResults = useCallback((): DestinationResult[] => {
    const destinations = new Map<string, DestinationResult>();

    votes.filter(v => !v.excluded).forEach(vote => {
      [vote.firstChoice, vote.secondChoice, vote.thirdChoice].forEach((dest, index) => {
        if (!dest.trim()) return;
        const key = dest.toLowerCase().trim();
        
        if (!destinations.has(key)) {
          destinations.set(key, {
            name: dest.trim(),
            totalPoints: 0,
            firstVotes: 0,
            secondVotes: 0,
            thirdVotes: 0,
            voters: [],
          });
        }

        const result = destinations.get(key)!;
        if (!result.voters.includes(vote.name)) {
          result.voters.push(vote.name);
        }

        if (index === 0) {
          result.firstVotes++;
          result.totalPoints += weightConfig.first;
        } else if (index === 1) {
          result.secondVotes++;
          result.totalPoints += weightConfig.second;
        } else {
          result.thirdVotes++;
          result.totalPoints += weightConfig.third;
        }
      });
    });

    return Array.from(destinations.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [votes, weightConfig]);

  const archiveAndResetPoll = useCallback(() => {
    const results = calculateResults();
    const newRound: PollRound = {
      id: crypto.randomUUID(),
      roundNumber: rounds.length + 1,
      timestamp: new Date().toISOString(),
      votes: [...votes],
      results,
      weightConfig: { ...weightConfig },
    };

    const updatedRounds = [...rounds, newRound];
    setRounds(updatedRounds);
    localStorage.setItem(POLL_ROUNDS_KEY, JSON.stringify(updatedRounds));
    
    saveVotes([]);
  }, [votes, rounds, calculateResults, weightConfig, saveVotes]);

  const setWeightConfig = useCallback((config: WeightConfig) => {
    setWeightConfigState(config);
    localStorage.setItem(WEIGHT_CONFIG_KEY, JSON.stringify(config));
  }, []);

  const setHideResults = useCallback((hide: boolean) => {
    setHideResultsState(hide);
    localStorage.setItem(HIDE_RESULTS_KEY, JSON.stringify(hide));
  }, []);

  const verifyAdminPassword = useCallback((password: string): boolean => {
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
    return password === stored;
  }, []);

  const exportData = useCallback(() => {
    const data = {
      votes,
      weightConfig,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-poll-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [votes, weightConfig]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.votes) {
          saveVotes(data.votes);
        }
        if (data.weightConfig) {
          setWeightConfig(data.weightConfig);
        }
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    reader.readAsText(file);
  }, [saveVotes, setWeightConfig]);

  return {
    votes,
    addVote,
    deleteVote,
    toggleExcludeVote,
    archiveAndResetPoll,
    rounds,
    weightConfig,
    setWeightConfig,
    hideResults,
    setHideResults,
    verifyAdminPassword,
    calculateResults,
    exportData,
    importData,
  };
}
