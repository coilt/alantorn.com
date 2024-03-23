'use client'
import Navbar from './components/Navbar'
import styles from './page.module.css'
import dynamic from 'next/dynamic'
import Slider from './components/slider/Slider'
import { ReactLenis, useLenis } from '@studio-freight/react-lenis'

const Hero = dynamic(() => import('./components/Hero'), {
  ssr: false,
})

export default function Home() {
  const lenis = useLenis(({ scroll }) => {})
  return (
    <ReactLenis root>
      <main className={styles.main}>
        <Navbar />
        <div className={styles.heroContainer}>
          <Hero /> <div className={styles.zoomImage}> </div>
        </div>
        <Slider />
      </main>
    </ReactLenis>
  )
}
