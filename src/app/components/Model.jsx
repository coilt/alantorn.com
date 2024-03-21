'use client'
import React, { useRef } from 'react'
import { Text, useGLTF, MeshTransmissionMaterial } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'

export default function Model() {
  const mesh = useRef()
  const { nodes } = useGLTF('./bolt.glb')
  const { viewport } = useThree()

  // Define different scale values based on screen width breakpoints
  let scale = 4; // Default scale
  if (viewport.width < 768) {
    scale = 2; // Adjust scale for smaller screens
  } else if (viewport.width >= 768 && viewport.width < 1024) {
    scale = 3; // Adjust scale for medium screens
  }


  return (
    <group scale={4}>
      <Text
        font='/fonts/snes-i.woff'
        fontSize={1.4}
        letterSpacing={0.12}
        position={[0, 0, -1]}
        color='white'
      >
        Alan Torn
      </Text>

      <Text
        font='/fonts/asap-c-r.woff'
        fontSize={0.2}
        letterSpacing={0.055}
        position={[0, -1.2, -1]}
        color='white'
      >
        Designer&#x26a1;Developer
      </Text>
      <mesh ref={mesh} {...nodes.bolt}>
        <MeshTransmissionMaterial
          thickness={1}
          roughness={0.14}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.06}
          backside
          samples={12}
          color='#ffff00'
        />
      </mesh>
    </group>
  )
}
