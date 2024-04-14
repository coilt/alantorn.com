'use client'

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Vector2, Vector4, DoubleSide } from 'three'
import { gsap } from 'gsap'
import Slider from './slider/slider'

import {
  activations,
  transformations,
  createVertex,
  fragmentShader,
} from './lib/shaders/shaders'

// choose activation type
const vertexShader = createVertex

import './lib/base.css'

const GridToFullScreen = () => {

  // mesh textures
  const triggerItems = [
    {
      src: '/card_01.png',
    },
    {
      src: '/card_02.png',
    },
    {
      src: '/card_03.png',
    },
    {
      src: '/card_04.png',
    },
    {
      src: '/card_05.jpg',
    },
  ]

  const itemsRef = useRef([])
  const meshRef = useRef()
  const [rect, setRect] = useState(null)
  const uniformsRef = useRef()
  const canvasRef = useRef()
  const [clickedIndex, setClickedIndex] = useState(null)

  // mesh scaling refs:
  const meshScaleRef = useRef(new Vector2(1, 1))
  const meshPositionRef = useRef(new Vector2(0, 0))
  const viewSizeRef = useRef(new Vector2(1, 1))

  const getViewSize = (camera) => {
    const fovInRadians = (camera.fov * Math.PI) / 180
    const height = Math.abs(camera.position.z * Math.tan(fovInRadians / 2) * 2)
    return { width: height * camera.aspect, height }
  }

  const updateRect = () => {
    if (clickedIndex !== null && itemsRef.current[clickedIndex]) {
      const newRect = itemsRef.current[clickedIndex].getBoundingClientRect()
      setRect(newRect)
    }
  }

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('resize', updateRect)
    }
  }, [clickedIndex])

  const handleImageRef = (index, ref) => {
    itemsRef.current[index] = ref
  }

  const handleImageClick = (index) => {
    setClickedIndex(index)
    const canvas = canvasRef.current
    canvas.style.zIndex = '2'
  
    // Start the mesh animation immediately
    if (meshRef.current) {
      meshRef.current.material.uniforms.uProgress.value = 0
      gsap.to(meshRef.current.material.uniforms.uProgress, {
        value: 1,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          // Check the progress of the mesh animation
          const progress = meshRef.current.material.uniforms.uProgress.value
          if (progress >= 0.8) {
            // Hide the clicked image when the mesh animation reaches 80% progress
            const clickedImage = itemsRef.current[index]
            if (clickedImage) {
              clickedImage.style.visibility = 'hidden'
            }
          }
        },
        onComplete: () => {
          // Ensure the clicked image is hidden when the mesh animation completes
          const clickedImage = itemsRef.current[index]
          if (clickedImage) {
            clickedImage.style.visibility = 'hidden'
          }
        },
      })
    }
  }
 

  

  // R3F scene
  function Setup({ meshRef, clickedIndex }) {
    const textures = useTexture(triggerItems.map((item) => item.src))
    const camera = useThree((state) => state.camera)

    const activationType = 'top'
    const transformationType = 'wavy'

    const uniforms = useMemo(
      () => ({
        uProgress: { value: 0 },
        uMeshScale: { value: new Vector2(1, 1) },
        uMeshPosition: { value: new Vector2(0, 0) },
        uViewSize: { value: viewSizeRef.current },
        uTexture: { value: null },

        uBeizerControls: { value: new Vector4(0.5, 0.5, 0.5, 0.5) },
        uSyncLatestStart: { value: 0.5 },
        uSeed: { value: 0 },
        uAmplitude: { value: 0.6 },
        uFrequency: { value: 8 },

        uAmplitude: { value: 0.5 },
        uFrequency: { value: 4.0 },
      }),
      []
    )

    const activationFunction = activations[activationType]
    const transformationFunction = transformations[transformationType]()

    const vertexShader = createVertex(
      activationFunction,
      transformationFunction
    )

    useEffect(() => {
      if (clickedIndex !== null && meshRef.current) {
        const triggerItem = itemsRef.current[clickedIndex]
        const { width, height, left, top } = triggerItem.getBoundingClientRect()
        const canvas = canvasRef.current
        const viewSize = getViewSize(camera)

        const widthViewUnit = (width * viewSize.width) / window.innerWidth
        const heightViewUnit = (height * viewSize.height) / window.innerHeight

        let xViewUnit = (left * viewSize.width) / window.innerWidth
        let yViewUnit = (top * viewSize.height) / window.innerHeight

        xViewUnit = xViewUnit - viewSize.width / 2
        yViewUnit = yViewUnit - viewSize.height / 2

        let x = xViewUnit + widthViewUnit / 2
        let y = -yViewUnit - heightViewUnit / 2

        meshRef.current.scale.set(widthViewUnit, heightViewUnit, 1)
        meshRef.current.position.set(x, y, 0)

        meshScaleRef.current.set(widthViewUnit, heightViewUnit)
        meshPositionRef.current.set(x, y)

        // update uMeshPosition uniform
        meshRef.current.material.uniforms.uMeshPosition.value.set(
          x / widthViewUnit,
          y / heightViewUnit
        )

        // update uMeshScale uniform
        meshRef.current.material.uniforms.uMeshScale.value.set(
          widthViewUnit,
          heightViewUnit
        )

        // bring the canvas to a higher z-index
        canvas.style.zIndex = '2'

        // trigger the scaling animation
        meshRef.current.material.uniforms.uProgress.value = 0
        gsap.to(meshRef.current.material.uniforms.uProgress, {
          value: 1,
          duration: 1,
          ease: 'power2.out',
        })
      }
    }, [clickedIndex])

    useEffect(() => {
      if (meshRef.current && clickedIndex !== null) {
        const material = meshRef.current.material
        material.uniforms.uTexture.value = textures[clickedIndex]
        material.needsUpdate = true
      }
    }, [clickedIndex, textures])

    useEffect(() => {
      const viewSize = getViewSize(camera)
      if (meshRef.current) {
        meshRef.current.material.uniforms.uViewSize.value.set(
          viewSize.width,
          viewSize.height
        )
      }
    }, [camera])

    useEffect(() => {
      uniformsRef.current = uniforms
    }, [uniforms])

    return (
      <>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <planeGeometry args={[1, 1, 128, 128]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
          />
        </mesh>
      </>
    )
  }

  return (
    <>
      <div className='grid' id='itemsWrapper'>
        <Canvas
          ref={canvasRef}
          camera={{ fov: 50, position: [0, 0, 20] }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        >
          <Suspense fallback={null}>
            <Setup meshRef={meshRef} clickedIndex={clickedIndex} />
          </Suspense>
        </Canvas>
        <Slider onImageRef={handleImageRef} onImageClick={handleImageClick} />
      </div>
    </>
  )
}

export default GridToFullScreen