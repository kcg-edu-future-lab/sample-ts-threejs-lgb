import { createContext, Suspense, useContext, useRef } from 'react'
import { Mesh, Vector3 } from 'three';
import { Canvas, useFrame } from '@react-three/fiber'
import { Gltf, KeyboardControls, PointerLockControls, useKeyboardControls } from "@react-three/drei";
import { v4 as uuidv4 } from 'uuid';
import { Madoi, ROOMINFO_DEFAULT, type PeerInfo, type Profile } from 'madoi-client';
import { useOtherPeers } from 'madoi-client-react';
import './App.css'
import { madoiKey, madoiUrl } from './keys';
import { LocalJsonStorage } from './LocalJsonStorage';

interface PeerProfile extends Profile{
  position: vec3;
  orientation: vec4;
}
export function getLastPath(url: string){
    if(url.indexOf("?") != -1) url = url.substring(0, url.indexOf("?"));
    if(url == "/") url = "";
    return url.replace(/[\/:]/g, "_").split("#")[0];
}
const roomId: string = `sample-museum-${getLastPath(window.location.href)}-sdsdffs24df2sdfsfjo4`;
const ls = new LocalJsonStorage<{id: string, name: string, position: [number, number]}>(roomId);
export const MadoiContext = createContext({
  madoi: new Madoi<PeerProfile>(
    `${madoiUrl}/${roomId}`, madoiKey, {
      id: ls.get("id", ()=>uuidv4()),
      profile: {
        position: [-4, 1, 4], // 位置
        orientation: [0, 1, 0, 0]
      },
    },
    ROOMINFO_DEFAULT
  )
});

type vec3 = [number, number, number];
type vec4 = [number, number, number, number];
interface PlayerProps{
  onPositionChanged?: (position: vec3)=>void;
  onOrientationChanged?: (orientation: vec4)=>void;
}
function Player({onPositionChanged, onOrientationChanged}: PlayerProps) {
  const [, getKeys] = useKeyboardControls();
  const orientationChanged = useRef(false);
  const onPointerChanged = ()=>{
    orientationChanged.current = true;
  }

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

interface MovableObjectProps{
  peer: PeerInfo<PeerProfile>;
}
function MovableObject({peer}: MovableObjectProps) {
  const ref = useRef<Mesh>(null);

  useFrame((_, _delta) => {
    if (ref.current) {
      ref.current.position.set(...(peer.profile["position"] as vec3));
      ref.current.quaternion.set(...(peer.profile["orientation"] as vec4));
    }
  });

  return (
    <mesh ref={ref} position={peer.profile["position"]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
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
          return <MovableObject key={p.id} peer={p}/>;
        })}
        <Suspense fallback={null}>
          <Gltf src="./Scaniverse 2026-05-11 131013.glb" />
        </Suspense>
        <ambientLight intensity={1} />
      </Canvas>
    </KeyboardControls>
  </div>;
}
