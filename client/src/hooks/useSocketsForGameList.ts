import { useEffect, useState, useRef } from "react";
import type { GameInfo } from "@gamenite/shared";

/**
 * Custom hook to manage game list with real-time updates.
 * Detects new games by comparing the game list before and after updates.
 * Marks games as new if they appear in the new list but weren't in the old list.
 *
 * @param initialGames - The initial list of games (typically fetched from the API)
 * @returns Object containing the current games array
 */
export default function useSocketsForGameList(initialGames: GameInfo[]) {
  const [games, setGames] = useState<GameInfo[]>([]);
  const seenGameIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Mark games as new if we haven't seen them before
    const updatedGames = initialGames.map((game) => {
      const isNew = !seenGameIdsRef.current.has(game.gameId);
      seenGameIdsRef.current.add(game.gameId);
      return { ...game, isNew };
    });

    setGames(updatedGames);
  }, [initialGames]);

  return { games };
}
