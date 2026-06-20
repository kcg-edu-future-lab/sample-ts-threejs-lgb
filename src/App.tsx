import { createContext, Suspense, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { Gltf, KeyboardControls } from "@react-three/drei";
import { v4 as uuidv4 } from 'uuid';
import { Madoi, type Profile } from 'madoi-client';
import { useOtherPeers } from 'madoi-client-react';
import { madoiKey, madoiUrl } from './keys';
import { LocalJsonStorage } from './LocalJsonStorage';
import { AvatarObject } from './Avatar';
import './App.css'
import { Player } from './Player';
import { Chat } from './Chat';

export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];
export interface PeerProfile extends Profile{
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
    }
  )
});

export default function App() {
  const madoi = useContext(MadoiContext).madoi;
  const otherPeers = useOtherPeers(madoi);

  const onSelfPositionChanged = (position: vec3)=>{
    madoi.updateSelfPeerProfile("position", position);
  };
  const onSelfOrientationChanged = (orientation: vec4)=>{
    madoi.updateSelfPeerProfile("orientation", orientation);
  };

  return <div className="appLayout">
    <div className="canvasPane">
      <KeyboardControls map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
      ]}>
        <Canvas
          style={{width: "100%", height: "640px"}}
          camera={{
            fov: 45, // 視野角
            position: [-4, 1, 4], // 位置
          }}
          onCreated={({ camera }) => {
            camera.lookAt(0, 1, 0);
        }}>
          <Player
            onPositionChanged={onSelfPositionChanged}
            onOrientationChanged={onSelfOrientationChanged} />
          {otherPeers.map(p =>{
            return <AvatarObject key={p.id} peer={p}/>;
          })}
          <Suspense fallback={null}>
            <Gltf src="./Scaniverse 2026-05-11 131013.glb" />
          </Suspense>
          <ambientLight intensity={1} />
        </Canvas>
      </KeyboardControls>
    </div>
    <Chat madoi={madoi} />
  </div>;
}
