import { useState, useEffect } from "react";
import "./App.css";
import PlaceBoats from "./PlaceBoats";
import PlayGame from "./PlayGame";
import { Boat, BoatType } from "./model/Battleship";
import { GameProvider, useGame } from "./context/GameContext";

function Game() {
  const [myBoats, setMyBoats] = useState<Map<BoatType, Boat>>(new Map());
  const { checkIfGameStarted } = useGame();
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  useEffect(() => {
    const fetchGameStarted = async () => {
      const gameStarted = await checkIfGameStarted();
      setIsGameStarted(gameStarted);
    };

    // Check the game status immediately
    fetchGameStarted();

    // Then check the game status every 5 seconds
    const intervalId = setInterval(fetchGameStarted, 5000);
    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [checkIfGameStarted]);

  return (
    <div>
      <span>GameState : {isGameStarted ? "Started" : "Not Started"}</span>
      {myBoats.size < 5 && (
        <PlaceBoats
          onDone={(boats) => {
            setMyBoats(boats);
          }}
        />
      )}
      {myBoats.size === 5 && <PlayGame myBoats={myBoats} />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
