import type { Request, Response } from "express";
import { type GameInfo, withAuth, zGameKey, type GameMakeMovePayload } from "@gamenite/shared";
import { type RestAPI, type GameViewUpdates, type SocketAPI, type GameServer } from "../types.ts";
import {
  createGame,
  gameServices,
  getGames,
  joinGame,
  startGame,
  updateGame,
  viewGame,
  getGameById,
} from "../services/game.service.ts";
import { forceChatById } from "../services/chat.service.ts";
import { z } from "zod";
import { logSocketError } from "./socket.controller.ts";
import { checkAuth, enforceAuth } from "../services/auth.service.ts";

let io: GameServer | null = null;

/**
 * Handle GET requests to `/api/game/:id` by returning the game info or 404 if not found.
 */
export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameId = Array.isArray(id) ? id[0] : id;
  const game = await getGameById(gameId);
  if (!game) {
    res.status(404).send({ error: "Game not found" });
    return;
  }
  res.send(game);
};

/**
 * Set the socket.io instance for broadcasting game events
 */
export const setIO = (ioInstance: GameServer) => {
  io = ioInstance;
};

/**
 * Handle POST requests to `/api/game/create` by creating a game. The game
 * starts with one player, the user who made the POST request.
 * Broadcasts the new game to all connected clients via socket.
 */
export const postCreate: RestAPI<GameInfo> = async (req, res) => {
  const body = withAuth(zGameKey).safeParse(req.body);
  if (body.error) {
    res.status(400).send({ error: "Poorly-formed request" });
    return;
  }

  const user = await checkAuth(body.data.auth);
  if (!user) {
    res.status(403).send({ error: "Invalid credentials" });
    return;
  }

  const game = await createGame(user, body.data.payload, new Date());

  // Broadcast the new game to all connected clients
  if (io) {
    io.emit("gameCreated", game);
  }

  res.send(game);
};

export const getList: RestAPI<GameInfo[]> = async (req, res) => {
  res.send(await getGames());
};

/**
 * Each active game player gets a dedicated room that sends messages
 * to just their socket connections. This function derives that room name from
 * the game id and the username.
 *
 * @param gameId - the game id, also the 'base' room name
 * @param userId - user id (not username!)
 * @returns a room name unique to that game id and user
 */
function userRoom(gameId: string, user: string) {
  return `${gameId}-${user}`;
}

/**
 * Handle the socket request sent by a user when they load to a game page. The
 * server's job is to respond with full information about the game's current
 * players and the appropriate view of the game's state. The server also needs
 * to register the user for future updates about the game's state.
 */
export const socketWatch: SocketAPI = (socket) => async (body) => {
  try {
    const { auth, payload: gameId } = withAuth(z.string()).parse(body);
    const user = await enforceAuth(auth);
    const gameInfo = await getGameById(gameId);
    const { isPlayer } = await viewGame(gameId, user);
    const roomsToJoin = isPlayer ? [gameId, userRoom(gameId, user.userId)] : [gameId];
    await socket.join(roomsToJoin);
    if (gameInfo) {
      socket.emit("gameWatched", gameInfo);
    }
  } catch (err) {
    logSocketError(socket, err);
  }
};

/**
 * Broadcast view updates to appropriate users
 */
function sendViewUpdates(io: GameServer, gameId: string, updates: GameViewUpdates) {
  io.to(gameId).emit("gameStateUpdated", { ...updates.watchers, forPlayer: false });
  for (const { userId, view } of updates.players) {
    io.to(userRoom(gameId, userId)).emit("gameStateUpdated", { ...view, forPlayer: true });
  }
}

/**
 * Handle the socket request sent by a user when they try to join a game.
 */
export const socketJoinAsPlayer: SocketAPI = (socket, io) => async (body) => {
  try {
    const { auth, payload: gameId } = withAuth(z.string()).parse(body);
    const user = await enforceAuth(auth);
    const game = await joinGame(gameId, user);

    // Let everyone know the user joined (`io` instead of `socket` includes
    // the joiner)
    io.to(gameId).emit("gamePlayersUpdated", game.players);

    // This socket should receive user-specific updates for this game, if it
    // isn't already
    if (!socket.rooms.has(userRoom(gameId, user.userId))) {
      await socket.join(userRoom(gameId, user.userId));
    }

    // If the game is full, it starts automatically
    if (game.players.length === gameServices[game.type].maxPlayers) {
      sendViewUpdates(io, gameId, await startGame(gameId, user));
    }
  } catch (err) {
    logSocketError(socket, err);
  }
};

/**
 * Handle a request to start the game.
 */
export const socketStart: SocketAPI = (socket, io) => async (body) => {
  try {
    const { auth, payload: gameId } = withAuth(z.string()).parse(body);
    const user = await enforceAuth(auth);
    sendViewUpdates(io, gameId, await startGame(gameId, user));
  } catch (err) {
    logSocketError(socket, err);
  }
};

/**
 * Handle a request to make a move in a game.
 */
export const socketMakeMove: SocketAPI = (socket, io) => async (body) => {
  try {
    // Validate payload type
    const parsed = withAuth(z.object({ gameId: z.string(), move: z.any() })).parse(body);
    const auth = parsed.auth;
    const payload = parsed.payload as GameMakeMovePayload;
    const gameId = payload && typeof payload.gameId === "string" ? payload.gameId : "";
    const move = payload ? payload.move : undefined;
    const user = await enforceAuth(auth);
    const viewUpdates = await updateGame(gameId, user, move);
    sendViewUpdates(io, gameId, viewUpdates);
    // Emit move message to chat if present
    const gameInfo = await getGameById(gameId);
    if (gameInfo && gameInfo.chat) {
      const chatId = gameInfo.chat;
      const chatInfo = await forceChatById(chatId, user);
      const messages = chatInfo && Array.isArray(chatInfo.messages) ? chatInfo.messages : [];
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.type === "move") {
          io.to(chatId).emit("chatNewMessage", { chatId, message: lastMessage });
        }
      }
    }
  } catch (err) {
    logSocketError(socket, err);
  }
};

/**
 * Handle a request from a client to create a new game via sockets.
 * - Creates a new game in the database.
 * - Broadcasts the new game to all connected clients so their game lists update immediately.
 * - Sends the new game back to the creator as well.
 */
export const socketCreateGame: SocketAPI = (socket, io) => async (body) => {
  try {
    const { auth, payload: gameType } = withAuth(zGameKey).parse(body);
    const user = await enforceAuth(auth);

    // create the game
    const game = await createGame(user, gameType, new Date());

    // broadcast to everyone except the creator
    socket.broadcast.emit("gameCreated", game);

    // send to the creator as well
    socket.emit("gameCreated", game);
  } catch (err) {
    logSocketError(socket, err);
  }
};
