import { createContext, useState, useCallback } from "react";

/**
 * Context for managing unviewed game count across the application.
 * Provides the current count and a setter function that supports both
 * direct values and functional updates.
 */
export const GameListContext = createContext<{
  unviewedCount: number;
  setUnviewedCount: (count: number | ((prev: number) => number)) => void;
}>({
  unviewedCount: 0,
  setUnviewedCount: () => {},
});

/**
 * Provider component for GameListContext.
 * Manages the unviewed game count state and provides it to child components.
 */
export function GameListContextProvider({ children }: { children: React.ReactNode }) {
  const [unviewedCount, setUnviewedCountState] = useState(0);

  // Wrapper to handle both direct values and functional updates
  const setUnviewedCount = useCallback((count: number | ((prev: number) => number)) => {
    if (typeof count === "function") {
      setUnviewedCountState(count);
    } else {
      setUnviewedCountState(count);
    }
  }, []);

  return (
    <GameListContext.Provider value={{ unviewedCount, setUnviewedCount }}>
      {children}
    </GameListContext.Provider>
  );
}
