'use client'

import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PresentationControls, Environment, Float } from '@react-three/drei'
import Model from './Model'

function ScrollingModel() {
  const { camera } = useThree()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      camera.position.y = -scrollTop / 100 // Adjust the divisor as needed
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [camera])

  return (
    <Float
      speed={0.5}
      rotationIntensity={1.2}
      floatIntensity={0.8}
    >
      <group scale={0.4}> {/* Adjust the scale value as needed */}
        <Model />
      </group>
    </Float>
  )
}

export default function Hero() {
  return (
    <Canvas
      style={{ backgroundColor: 'black', width: '100%', height: '100vh', pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 400 }}
        events={{ enabled: true, pointerEvents: 'auto' }}
      >
        <ScrollingModel />
      </PresentationControls>
      <perspectiveCamera position={[0, 0, 5]} />
      <Environment preset="city" />
    </Canvas>
  )
}