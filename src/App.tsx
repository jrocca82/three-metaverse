import { Suspense, useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { ethers } from "ethers";
import Land from "./abi/Land.json";
import { Plane } from "./components/Plane";
import { Plot } from "./components/Plot";
import Building from "./components/Building";
import { Canvas } from "@react-three/fiber";
import { Sky, MapControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";

export const App = () => {
  const [account, setAccount] = useState("");
  const [landContract, setLandContract] = useState(null);
  const [cost, setCost] = useState(0);
  const [buildings, setBuildings] = useState([]);

  //Contract states
  const [landName, setLandName] = useState("");
  const [landOwner, setLandOwner] = useState("");
  const [hasOwner, setHasOwner] = useState(false);
  const [landId, setLandId] = useState(0);

  const CONTRACT_ADDRESS = "0x78D670D17d7D588E88DF8fA108E9F5D44714667E";

  const web3Handler = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setAccount(account);
      } else {
        console.log("No authorized account found");
      }
    }
  };

  const loadBlockchainData = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Goerli test network
    const goerliChainId = "0x5";
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const landContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      Land.abi,
      signer
    );

    const cost = await landContract.cost; //TODO: Check if in wei or eth-- convert if needed
    console.log(cost);
    const buildings = await landContract.buildings();

    setLandContract(landContract);
    setCost(cost);
    setBuildings(buildings);
  };

  const buyHandler = async (_id: number) => {
    try {
      await landContract
        .mint(_id)
        .send({ from: account, value: "1000000000000000000" });

      const buildings = await landContract.getBuildings().call();
      setBuildings(buildings);

      setLandName(buildings[_id - 1].name);
      setLandOwner(buildings[_id - 1].owner);
      setHasOwner(true);
    } catch (error) {
      window.alert("Error occurred when buying");
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, [account]);

  return (
    <>
      <Navbar web3Handler={web3Handler} account={account} />
      <Canvas camera={{ position: [0, 0, 30], up: [0, 0, 1], far: 10000 }}>
        <Suspense fallback={null}>
          <Sky
            distance={450000}
            sunPosition={[1, 10, 0]}
            inclination={0}
            azimuth={0.25}
          />

          <ambientLight intensity={0.5} />

          {/* Load in each cell */}
          <Physics>
            {buildings &&
              buildings.map((building, index) => {
                if (
                  building.owner ===
                  "0x0000000000000000000000000000000000000000"
                ) {
                  return (
                    <Plot
                      key={index}
                      position={[building.posX, building.posY, 0.1]}
                      size={[building.sizeX, building.sizeY]}
                      landId={index + 1}
                      landInfo={building}
                      setLandName={setLandName}
                      setLandOwner={setLandOwner}
                      setHasOwner={setHasOwner}
                      setLandId={setLandId}
                    />
                  );
                } else {
                  return (
                    <Building
                      key={index}
                      position={[building.posX, building.posY, 0.1]}
                      size={[building.sizeX, building.sizeY, building.sizeZ]}
                      landId={index + 1}
                      landInfo={building}
                      setLandName={setLandName}
                      setLandOwner={setLandOwner}
                      setHasOwner={setHasOwner}
                      setLandId={setLandId}
                    />
                  );
                }
              })}
          </Physics>

          <Plane />
        </Suspense>
        <MapControls attachArray={undefined} attachObject={undefined} />
      </Canvas>

      {landId && (
        <div className="info">
          <h1 className="flex">{landName}</h1>

          <div className="flex-left">
            <div className="info--id">
              <h2>ID</h2>
              <p>{landId}</p>
            </div>

            <div className="info--owner">
              <h2>Owner</h2>
              <p>{landOwner}</p>
            </div>

            {!hasOwner && (
              <div className="info--owner">
                <h2>Cost</h2>
                <p>{`${cost} ETH`}</p>
              </div>
            )}
          </div>

          {!hasOwner && (
            <button
              onClick={() => buyHandler(landId)}
              className="button info--buy"
            >
              Buy Property
            </button>
          )}
        </div>
      )}
    </>
  );
};
