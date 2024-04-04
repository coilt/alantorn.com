'use client'

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Vector2, Vector4, Uniform, DoubleSide } from 'three'
import { gsap } from 'gsap'
import Slider from './slider/slider'

import {
  activations,
  transformations,
  createVertex,
  fragmentShader,
} from './shaders/shaders'

// choose activation type
const vertexShader = createVertex

import '../base.css'

const GridToFullScreen = () => {
  const triggerItemRef = useRef(null)
  const meshRef = useRef()
  const meshMaterialRef = useRef()
  const [rect, setRect] = useState(null)
  const uniformsRef = useRef()
  const canvasRef = useRef()

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
    if (triggerItemRef.current) {
      const newRect = triggerItemRef.current.getBoundingClientRect()
      setRect(newRect)
    }
  }

  useEffect(() => {
    if (triggerItemRef.current) {
      triggerItemRef.current.addEventListener('click', handleTriggerItemClick)
    }

    updateRect()
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('resize', updateRect)
    }
  }, [])

  useEffect(() => {
    if (rect) {
      // console.log('rect:', rect)
    }
  }, [rect])

  const handleTriggerItemClick = (camera) => {
    console.log('item click passed')
    if (meshRef.current && rect && meshMaterialRef.current) {
      const { width, height, left, top } = rect

      const canvas = canvasRef.current
      const canvasRect = canvas.getBoundingClientRect()

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
      meshMaterialRef.current.uniforms.uMeshPosition.value.set(
        x / widthViewUnit,
        y / heightViewUnit
      )

      // update uMeshScale uniform
      meshMaterialRef.current.uniforms.uMeshScale.value.set(
        widthViewUnit,
        heightViewUnit
      )

      // hide the trigger item immediately
      triggerItemRef.current.style.display = 'none'

      // bring the canvas to a higher z-index
      canvas.style.zIndex = '2'

      // trigger the scaling animation
      meshMaterialRef.current.uniforms.uProgress.value = 0
      gsap.to(meshMaterialRef.current.uniforms.uProgress, {
        value: 1,
        duration: 1,
        ease: 'power2.Out',
      })
    }
  }

  // R3F scene
  function Setup({ meshRef }) {
    const [meshVisible, setMeshVisible] = useState(false);
    const [textureMap] = useTexture(['./img/4_large.jpg'])
    const camera = useThree((state) => state.camera)
    const meshMaterial = useRef(null)

    const activationType = 'top'
    const transformationType = 'wavy'

    const uniforms = useMemo(
      () => ({
        // calculated Uniforms
        uProgress: { value: 0 },
        uMeshScale: { value: new Vector2(1, 1) },
        uMeshPosition: { value: new Vector2(0, 0) },
        uViewSize: { value: viewSizeRef.current },
        uTexture: { value: textureMap },

        // transformations

        uBeizerControls: { value: new Vector4(0.5, 0.5, 0.5, 0.5) },
        uSyncLatestStart: { value: 0.5 },
        uSeed: { value: 0 },
        uAmplitude: { value: 0.6 },
        uFrequency: { value: 8 },

        // options uniforms
        uAmplitude: { value: 0.5 },
    uFrequency: { value: 4.0 },
      }),
      [textureMap]
    )

    const activationFunction = activations[activationType]
    const transformationFunction = transformations[transformationType]()

    const vertexShader = createVertex(activationFunction, transformationFunction);

    useEffect(() => {
      const viewSize = getViewSize(camera)
      if (meshMaterialRef.current) {
        meshMaterialRef.current.uniforms.uViewSize.value.set(
          viewSize.width,
          viewSize.height
        )
      }
    }, [camera])

    useEffect(() => {
      uniformsRef.current = uniforms
    }, [uniforms])

    useEffect(() => {
      if (triggerItemRef.current) {
        triggerItemRef.current.addEventListener('click', () => {
          handleTriggerItemClick(camera);
          setMeshVisible(true); // Set mesh visible
        });
      }
    
      return () => {
        if (triggerItemRef.current) {
          triggerItemRef.current.removeEventListener('click', () =>
            handleTriggerItemClick(camera)
          );
        }
      };
    }, [camera]);

    return (
      <>
        <mesh ref={meshRef} position={[0, 0, 0]} visible={meshVisible}>
          <planeGeometry args={[1, 1, 128, 128]} />
          <shaderMaterial
            ref={meshMaterialRef}
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
            <Setup meshRef={meshRef}
            
            
            
            />
          </Suspense>
        </Canvas>
        <div className='itemContainer'>
          <img
            className='triggerItem'
            ref={triggerItemRef}
            src='img/4_large.jpg'
          />
        </div>
      </div>
    </>
  )
}

export default GridToFullScreen
