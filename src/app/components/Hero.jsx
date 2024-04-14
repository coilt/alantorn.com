'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, ScrollControls } from '@react-three/drei'
import { easing } from 'maath'
import Model from './Model'

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

  return null
}

export default function Hero() {
  const canvasRef = useRef(null)

  return (
    <Canvas
      style={{ backgroundColor: 'black', width: '100%', height: '100vh' }}
      camera={{ position: [0, 0, 20], fov: 50 }}
    >
      <ScrollControls pages={3} damping={0.1}>
        <Environment preset="city" />
        <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} />
        <Float floatIntensity={2}>
          <Model />
        </Float>
        <Rig />
      </ScrollControls>
    </Canvas>
  )
}