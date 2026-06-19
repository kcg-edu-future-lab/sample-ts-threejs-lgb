import { useRef } from "react";
import type { Group } from "three";
import { useFrame } from "@react-three/fiber";
import type { PeerInfo } from "madoi-client";
import type { PeerProfile } from "./App";

interface AvatarObjectProps{
  peer: PeerInfo<PeerProfile>;
}
export function AvatarObject({peer}: AvatarObjectProps) {
  const avatarRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);

  useFrame((_, _delta) => {
    if (avatarRef.current) {
      avatarRef.current.position.set(...(peer.profile["position"]));
    }
    if (bodyRef.current){
      const [x, y, z, w] = peer.profile["orientation"];
      bodyRef.current.rotation.y = Math.atan2(2 * (x * z + w * y), 1 - 2 * (x * x + y * y));
    }
    if (headRef.current) {
      headRef.current.quaternion.set(...(peer.profile["orientation"]));
    }
  });

  return (
    <group ref={avatarRef} position={peer.profile["position"]}>
      <group ref={headRef} position={[0, 0.25, 0]}>
        <mesh>
          <sphereGeometry args={[0.18, 24, 16]} />
          <meshStandardMaterial color="#f2c7a5" />
        </mesh>
        <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.045, 0.12, 12]} />
          <meshStandardMaterial color="#d99a78" />
        </mesh>
        <mesh position={[-0.065, 0.04, -0.145]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.065, 0.04, -0.145]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
      <group ref={bodyRef}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.18, 0.55, 8, 16]} />
          <meshStandardMaterial color="#3d6ee8" />
        </mesh>
        <mesh position={[-0.24, -0.2, 0]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.055, 0.45, 6, 12]} />
          <meshStandardMaterial color="#f2c7a5" />
        </mesh>
        <mesh position={[0.24, -0.2, 0]} rotation={[0, 0, -0.25]}>
          <capsuleGeometry args={[0.055, 0.45, 6, 12]} />
          <meshStandardMaterial color="#f2c7a5" />
        </mesh>
        <mesh position={[-0.08, -0.78, 0]}>
          <capsuleGeometry args={[0.07, 0.55, 6, 12]} />
          <meshStandardMaterial color="#29324a" />
        </mesh>
        <mesh position={[0.08, -0.78, 0]}>
          <capsuleGeometry args={[0.07, 0.55, 6, 12]} />
          <meshStandardMaterial color="#29324a" />
        </mesh>
      </group>
    </group>
  );
}
