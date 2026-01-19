import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vote, WeightConfig, DestinationResult, DEFAULT_WEIGHT_CONFIGS, PollRound } from '@/types/poll';
import { ImportDataSchema } from '@/lib/validation';
import type { Json } from '@/integrations/supabase/types';

// Only non-sensitive UI preferences stored in localStorage
const HIDE_RESULTS_KEY = 'travel-poll-hide-results';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [rounds, setRounds] = useState<PollRound[]>([]);
  const [weightConfig, setWeightConfigState] = useState<WeightConfig>(DEFAULT_WEIGHT_CONFIGS[0]);
  const [hideResults, setHideResultsState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch votes from Supabase (requires authentication)
  const fetchVotes = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    setIsAuthenticated(!!session?.session);
    
    if (!session?.session) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching votes:', error);
        return;
      }

      // Transform database rows to Vote interface
      const transformedVotes: Vote[] = (data || []).map(row => ({
        id: String(row.id),
        name: row.name || '',
        firstChoice: row.first_choice || row.r1 || '',
        secondChoice: row.second_choice || row.r2 || '',
        thirdChoice: row.third_choice || row.r3 || '',
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
        excluded: row.is_excluded || false,
      }));

      setVotes(transformedVotes);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch config from Supabase
  const fetchConfig = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    try {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('key', 'weight_config')
        .maybeSingle();

      if (!error && data?.value) {
        const configValue = data.value as unknown as WeightConfig;
        if (configValue.id && configValue.first !== undefined) {
          setWeightConfigState(configValue);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  }, []);

  // Fetch poll rounds from Supabase
  const fetchRounds = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    try {
      const { data, error } = await supabase
        .from('poll_rounds')
        .select('*')
        .order('round_number', { ascending: true });

      if (!error && data) {
        const transformedRounds: PollRound[] = data.map(row => ({
          id: row.id,
          roundNumber: row.round_number,
          timestamp: row.created_at || new Date().toISOString(),
          votes: (row.votes_snapshot as unknown as Vote[]) || [],
          results: (row.results_snapshot as unknown as DestinationResult[]) || [],
          weightConfig: row.weight_config as unknown as WeightConfig,
        }));
        setRounds(transformedRounds);
      }
    } catch (error) {
      console.error('Error fetching rounds:', error);
    }
  }, []);

  // Initial load and auth state listener
  useEffect(() => {
    // Load non-sensitive UI preference from localStorage
    const storedHide = localStorage.getItem(HIDE_RESULTS_KEY);
    if (storedHide) {
      setHideResultsState(JSON.parse(storedHide));
    }

    // Fetch data from Supabase
    fetchVotes();
    fetchConfig();
    fetchRounds();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchVotes();
        fetchConfig();
        fetchRounds();
      } else {
        // Clear sensitive data when logged out
        setVotes([]);
        setRounds([]);
        setWeightConfigState(DEFAULT_WEIGHT_CONFIGS[0]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchVotes, fetchConfig, fetchRounds]);

  // Add vote - uses anon key, no auth required for submission
  const addVote = useCallback(async (vote: Omit<Vote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          name: vote.name,
          email: null,
          r1: vote.firstChoice,
          r2: vote.secondChoice,
          r3: vote.thirdChoice,
          first_choice: vote.firstChoice,
          second_choice: vote.secondChoice,
          third_choice: vote.thirdChoice,
          is_excluded: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding vote:', error);
        throw error;
      }

      const newVote: Vote = {
        id: String(data.id),
        name: data.name || '',
        firstChoice: data.first_choice || '',
        secondChoice: data.second_choice || '',
        thirdChoice: data.third_choice || '',
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
        excluded: data.is_excluded || false,
      };

      // Update local state for authenticated users viewing admin panel
      if (isAuthenticated) {
        setVotes(prev => [newVote, ...prev]);
      }

      return newVote;
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  }, [isAuthenticated]);

  // Delete vote - requires authentication (enforced by RLS)
  const deleteVote = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', parseInt(id, 10));

      if (error) {
        console.error('Error deleting vote:', error);
        throw error;
      }

      setVotes(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vote:', error);
      throw error;
    }
  }, []);

  // Toggle exclude vote - requires authentication (enforced by RLS)
  const toggleExcludeVote = useCallback(async (id: string) => {
    const vote = votes.find(v => v.id === id);
    if (!vote) return;

    try {
      const { error } = await supabase
        .from('votes')
        .update({ is_excluded: !vote.excluded })
        .eq('id', parseInt(id, 10));

      if (error) {
        console.error('Error toggling vote:', error);
        throw error;
      }

      setVotes(prev => prev.map(v => 
        v.id === id 
          ? { ...v, excluded: !v.excluded, updatedAt: new Date().toISOString() } 
          : v
      ));
    } catch (error) {
      console.error('Error toggling vote:', error);
      throw error;
    }
  }, [votes]);

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

  // Archive and reset poll - requires authentication
  const archiveAndResetPoll = useCallback(async () => {
    const results = calculateResults();

    try {
      // Save round to Supabase - cast to Json type for Supabase
      const votesJson = JSON.parse(JSON.stringify(votes)) as Json;
      const resultsJson = JSON.parse(JSON.stringify(results)) as Json;
      const weightConfigJson = JSON.parse(JSON.stringify(weightConfig)) as Json;

      const { data: roundData, error: roundError } = await supabase
        .from('poll_rounds')
        .insert({
          round_number: rounds.length + 1,
          votes_snapshot: votesJson,
          results_snapshot: resultsJson,
          weight_config: weightConfigJson,
        })
        .select()
        .single();

      if (roundError) {
        console.error('Error saving round:', roundError);
        throw roundError;
      }

      const newRound: PollRound = {
        id: roundData.id,
        roundNumber: roundData.round_number,
        timestamp: roundData.created_at || new Date().toISOString(),
        votes: [...votes],
        results,
        weightConfig: { ...weightConfig },
      };

      // Delete all current votes
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .gte('id', 0);

      if (deleteError) {
        console.error('Error deleting votes:', deleteError);
        throw deleteError;
      }

      setRounds(prev => [...prev, newRound]);
      setVotes([]);
    } catch (error) {
      console.error('Error archiving poll:', error);
      throw error;
    }
  }, [votes, rounds, calculateResults, weightConfig]);

  // Set weight config - requires authentication
  const setWeightConfig = useCallback(async (config: WeightConfig) => {
    setWeightConfigState(config);

    try {
      // Cast config to Json type for Supabase
      const configJson = JSON.parse(JSON.stringify(config)) as Json;

      // First try to update existing config
      const { data: existing } = await supabase
        .from('config')
        .select('key')
        .eq('key', 'weight_config')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('config')
          .update({ value: configJson })
          .eq('key', 'weight_config');

        if (error) {
          console.error('Error updating weight config:', error);
        }
      } else {
        const { error } = await supabase
          .from('config')
          .insert({ key: 'weight_config', value: configJson });

        if (error) {
          console.error('Error inserting weight config:', error);
        }
      }
    } catch (error) {
      console.error('Error saving weight config:', error);
    }
  }, []);

  // Hide results - non-sensitive UI preference, kept in localStorage
  const setHideResults = useCallback((hide: boolean) => {
    setHideResultsState(hide);
    localStorage.setItem(HIDE_RESULTS_KEY, JSON.stringify(hide));
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

  const importData = useCallback(async (file: File): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const rawData = JSON.parse(e.target?.result as string);
          
          // Validate imported data with zod schema
          const parseResult = ImportDataSchema.safeParse(rawData);
          
          if (!parseResult.success) {
            const errorMessages = parseResult.error.errors
              .map(err => `${err.path.join('.')}: ${err.message}`)
              .join(', ');
            console.error('Import validation failed:', errorMessages);
            resolve({ success: false, error: `Invalid import data: ${errorMessages}` });
            return;
          }
          
          const validatedData = parseResult.data;
          
          // Import votes to Supabase
          if (validatedData.votes && validatedData.votes.length > 0) {
            for (const vote of validatedData.votes) {
              await supabase.from('votes').insert({
                name: vote.name,
                first_choice: vote.firstChoice,
                second_choice: vote.secondChoice,
                third_choice: vote.thirdChoice,
                r1: vote.firstChoice,
                r2: vote.secondChoice,
                r3: vote.thirdChoice,
                is_excluded: vote.excluded || false,
              });
            }
            // Refresh votes
            await fetchVotes();
          }
          
          if (validatedData.weightConfig) {
            await setWeightConfig(validatedData.weightConfig as WeightConfig);
          }
          
          resolve({ success: true });
        } catch (error) {
          console.error('Failed to import data:', error);
          resolve({ success: false, error: 'Failed to parse JSON file' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };
      reader.readAsText(file);
    });
  }, [fetchVotes, setWeightConfig]);

  const updateAdminPassword = useCallback(async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

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
    calculateResults,
    exportData,
    importData,
    updateAdminPassword,
    loading,
    isAuthenticated,
  };
}
