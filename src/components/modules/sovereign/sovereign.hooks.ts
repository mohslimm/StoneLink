import { useState, useCallback } from 'react';
import { sovereignService } from './sovereign.service';
import type { SovereignResult } from './SovereignModule.types';

export const useSovereign = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SovereignResult[]>([]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    setResults([]); // Clear previous
    
    try {
      const data = await sovereignService.searchKnowledge(query);
      setResults(data);
    } catch (err) {
      console.error('Sovereign search failed:', err);
    } finally {
      setSearching(false);
    }
  }, [query]);

  return {
    query,
    setQuery,
    searching,
    results,
    handleSearch
  };
};
