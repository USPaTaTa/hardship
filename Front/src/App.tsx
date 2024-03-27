import { useState, useEffect } from "react";
import "./App.css";
import PlaceBoats from "./PlaceBoats";
import PlayGame from "./PlayGame";
import { Boat, BoatType } from "./model/Battleship";
import { GameProvider, useGame } from "./context/GameContext";

function Game() {
  const [myBoats, setMyBoats] = useState<Map<BoatType, Boat>>(new Map());
  const {
    checkIfGameStarted,
    checkIfGameEnded,
    checkWinner,
    initializeProviderAndDeployContract,
    checkContractAddress,
  } = useGame();
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isGameEnded, setIsGameEnded] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");
  const [gameOption, setGameOption] = useState<string>("");
  const [contractDeployed, setContractDeployed] = useState<boolean>(false);
  const [contractAddress, setContractAddress] = useState<string>("");

  const deployContract = async () => {
    await initializeProviderAndDeployContract();
    setContractDeployed(true);
  };
  const joinContract = async () => {
    // Vérifiez l'adresse du contrat ici. Si l'adresse est valide, définissez contractDeployed sur true.
    // Remplacez cette ligne par votre propre logique de vérification.
    const isValidAddress = await checkContractAddress(contractAddress);
    if (isValidAddress) {
      setContractDeployed(true);
    }
  };

  useEffect(() => {
    const fetchGameStarted = async () => {
      const gameStarted = await checkIfGameStarted();
      setIsGameStarted(gameStarted);
    };
    const fetchGameEnded = async () => {
      const gameEnded = await checkIfGameEnded();
      setIsGameEnded(gameEnded);
      if (gameEnded) {
        checkWinner().then((winner) => {
          setWinner(winner);
        });
      }
    };

    fetchGameStarted();
    fetchGameEnded();

    // toutes les 5 secondes
    const intervalId = setInterval(() => {
      fetchGameStarted();
      fetchGameEnded();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [checkIfGameStarted, checkIfGameEnded]);

  return (
    <div>
      {gameOption === "" ? (
        <div>
          <button onClick={() => setGameOption("join")}>
            Rejoindre un contrat
          </button>
          <button
            onClick={() => {
              setGameOption("deploy");
              deployContract();
            }}
          >
            Déployer un contrat
          </button>
        </div>
      ) : gameOption === "join" ? (
        <div>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="Entrez l'adresse du contrat"
          />
          <button onClick={joinContract}>Rejoindre</button>
        </div>
      ) : null}

      {contractDeployed ? ( // Afficher la page suivante seulement si le contrat a été déployé
        <>
          {isGameEnded ? (
            <span>Game ended, winner is: {winner}</span>
          ) : (
            <span>GameState : {isGameStarted ? "Started" : "Not Started"}</span>
          )}

          {myBoats.size < 5 && (
            <PlaceBoats
              onDone={(boats) => {
                setMyBoats(boats);
              }}
            />
          )}
          {myBoats.size === 5 && <PlayGame myBoats={myBoats} />}
        </>
      ) : (
        <span>Chargement...</span> // Afficher un message de chargement pendant que le contrat est en cours de déploiement
      )}
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
