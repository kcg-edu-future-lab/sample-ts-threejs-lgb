import { createContext, Suspense, useContext, useRef } from 'react'
import { Group, Vector3 } from 'three';
import { Canvas, useFrame } from '@react-three/fiber'
import { Gltf, KeyboardControls, PointerLockControls, useKeyboardControls } from "@react-three/drei";
import { v4 as uuidv4 } from 'uuid';
import { Madoi, ROOMINFO_DEFAULT, type PeerInfo, type Profile } from 'madoi-client';
import { useOtherPeers } from 'madoi-client-react';
import { madoiKey, madoiUrl } from './keys';
import { LocalJsonStorage } from './LocalJsonStorage';
import './App.css'

type vec3 = [number, number, number];
type vec4 = [number, number, number, number];
interface PeerProfile extends Profile{
  position: vec3;
  orientation: vec4;
}
const lastPath = new URL(window.location.href).pathname.split("/").filter(Boolean).slice(-1)[0];
const roomId: string = `sample-museum-${lastPath}-sdsdffs24df2sdfsfjo4`;
const ls = new LocalJsonStorage<{id: string, name: string}>(roomId);
export const MadoiContext = createContext({
  madoi: new Madoi<PeerProfile>(
    `${madoiUrl}/${roomId}`, madoiKey, {
      id: ls.get("id", ()=>uuidv4()),
      profile: {
        position: [-4, 1, 4], // 位置
        orientation: [0, 1, 0, 0]  // 向き
      },
    },
    ROOMINFO_DEFAULT
  )
});

interface PlayerProps{
  onPositionChanged?: (position: vec3)=>void;
  onOrientationChanged?: (orientation: vec4)=>void;
}
function Player({onPositionChanged, onOrientationChanged}: PlayerProps) {
  const [, getKeys] = useKeyboardControls();
  const orientationChanged = useRef(false);
  const onPointerChanged = ()=>{
    orientationChanged.current = true;
  };

  useFrame((state, delta) => {
    const { forward, backward, left, right } = getKeys();
    
    // Calculate movement direction
    const direction = new Vector3();
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    // Move the camera/player
    direction.normalize().multiplyScalar(5 * delta);
    state.camera.translateOnAxis(direction, 1);
    state.camera.position.setY(1);
    if(forward || backward || left || right){
      const p = state.camera.position;
      if(onPositionChanged) onPositionChanged([p.x, p.y, p.z]);
    }

    if(orientationChanged.current){
      const q = state.camera.quaternion;
      if(onOrientationChanged) onOrientationChanged([q.x, q.y, q.z, q.w]);
      orientationChanged.current = false;
    }
  });

  return <PointerLockControls onChange={onPointerChanged}/>;
}

interface AvatarObjectProps{
  peer: PeerInfo<PeerProfile>;
}
function AvatarObject({peer}: AvatarObjectProps) {
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

export default function App() {
  const madoi = useContext(MadoiContext).madoi;
  const otherPeers = useOtherPeers(madoi);

  const onSelfPositionChanged = (position: vec3)=>{
    madoi.updateSelfPeerProfile("position", position);
  };
  const onSelfOrientationChanged = (orientation: vec4)=>{
    madoi.updateSelfPeerProfile("orientation", orientation);
  };

  return <div style={{width: "100%", height: "100%"}}>
    <KeyboardControls map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
      ]}>
      <Canvas style={{width: "100%", height: "640px"}}
        camera={{
          fov: 45, // 視野角
          position: [-4, 1, 4], // 位置
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 1, 0);
        }}>
        <Player onPositionChanged={onSelfPositionChanged} onOrientationChanged={onSelfOrientationChanged} />
        {otherPeers.map(p =>{
          return <AvatarObject key={p.id} peer={p}/>;
        })}
        <Suspense fallback={null}>
          <Gltf src="./Scaniverse 2026-05-11 131013.glb" />
        </Suspense>
        <ambientLight intensity={1} />
      </Canvas>
    </KeyboardControls>
  </div>;
}
