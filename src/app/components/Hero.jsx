'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Environment, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import Model from './Model'

export default function Hero() {
  function Rig() {
    useFrame((state, delta) => {
      easing.damp3(
        state.camera.position,
        [
          Math.sin(-state.pointer.x) * 5,
          state.pointer.y * 3.5,
          15 + Math.cos(state.pointer.x) * 10,
        ],
        0.2,
        delta
      )
      state.camera.lookAt(0, 0, 0)
    })
  }

  return (
    <Canvas
      style={{ backgroundColor: 'black'}}
      camera={{ position: [0, 0, 20], fov: 50 }}
    >
      <Environment preset='city'></Environment>
       

      <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} />
      <Float floatIntensity={2}>
        <Model />
      </Float>

      <Rig />
    </Canvas>
  )
}
