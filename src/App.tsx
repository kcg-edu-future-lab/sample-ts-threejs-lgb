import { createContext, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { Mesh, Vector3 } from 'three';
import { Canvas, useFrame } from '@react-three/fiber'
import { Gltf, KeyboardControls, PointerLockControls, useKeyboardControls } from "@react-three/drei";
import { v4 as uuidv4 } from 'uuid';
import './App.css'
import { madoiKey, madoiUrl } from './keys';
import { Madoi } from 'madoi-client';
import { useSharedModel } from 'madoi-client-react';
import { LocalJsonStorage } from './LocalJsonStorage';
import { PeerManager } from './PeerManager';
import type { Peer, PositionChangedDetail, OrientationChangedDetail, vec3, vec4 } from './Peer';

export function getLastPath(url: string){
    if(url.indexOf("?") != -1) url = url.substring(0, url.indexOf("?"));
    if(url == "/") url = "";
    return url.replace(/[\/:]/g, "_").split("#")[0];
}

const roomId: string = `sample-museum-${getLastPath(window.location.href)}-sdsdffs24df2sdfsfjo4`;
const ls = new LocalJsonStorage<{id: string, name: string, position: [number, number]}>(roomId);
export const MadoiContext = createContext({
  madoi: new Madoi(
    `${madoiUrl}/${roomId}`, madoiKey, {
      id: ls.get("id", ()=>uuidv4()),
      profile: {
        position: [-4, 1, 4], // 位置
        quaternion: [0, 1, 0, 0]
      }
    }
  )
});

interface PlayerProps{
  onPositionChanged?: (position: vec3)=>void;
  onOrientationChanged?: (orientation: vec4)=>void;
}
function Player({onPositionChanged, onOrientationChanged}: PlayerProps) {
  const [, getKeys] = useKeyboardControls();
  const changed = useRef(false);
  const pointerChanged = ()=>{
    changed.current = true;
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
      console.log("newpos", state.camera.position);
      if(onPositionChanged) onPositionChanged([p.x, p.y, p.z]);
    }

    if(changed.current){
      const q = state.camera.quaternion;
      console.log("orientation changed.", q)
      if(onOrientationChanged) onOrientationChanged([q.x, q.y, q.z, q.w]);
      changed.current = false;
    }
  });

  return <PointerLockControls onChange={pointerChanged}/>;
}

interface MovableObjectProps{
  peer: Peer;
}
function MovableObject({peer}: MovableObjectProps) {
  const ref = useRef<Mesh>(null);
  const [position, setPosition] = useState<vec3>(peer.position);
  const [orientation, setOrientation] = useState<vec4>(peer.orientation);
  const positionChanged = ({detail: {position}}: {detail: PositionChangedDetail})=>{
    setPosition(position);
  };
  const orientationChanged = ({detail: {orientation}}: {detail: OrientationChangedDetail})=>{
    setOrientation(orientation);
  };

  useEffect(()=>{
    peer.addEventListener("positionChanged", positionChanged);
    peer.addEventListener("orientationChanged", orientationChanged);
    return ()=>{
      peer.removeEventListener("positionChanged", positionChanged);
      peer.removeEventListener("orientationChanged", orientationChanged);
    }
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.setX(position[0]);
      ref.current.position.setY(position[1]);
      ref.current.position.setZ(position[2]);
      ref.current.quaternion.set(...orientation);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default function App() {
  const madoi = useContext(MadoiContext).madoi;
  const peerManager = useSharedModel(madoi, ()=>new PeerManager());

  const onSelfPositionChanged = (position: vec3)=>{
    madoi.updateSelfPeerProfile("position", position);
  };
  const onSelfOrientationChanged = (quaternion: vec4)=>{
    madoi.updateSelfPeerProfile("orientation", quaternion);
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
        {peerManager.otherAvatars.map(p =>{
          return <MovableObject peer={p}/>;
        })}
        <Suspense fallback={null}>
          <Gltf src="/Scaniverse 2026-05-11 131013.glb" />
        </Suspense>
        <ambientLight intensity={1} />
      </Canvas>
    </KeyboardControls>
  </div>;
}
