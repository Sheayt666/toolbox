"use client";

import { useState, useEffect, useCallback } from "react";

// Storage keys
const HISTORY_KEY = "tool_history";
const FAVORITES_KEY = "favorites";
// Keep at most this many history entries
const MAX_HISTORY = 50;

// Custom event dispatched whenever the stored data changes so that
// every mounted instance of this hook can re-sync its reactive state.
const STORAGE_CHANGE_EVENT = "toolbox-storage-change";

export interface HistoryEntry {
  toolId: string;
  toolName: string;
  timestamp: number;
}

export interface FavoriteEntry {
  toolId: string;
  toolName: string;
  addedAt: number;
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Notify other hook instances (and the current one) that data changed.
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  } catch {
    // ignore write errors (e.g. private mode quota)
  }
}

/**
 * useToolHistory
 *
 * Provides read/write helpers backed by localStorage for tracking the
 * tools a visitor has used (history) and the tools they have favorited.
 *
 * Exposed helpers:
 * - getHistory(): read the full usage history
 * - addHistory(toolId, toolName): record a tool usage (deduped, capped at 50)
 * - getFavorites(): read the favorite list
 * - toggleFavorite(toolId, toolName?): add/remove a favorite, returns the new state
 * - isFavorite(toolId): whether a tool is currently favorited
 * - getRecentTools(limit): deduplicated recent tools
 *
 * Reactive state (`history`, `favorites`, `hydrated`) is also returned so
 * components re-render automatically when the underlying data changes.
 */
export function useToolHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage on mount (client only).
    setHistory(readJSON<HistoryEntry[]>(HISTORY_KEY, []));
    setFavorites(readJSON<FavoriteEntry[]>(FAVORITES_KEY, []));
    setHydrated(true);

    const sync = () => {
      setHistory(readJSON<HistoryEntry[]>(HISTORY_KEY, []));
      setFavorites(readJSON<FavoriteEntry[]>(FAVORITES_KEY, []));
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, sync);
    // Cross-tab sync
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const getHistory = useCallback((): HistoryEntry[] => {
    return readJSON<HistoryEntry[]>(HISTORY_KEY, []);
  }, []);

  const addHistory = useCallback((toolId: string, toolName: string): void => {
    if (!isClient() || !toolId) return;
    const current = readJSON<HistoryEntry[]>(HISTORY_KEY, []);
    // Remove any previous entry for the same tool so the latest usage
    // bubbles to the top and the list stays deduplicated by tool.
    const filtered = current.filter((h) => h.toolId !== toolId);
    const next: HistoryEntry[] = [
      { toolId, toolName, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY);
    writeJSON(HISTORY_KEY, next);
  }, []);

  const getFavorites = useCallback((): FavoriteEntry[] => {
    return readJSON<FavoriteEntry[]>(FAVORITES_KEY, []);
  }, []);

  const isFavorite = useCallback(
    (toolId: string): boolean => {
      return favorites.some((f) => f.toolId === toolId);
    },
    [favorites]
  );

  // Returns true if the tool is now favorited, false if it was removed.
  const toggleFavorite = useCallback(
    (toolId: string, toolName?: string): boolean => {
      if (!isClient() || !toolId) return false;
      const current = readJSON<FavoriteEntry[]>(FAVORITES_KEY, []);
      const exists = current.some((f) => f.toolId === toolId);
      let next: FavoriteEntry[];
      if (exists) {
        next = current.filter((f) => f.toolId !== toolId);
      } else {
        next = [
          { toolId, toolName: toolName || toolId, addedAt: Date.now() },
          ...current,
        ];
      }
      writeJSON(FAVORITES_KEY, next);
      return !exists;
    },
    []
  );

  const getRecentTools = useCallback((limit = 10): HistoryEntry[] => {
    const current = readJSON<HistoryEntry[]>(HISTORY_KEY, []);
    return current.slice(0, limit);
  }, []);

  const clearHistory = useCallback((): void => {
    writeJSON(HISTORY_KEY, []);
  }, []);

  const clearFavorites = useCallback((): void => {
    writeJSON(FAVORITES_KEY, []);
  }, []);

  return {
    // Reactive state
    history,
    favorites,
    hydrated,
    // Imperative helpers
    getHistory,
    addHistory,
    getFavorites,
    isFavorite,
    toggleFavorite,
    getRecentTools,
    clearHistory,
    clearFavorites,
  };
}
