import { useNavigate } from "react-router-dom";
import GameSummaryView from "../components/GameSummaryView.tsx";
import useGameListWithSocket from "../hooks/useGameListWithSocket.ts";

export default function GameList() {
  const navigate = useNavigate();
  const gameList = useGameListWithSocket(undefined, true);

  return (
    <div className="content">
      <div className="spacedSection">
        <h2>All games</h2>
        <div>
          <button className="primary narrow" onClick={() => navigate("/game/new")}>
            Create New Game
          </button>
        </div>
        {"message" in gameList ? (
          <div>{gameList.message}</div>
        ) : (
          <div className="dottedList">
            {gameList.map((game) => (
              <GameSummaryView key={game.gameId} {...game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
