import { useRef } from "react";
import { Vector3 } from "three";
import { PointerLockControls, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { vec3, vec4 } from "./App";

interface PlayerProps{
  onPositionChanged?: (position: vec3)=>void;
  onOrientationChanged?: (orientation: vec4)=>void;
}
export function Player({onPositionChanged, onOrientationChanged}: PlayerProps) {
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
