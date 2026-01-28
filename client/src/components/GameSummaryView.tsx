import "./GameSummaryView.css";
import type { GameInfo } from "@gamenite/shared";
import { NavLink, useNavigate } from "react-router-dom";
import { gameNames } from "../util/consts.ts";
import useTimeSince from "../hooks/useTimeSince.ts";

/**
 * Summarizes information for a single game as part of a list of games.
 * Displays a "New!" badge for games that were created after the client loaded the page.
 *
 * @param props - GameInfo properties for the game to display
 */
export default function GameSummaryView({
  gameId,
  status,
  type,
  players,
  createdAt,
  createdBy,
  isNew,
}: GameInfo) {
  const timeSince = useTimeSince();
  const navigate = useNavigate();
  const numPlayers = players.length;
  return (
    <div className="gameSummary" role="listitem">
      <div className="stats" onClick={() => navigate(`/game/${gameId}`)}>
        {status}
        {status !== "done" && `, ${numPlayers} player${numPlayers === 1 ? "" : "s"}`}
      </div>
      <NavLink to={`/game/${gameId}`} className="mid">
        A game of {gameNames[type]}
      </NavLink>
      <div className="lastActivity">
        {createdBy.display} created {timeSince(createdAt)}
      </div>
      {/* Removed New! badge */}
    </div>
  );
}
