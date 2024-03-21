import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { Boat, BoatType } from "../model/Battleship";

interface GameState {
  myBoats: Map<BoatType, Boat>;
  setMyBoats: React.Dispatch<React.SetStateAction<Map<BoatType, Boat>>>;
  provider: ethers.JsonRpcProvider | null;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [myBoats, setMyBoats] = useState<Map<BoatType, Boat>>(new Map());
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  // Connect to Ethereum provider when component mounts
  useEffect(() => {
    const initializeProvider = async () => {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      await provider.ready;
      const network = await provider.getNetwork();
      setProvider(provider);
      console.log(network);
    };

    initializeProvider();
  }, []);

  return (
    <GameContext.Provider value={{ myBoats, setMyBoats, provider }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
