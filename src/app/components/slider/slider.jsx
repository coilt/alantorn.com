'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './slider.module.css'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useState, useRef, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CurtainsTransition from './CurtainsTransition'

import card1 from '../../../../public/card_01.png'
import card2 from '../../../../public/card_02.png'
import card3 from '../../../../public/card_03.png'
import card4 from '../../../../public/card_04.png'
import card5 from '../../../../public/card_05.jpg'

export default function Slider() {
  const [pixelRatio, setPixelRatio] = useState(0)
  const sliderRef = useRef(null)
  const slider2Ref = useRef(null)
  const slider3Ref = useRef(null)
  const slider4Ref = useRef(null)
  const slider5Ref = useRef(null)
  const router = useRouter()

  useEffect(() => {
    setPixelRatio(Math.min(1.5, window.devicePixelRatio))
  }, [])

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger)

    const sliders = [
      sliderRef,
      slider2Ref,
      slider3Ref,
      slider4Ref,
      slider5Ref,
    ].map((ref) => ref.current)

    const handleSliderClick = (event) => {
      const slider = event.currentTarget
      const zoomInTimeline = gsap.timeline()

      zoomInTimeline.to(slider, {
        scale: 1,
        filter: 'blur(0px)',
        rotationX: 0,
        duration: 1,
        x: '50%',
        y: '50%',
        xPercent: -50,
        yPercent: -50,
        zIndex: 999,
        ease: 'power3',
        width: '100vw',
        height: '100vh',
        // onStart: () => {
        //   slider.classList.add('sliderFullScreen')
        // },
        onComplete: () => {
          const featuredProjectName =
            slider.dataset.projectName || 'default-project-name'
          const url = `/featured/${featuredProjectName}`
          const transitionTrigger = document.querySelector(
            '.transition-trigger'
          )
          if (transitionTrigger) {
            transitionTrigger.click()
          }
          router.push(url)
        },
      })
    }

    sliders.forEach((slider, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          pin: true,
          trigger: slider,
          markers: false,
          scrub: 2,
          start: 'top 10%',
          end: `+=${slider.offsetHeight}`,
          onLeave: () => {
            slider.style.visibility = 'hidden'
          },
          onEnterBack: () => {
            slider.style.visibility = 'visible'
          },
        },
      })

      timeline.fromTo(
        slider,
        {
          transformStyle: 'preserve-3d',
          transformPerspective: 800,
          transformOrigin: 'center bottom',
          visibility: 'visible',
        },
        { scale: 0.7, filter: 'blur(6px)', rotationX: 30 }
      )
      slider.addEventListener('click', handleSliderClick)
    })
  })

  return (
    <main className={styles.main}>
      <div id='sliderContainer1' className={styles.slider} ref={sliderRef} data-project-name='cool-project'>
        <div className={styles.titleCard}>
          <p className={styles.labelType}>Branding</p>
        </div>
        <CurtainsTransition>
       <div  className={styles.plane} >
       
        <img src="/card_01_small_cr.png" crossOrigin="" data-sampler="planeTexture"/>
    
      </div>
      </CurtainsTransition>
      </div>
      <div className={styles.slider} ref={slider2Ref}>
        <div className={styles.titleCard}>
          <p className={styles.labelTypeRed}>Branding</p>
        </div>
        <Image
          src={card2}
          alt='card2'
          className={styles.heroImage}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      <div className={styles.slider} ref={slider3Ref}>
        <div className={styles.titleCard}>
          <p className={styles.labelTypeViolet}>Branding</p>
        </div>
        <Image
          src={card3}
          alt='card3'
          className={styles.heroImage}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      <div className={styles.slider} ref={slider4Ref}>
        <div className={styles.titleCard}>
          <p className={styles.labelTypeRed}>Pitch Deck</p>
        </div>
        <Image
          src={card4}
          alt='card4'
          className={styles.heroImage}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      <div className={styles.slider} ref={slider5Ref}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroVideo} // Assuming you have a class for styling the video
          style={{
            width: '100%',
            height: '100%',
          }}
          width={1920}
          height={1080}
        >
          <source src='/pearlcut.mp4' type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className={styles.spacerAfter}></div>
    </main>
  )
}
