import { useEffect, useContext } from "react";
import useLoginContext from "./useLoginContext.ts";
import type { GameInfo } from "@gamenite/shared";
import { GameListContext } from "../contexts/GameListContext.tsx";

/**
 * Hook to listen for new game socket events and update the unviewed count.
 * Used globally from Layout.
 *
 * @param isOnGamePage - Whether user is on home or /games page
 */
export default function useGameNotificationListener(isOnGamePage: boolean) {
  const { socket, user } = useLoginContext();
  const { setUnviewedCount } = useContext(GameListContext);

  // Reset count when on game pages
  useEffect(() => {
    if (isOnGamePage) {
      setUnviewedCount(0);
    }
  }, [isOnGamePage, setUnviewedCount]);

  // Listen for new games via socket
  useEffect(() => {
    const handleGameCreated = (newGame: GameInfo) => {
      // Increment count if not on game page and didn't create the game
      if (!isOnGamePage && newGame.createdBy.username !== user.username) {
        setUnviewedCount((prev: number) => prev + 1);
      }
    };

    socket.on("gameCreated", handleGameCreated);
    return () => {
      socket.off("gameCreated", handleGameCreated);
    };
  }, [socket, user.username, isOnGamePage, setUnviewedCount]);
}
