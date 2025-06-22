/**
 * Shared React hooks for IFLA theme components
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ConceptProps, CSVConceptRow, MultilingualText } from '../types';
import { getLocalizedText, extractAvailableLanguages, debounce } from '../utils';

/**
 * Hook for loading and parsing CSV data
 */
export function useCsvLoader(csvUrl?: string, csvData?: CSVConceptRow[]) {
  const [data, setData] = useState<CSVConceptRow[]>(csvData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (csvUrl && !csvData?.length) {
      setLoading(true);
      setError(null);

      fetch(csvUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(csvText => {
          // Simple CSV parsing - in production, you'd use a library like papaparse
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const rows = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const row: CSVConceptRow = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              return row;
            });
          
          setData(rows);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [csvUrl, csvData]);

  return { data, loading, error };
}

/**
 * Hook for managing multilingual text
 */
export function useMultilingualText(
  initialText: MultilingualText | string = '',
  defaultLanguage: string = 'en'
) {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [text, setText] = useState<MultilingualText>(
    typeof initialText === 'string' 
      ? { [defaultLanguage]: initialText }
      : initialText
  );

  const currentText = useMemo(
    () => getLocalizedText(text, currentLanguage, defaultLanguage),
    [text, currentLanguage, defaultLanguage]
  );

  const availableLanguages = useMemo(
    () => Object.keys(text),
    [text]
  );

  const updateText = useCallback((language: string, value: string) => {
    setText(prev => ({
      ...prev,
      [language]: value
    }));
  }, []);

  const removeLanguage = useCallback((language: string) => {
    setText(prev => {
      const { [language]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    currentText,
    currentLanguage,
    setCurrentLanguage,
    text,
    availableLanguages,
    updateText,
    removeLanguage
  };
}

/**
 * Hook for managing vocabulary table state
 */
export function useVocabularyTable(
  concepts: ConceptProps[],
  initialFilters: Record<string, any> = {}
) {
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState(initialFilters);

  // Available languages from concepts
  const availableLanguages = useMemo(
    () => extractAvailableLanguages(concepts),
    [concepts]
  );

  // Debounced filter setter
  const debouncedSetFilter = useMemo(
    () => debounce(setFilter, 300),
    []
  );

  // Filtered and sorted concepts
  const processedConcepts = useMemo(() => {
    let filtered = concepts;

    // Apply text filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = concepts.filter(concept =>
        getLocalizedText(concept.label, selectedLanguage)?.toLowerCase().includes(lowerFilter) ||
        getLocalizedText(concept.definition, selectedLanguage)?.toLowerCase().includes(lowerFilter) ||
        getLocalizedText(concept.scopeNote, selectedLanguage)?.toLowerCase().includes(lowerFilter) ||
        concept.notation?.toLowerCase().includes(lowerFilter)
      );
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        filtered = filtered.filter(concept => {
          const conceptValue = concept[key as keyof ConceptProps];
          if (Array.isArray(conceptValue)) {
            return conceptValue.includes(value);
          }
          return conceptValue === value;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = getLocalizedText(a[sortField as keyof ConceptProps] as any, selectedLanguage) || '';
        const bValue = getLocalizedText(b[sortField as keyof ConceptProps] as any, selectedLanguage) || '';
        
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [concepts, filter, sortField, sortDirection, selectedLanguage, filters]);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllRows = useCallback(() => {
    setSelectedRows(new Set(processedConcepts.map(c => c.id || c.uri || '')));
  }, [processedConcepts]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return {
    // Data
    processedConcepts,
    availableLanguages,
    
    // Filter state
    filter,
    setFilter: debouncedSetFilter,
    filters,
    updateFilter,
    
    // Sort state
    sortField,
    sortDirection,
    handleSort,
    
    // Language state
    selectedLanguage,
    setSelectedLanguage,
    
    // Selection state
    selectedRows,
    toggleRowSelection,
    selectAllRows,
    clearSelection,
  };
}

/**
 * Hook for managing local storage state
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

/**
 * Hook for managing async state
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

/**
 * Hook for handling window resize events
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook for handling click outside events
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
}

/**
 * Hook for managing toggle state
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse, setValue }] as const;
}

export * from './usePrevious';