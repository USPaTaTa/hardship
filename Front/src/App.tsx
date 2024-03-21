import { useEffect, useState } from "react";
import "./App.css";
import PlaceBoats from "./PlaceBoats";
import PlayGame from "./PlayGame";
import { Boat, BoatType } from "./model/Battleship";
import { ethers } from "ethers";
import BattleShipAbi from "./BattleShip.json";

function App() {
  const [myBoats, setMyBoats] = useState<Map<BoatType, Boat>>(new Map());

  useEffect(() => {
    testDapp();
  });

  const testDapp = async () => {
    let signer = null;

    let provider;
    console.log("test");

    if ((window as any).ethereum == null) {
      console.log("no provider! quit...");
      return;
    }
    console.log("provider", (window as any).ethereum);

    provider = new ethers.BrowserProvider((window as any).ethereum);
    signer = await provider.getSigner();
    console.log("signer", signer);

    console.log("qui suis-je:", await signer.getAddress());
    try {
      const newBattleShip = await deployNewBattleShip(signer);
      console.log(
        "Contrat déployé à l'adresse:",
        await newBattleShip!.getAddress()
      );
    } catch (error) {
      console.log("Erreur lors du déploiement:", error);
    }
  };

  async function deployNewBattleShip(signer: ethers.Signer) {
    const factory = new ethers.ContractFactory(
      BattleShipAbi.abi,
      BattleShipAbi.bytecode,
      signer
    );

    const deployTransaction = await factory.getDeployTransaction(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ); // replace "0xGuestAddress" with the actual guest address
    const deployedContract = await signer.sendTransaction(deployTransaction);
    const receipt = await deployedContract.wait();

    const contractAddress = receipt ? receipt.contractAddress : null;
    console.log("Battleship contract deployed at address:", contractAddress);

    // You can now interact with the deployed contract using ethers.Contract
    const deployedInstance = new ethers.Contract(
      contractAddress as string, // Type assertion to ensure contractAddress is of type string
      BattleShipAbi.abi,
      signer
    );

    return deployedInstance;
  }

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
