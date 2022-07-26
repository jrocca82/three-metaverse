import { deployContract } from "../utils";
import { Land } from "../../../build/typechain";

export const contractNames = () => ["land"];

export const constructorArguments = () => [
  process.env.CONSTRUCTOR_LAND_NAME,
  process.env.CONSTRUCTOR_LAND_SYMBOL,
  process.env.CONSTRUCTOR_LAND_COST
];

export const deploy = async (deployer, setAddresses) => {
  console.log("deploying Token");
  const land: Land = (await deployContract(
    "Land",
    constructorArguments(),
    deployer,
    1
  )) as Land;
  console.log(`deployed Land Contract to address ${land.address}`);
  setAddresses({ land: land.address });
  return land;
};