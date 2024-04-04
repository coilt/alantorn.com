'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import styles from './slider.module.css'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import card1 from '../../../../public/card_01.png'
import card2 from '../../../../public/card_02.png'
import card3 from '../../../../public/card_03.png'
import card4 from '../../../../public/card_04.png'
import card5 from '../../../../public/card_05.jpg'

const cardImages = [card1, card2, card3, card4, card5]

export default function Slider() {
  const sliderRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  const router = useRouter()

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const sliders = sliderRefs.map((ref) => ref.current);

    const handleSliderClick = (event) => {
      const slider = event.currentTarget;
      const index = sliders.indexOf(slider);

      const scrollTrigger = ScrollTrigger.getById(`slider-${index}-trigger`);
      const scrollToPosition = scrollTrigger.start;

      gsap.to(window, {
        duration: 0.5,
        scrollTo: {
          y: scrollToPosition,
          autoKill: false,
        },
        ease: 'power3',
      });
    };

    sliders.forEach((slider, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: `slider-${index}-trigger`,
          pin: true,
          trigger: slider,
          markers: true,
          scrub: 2,
          start: 'top 10%',
          end: `+=${slider.offsetHeight}`,
          onLeave: () => {
            slider.style.visibility = 'hidden';
          },
          onEnterBack: () => {
            slider.style.visibility = 'visible';
          },
        },
      });

      // rotating slider array
      timeline.fromTo(
        slider,
        {
          transformStyle: 'preserve-3d',
          transformPerspective: 800,
          transformOrigin: 'center bottom',
          visibility: 'visible',
        },
        { scale: 0.7, filter: 'blur(6px)', rotationX: 30 }
      );

      slider.addEventListener('click', handleSliderClick);
    });
  });

  return (
    <main className={styles.main}>
      {sliderRefs.map((ref, index) => (
        <div
          key={index}
          id={`slider-${index}`}
          className={styles.slider}
          ref={ref}
          data-project-name={`cool-project-${index + 1}`}
        >
          <div className={styles.titleCard}>
            <p className={styles.labelType}>Branding</p>
          </div>
          <Image
            src={cardImages[index]}
            alt={`card${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
            }}
          />
        </div>
      ))}
    </main>
  )
}
