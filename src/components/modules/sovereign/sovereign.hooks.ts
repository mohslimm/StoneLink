import { useState, useCallback } from 'react';
import { sovereignService } from './sovereign.service';
import type { SovereignResult } from './SovereignModule.types';

export const useSovereign = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SovereignResult[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<SovereignResult | null>(null);

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

  const openDocument = useCallback((doc: SovereignResult) => {
    setSelectedDoc(doc);
  }, []);

  const closeDocument = useCallback(() => {
    setSelectedDoc(null);
  }, []);

  return {
    query,
    setQuery,
    searching,
    results,
    handleSearch,
    selectedDoc,
    openDocument,
    closeDocument
  };
};
