import type { ErrorMsg, GameInfo } from "@gamenite/shared";
import { useEffect, useState, useContext } from "react";
import useSocketsForGameList from "./useSocketsForGameList.ts";
import { GameListContext } from "../contexts/GameListContext.tsx";

/**
 * Custom hook to fetch the initial list of games and manage real-time updates via socket.
 * Automatically resets the unviewed game count when called since user is on a game page.
 *
 * @param maxGames - Optional maximum number of games to display
 * @param onPage - Whether the user is currently on the home page or /games page (should be true when using this hook)
 * @returns Either an error message or a list of GameInfo objects
 */
export default function useGameListWithSocket(
  maxGames?: number,
  onPage: boolean = true,
): { message: string } | GameInfo[] {
  const [initialGames, setInitialGames] = useState<GameInfo[] | ErrorMsg | null>(null);
  const { setUnviewedCount } = useContext(GameListContext);

  // Fetch initial games from API
  useEffect(() => {
    fetch("/api/game/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInitialGames(data);
        } else if (data && typeof data === "object" && !Array.isArray(data) && "error" in data) {
          setInitialGames({ error: String((data as { error: unknown }).error) });
        } else {
          setInitialGames({ error: "Failed to fetch games" });
        }
      })
      .catch(() => {
        setInitialGames({ error: "Failed to fetch games" });
      });
  }, []);

  // Reset unviewed count when on game pages
  useEffect(() => {
    if (onPage) {
      setUnviewedCount(0);
    }
  }, [onPage, setUnviewedCount]);

  // Get games with socket updates
  const { games } = useSocketsForGameList(
    initialGames && !("error" in initialGames) ? initialGames : [],
  );

  // Return appropriate message or game list
  if (!initialGames) return { message: "Loading..." };
  if ("error" in initialGames) return { message: `Error: ${initialGames.error}` };
  if (games.length === 0) return { message: "No games found..." };
  if (maxGames) return games.slice(0, maxGames);
  return games;
}
