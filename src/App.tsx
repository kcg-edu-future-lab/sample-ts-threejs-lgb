import { createContext, Suspense } from 'react'
import { Vector3 } from 'three';
import { Canvas, useFrame } from '@react-three/fiber'
import { Gltf, KeyboardControls, PointerLockControls, useKeyboardControls } from "@react-three/drei";
import './App.css'
import { Madoi, PeerEntered, type PeerEnteredDetail, type PeerInfo } from 'madoi-client';
import { madoiKey, madoiUrl } from './keys';
import { LocalJsonStorage } from './LocalJsonStorage';
import { v4 as uuidv4 } from 'uuid';

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
        position: ls.get("position", [Math.random() * 300, Math.random() * 300])
      }
    }
  )
});

function Player() {
  const [, getKeys] = useKeyboardControls();

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
  });

  return <PointerLockControls />;
}

export default function App() {
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
        <Player />
        <Suspense fallback={null}>
          <Gltf src="/Scaniverse 2026-05-11 131013.glb" />
        </Suspense>
        <ambientLight intensity={1} />
      </Canvas>
    </KeyboardControls>
  </div>;
}
