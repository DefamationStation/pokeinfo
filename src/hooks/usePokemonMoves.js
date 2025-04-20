import { useState, useEffect, useRef } from 'react';

// Module-level aggregated cache of moves per Pokémon
const aggregatedCache = {};

export default function usePokemonMoves(pokemonName, moves) {
  const [moveDetails, setMoveDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!pokemonName || !moves?.length) {
      setMoveDetails({});
      setLoading(false);
      setFetchProgress(100);
      return;
    }

    // Cancel any in-flight fetch
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const storageKey = `pokemonMoves_${pokemonName}`;

    // 1) In-memory aggregated cache
    if (aggregatedCache[pokemonName]) {
      setMoveDetails(aggregatedCache[pokemonName]);
      setLoading(false);
      setFetchProgress(100);
      return;
    }

    // 2) LocalStorage aggregated cache
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        aggregatedCache[pokemonName] = data;
        setMoveDetails(data);
        setLoading(false);
        setFetchProgress(100);
        return;
      }
    } catch (e) {
      console.warn(`Error reading ${storageKey}:`, e);
    }

    // 3) Fetch missing moves in batches
    async function fetchAll() {
      setLoading(true);
      setFetchProgress(0);
      const total = moves.length;
      const details = {};
      const BATCH_SIZE = 10;
      const BATCH_DELAY = 300;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        if (signal.aborted) break;
        const batch = moves.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (mi) => {
            if (signal.aborted) return;
            try {
              const res = await fetch(mi.move.url, { signal });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              details[mi.move.name] = data;
            } catch (err) {
              if (err.name !== 'AbortError') console.error(`Error fetching ${mi.move.name}:`, err);
            }
          })
        );
        // Update state progressively
        setMoveDetails({ ...details });
        setFetchProgress(Math.min(((i + BATCH_SIZE) / total) * 100, 100));
        if (i + BATCH_SIZE < total) await new Promise((r) => setTimeout(r, BATCH_DELAY));
      }

      if (!signal.aborted) {
        aggregatedCache[pokemonName] = details;
        try { localStorage.setItem(storageKey, JSON.stringify(details)); } catch {}
        setMoveDetails(details);
        setFetchProgress(100);
        setLoading(false);
      }
    }

    fetchAll();
    return () => controller.abort();
  }, [pokemonName, moves.map(mi => mi.move.name).join(',')]);

  return { moveDetails, loading, fetchProgress };
}
