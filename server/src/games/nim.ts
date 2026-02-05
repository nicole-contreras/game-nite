/**
 * Generate a human-readable description of a Nim move.
 * @param state - The current game state
 * @param move - The move made (number of tokens taken)
 * @param playerIndex - The index of the player making the move
 * @param players - The array of player IDs
 * @param userId - The userId of the player making the move
 * @param displayNameMap - Map of userId to display name (optional)
 * @returns A string description of the move
 */
export function describeNimMove(
  state: NimView,
  move: number,
  playerIndex: number,
  players: string[],
  userId: string,
  displayNameMap?: Record<string, string>,
): string {
  const tokensTaken = move;
  const tokensLeft = state.remaining;
  const tokenStr = tokensTaken === 1 ? "one token" : `${tokensTaken} tokens`;
  if (tokensLeft === 0) {
    return `took ${tokenStr}, leaving 0 and losing the game`;
  }
  return `took ${tokenStr}, leaving ${tokensLeft}`;
}
import { GameService } from "./gameServiceManager.ts";
import { type NimState, type NimView, zNimMove } from "@gamenite/shared";
import { type GameLogic } from "./gameLogic.ts";

const START_NIM_OBJECTS = 21;

export const nimLogic: GameLogic<NimState, NimView> = {
  minPlayers: 2,
  maxPlayers: 2,
  start: () => ({ remaining: START_NIM_OBJECTS, nextPlayer: 0 }),
  update: ({ remaining, nextPlayer }, payload, playerIndex) => {
    const move = zNimMove.safeParse(payload);
    if (playerIndex !== nextPlayer) return null;
    if (move.error) return null;
    if (move.data > remaining) return null;
    return {
      remaining: remaining - move.data,
      nextPlayer: nextPlayer === 0 ? 1 : 0,
    };
  },
  isDone: ({ remaining }) => remaining === 0,
  viewAs: (state) => state,
  tagView: (view) => ({ type: "nim", view }),
};

export const nimGameService = new GameService<NimState, NimView>(nimLogic);
