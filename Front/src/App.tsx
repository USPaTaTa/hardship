import { useState } from "react";
import "./App.css";
import PlaceBoats from "./PlaceBoats";
import PlayGame from "./PlayGame";
import { Boat, BoatType } from "./model/Battleship";

function App() {
  const [myBoats, setMyBoats] = useState<Map<BoatType, Boat>>(new Map());

  return (
    <>
      {/* <GameProvider> */}
      {myBoats.size < 5 && (
        <PlaceBoats
          onDone={(boats) => {
            setMyBoats(boats);
          }}
        />
      )}
      {myBoats.size === 5 && <PlayGame myBoats={myBoats} />}
      {/* </GameProvider> */}
    </>
  );
}

export default App;
