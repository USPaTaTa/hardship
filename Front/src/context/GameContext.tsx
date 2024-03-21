import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { Boat, BoatType } from "../model/Battleship";
import BattleShipAbi from "../BattleShip.json"; // Make sure to import your ABI

interface GameState {
  myBoats: Map<BoatType, Boat>;
  setMyBoats: React.Dispatch<React.SetStateAction<Map<BoatType, Boat>>>;
  provider: ethers.JsonRpcProvider | null;
  contract: ethers.Contract | null;
  startGame: () => Promise<void>;
  checkIfGameStarted: () => Promise<boolean>;
  checkCurrentPlayer: () => Promise<string>;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [myBoats, setMyBoats] = useState<Map<BoatType, Boat>>(new Map());
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null); // Add this line

  // Connect to Ethereum provider when component mounts
  useEffect(() => {
    const initializeProvider = async () => {
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      await provider.ready;
      const network = await provider.getNetwork();
      setProvider(provider);
      console.log(network);

      // Deploy the contract after the provider is ready
      const signer = await provider.getSigner();
      const contract = await deployNewBattleShip(signer);
      setContract(contract);
    };

    initializeProvider();
  }, []);

  async function deployNewBattleShip(signer: ethers.Signer) {
    const factory = new ethers.ContractFactory(
      BattleShipAbi.abi,
      BattleShipAbi.bytecode,
      signer
    );

    const deployTransaction = await factory.getDeployTransaction(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    const deployedContract = await signer.sendTransaction(deployTransaction);
    const receipt = await deployedContract.wait();

    const contractAddress = receipt ? receipt.contractAddress : null;
    console.log("Battleship contract deployed at address:", contractAddress);

    const deployedInstance = new ethers.Contract(
      contractAddress as string,
      BattleShipAbi.abi,
      signer
    );

    return deployedInstance;
  }

  const startGame = async () => {
    if (contract) {
      try {
        // Fetch and log gameStarted before starting the game
        const gameStartedBefore = await contract.gameStarted();
        console.log("Game started before:", gameStartedBefore);

        const tx = await contract.startGame();
        await tx.wait(); // Wait for transaction to be mined

        // Fetch and log gameStarted after starting the game
        const gameStartedAfter = await contract.gameStarted();
        console.log("Game started after:", gameStartedAfter);
      } catch (error) {
        console.error("Failed to start game:", error);
      }
    } else {
      console.error("Contract not loaded");
    }
  };

  const checkIfGameStarted = async () => {
    if (contract) {
      try {
        const gameStarted = await contract.gameStarted();
        return gameStarted;
      } catch (error) {
        console.error("Failed to check if game started:", error);
      }
    } else {
      console.error("Contract not loaded");
    }
  };

  const checkCurrentPlayer = async () => {
    if (contract) {
      try {
        const currentPlayer = await contract.currentPlayer();
        return currentPlayer;
      } catch (error) {
        console.error("Failed to check current player:", error);
      }
    } else {
      console.error("Contract not loaded");
    }
  };

  return (
    <GameContext.Provider
      value={{
        myBoats,
        setMyBoats,
        provider,
        contract,
        startGame,
        checkIfGameStarted,
        checkCurrentPlayer,
      }}
    >
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
