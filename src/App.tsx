import { Suspense } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Gltf, OrbitControls } from "@react-three/drei";
import { MOUSE } from 'three';

export default function App() {
  return (
    <div className="canvasContainer">
      <Canvas camera={{
          fov: 45, // 視野角
          position: [-8, 3, 8], // 位置
        }}
        shadows={"soft"} // 影を有効化
       >
        <ambientLight intensity={1} />
          <OrbitControls
            enableZoom={true}
            mouseButtons={{
              LEFT: MOUSE.PAN,
              MIDDLE: MOUSE.DOLLY,
              RIGHT: MOUSE.ROTATE,
            }}
        />
        <Suspense fallback={null}>
          <Gltf src="/H301.glb" />
        </Suspense>
      </Canvas>
    </div>)
}
