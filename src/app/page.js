'use client'
import React, { useRef } from 'react'
import Navbar from './components/Navbar'
import styles from './page.module.css'
import dynamic from 'next/dynamic'
import Slider from './components/slider/slider'
import { ReactLenis, useLenis } from '@studio-freight/react-lenis'
import GridToFullScreen from './components/GridToFullScreen' 

const Hero = dynamic(() => import('./components/Hero'), {
  ssr: false,
})

export default function Home() {
  const triggerItemRef = useRef(null);
  const lenis = useLenis(({ scroll }) => {})
  return (
    <ReactLenis root>
      <main className={styles.main}>
        
         <Navbar />
        <div className={styles.heroContainer}>
          
        </div>
        <GridToFullScreen triggerItemRef={triggerItemRef} />  
        <div ref={triggerItemRef}>Trigger Item</div>
      </main>
    </ReactLenis>
  )
}
