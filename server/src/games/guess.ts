/**
 * Generate a human-readable description of a Number Guesser move.
 * @param state - The current game state
 * @param move - The move made (the guessed number)
 * @param playerIndex - The index of the player making the move
 * @param players - The array of player IDs
 * @param userId - The userId of the player making the move
 * @param displayNameMap - Map of userId to display name (optional)
 * @returns A string description of the move
 */
export type GuessMoveContext = {
  lastResult: "correct" | "low" | "high" | null;
};

export function describeGuessMove(
  context: GuessMoveContext,
  move: number,
  playerIndex: number,
  players: string[],
  userId: string,
  displayNameMap?: Record<string, string>,
): string {
  const guess = move;
  if (context.lastResult === "correct") {
    return `guessed ${guess} and won the game!`;
  } else if (context.lastResult === "low") {
    return `guessed ${guess} (too low)`;
  } else if (context.lastResult === "high") {
    return `guessed ${guess} (too high)`;
  }
  return `guessed ${guess}`;
}
import {
  zGuessMove,
  type GuessView,
  type GuessState,
  type UnfinishedGuesView,
} from "@gamenite/shared";
import { GameService } from "./gameServiceManager.ts";
import { type GameLogic } from "./gameLogic.ts";

function allGuessed(guesses: (number | null)[]): guesses is number[] {
  return guesses.every((guess) => guess !== null);
}

export const guessLogic: GameLogic<GuessState, GuessView> = {
  minPlayers: 2,
  maxPlayers: null,
  start: (numPlayers) => ({
    secret: Math.round(Math.random() * 100) + 1,
    guesses: Array.from({ length: numPlayers }).map(() => null),
  }),
  update: ({ secret, guesses: oldGuesses }, payload, playerIndex) => {
    const move = zGuessMove.safeParse(payload);
    if (oldGuesses[playerIndex] !== null) return null;
    if (move.error) return null;
    const newGuesses = [...oldGuesses];
    newGuesses[playerIndex] = move.data;
    // Determine result for move context
    let lastResult: "correct" | "low" | "high" | null = null;
    if (move.data === secret) lastResult = "correct";
    else if (move.data < secret) lastResult = "low";
    else if (move.data > secret) lastResult = "high";
    return {
      secret,
      guesses: newGuesses,
      lastResult, // for move context
    };
  },
  isDone: ({ guesses }) => guesses.every((guess) => guess !== null),
  viewAs: ({ secret, guesses }, playerIndex) => {
    if (allGuessed(guesses)) {
      return { finished: true, secret, guesses };
    }
    // If the game is not done, we only show the player their own guess
    // everyone can see *who* has guessed
    const view: UnfinishedGuesView = {
      finished: false,
      guesses: guesses.map((value) => value !== null),
    };
    if (playerIndex !== -1 && guesses[playerIndex] !== null) {
      view.myGuess = guesses[playerIndex];
    }
    return view;
  },
  tagView: (view) => ({ type: "guess", view }),
};

export const guessGameService = new GameService<GuessState, GuessView>(guessLogic);
