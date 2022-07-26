import * as THREE from "three";
import { TextureLoader } from "three";
import { useLoader, Vector3 } from "@react-three/fiber";
import { useRef } from "react";

import MetalMap from "../assets/MetalMap.png";
import MetalNormalMap from "../assets/MetalNormalMap.png";

type Props = {
  position: Vector3;
  size: [
    width?: number,
    height?: number,
    widthSegments?: number,
    heightSegments?: number
  ];
  landId: number;
  landInfo: {
    name: string;
    owner: string;
    hasOwner: boolean;
  };
  setLandName: (name: string) => void;
  setLandOwner: (owner: string) => void;
  setHasOwner: (hasOwner: boolean) => void;
  setLandId: (landId: number) => void;
};

const Building = (props: JSX.IntrinsicElements["mesh"] & Props) => {
  const ref = useRef<THREE.Mesh>(null!);
  const [surface, color] = useLoader(TextureLoader, [MetalNormalMap, MetalMap]);

  const clickHandler = () => {
    props.setLandName(props.landInfo.name);
    props.setLandId(props.landId);

    if (props.landInfo.owner === "0x0000000000000000000000000000000000000000") {
      props.setLandOwner("No Owner");
      props.setHasOwner(false);
    } else {
      props.setLandOwner(props.landInfo.owner);
      props.setHasOwner(true);
    }
  };

  return (
    <mesh {...props} ref={ref} position={props.position} onClick={clickHandler}>
      <boxBufferGeometry args={props.size} />
      <meshStandardMaterial map={color} normalMap={surface} metalness={0.25} />
    </mesh>
  );
};

export default Building;
