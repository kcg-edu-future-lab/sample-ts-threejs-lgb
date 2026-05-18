import { Suspense } from 'react'
import { Vector3 } from 'three';
import { Canvas, useFrame } from '@react-three/fiber'
import { Gltf, KeyboardControls, PointerLockControls, useKeyboardControls } from "@react-three/drei";
import './App.css'

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
