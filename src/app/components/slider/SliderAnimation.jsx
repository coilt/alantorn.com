'use client'
import { useEffect, useRef, useState } from 'react';
import { gsap, Power3 } from 'gsap';
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Curtains, Plane, Vec2, Vec3 } from 'curtainsjs';
import styles from './slider.module.css';
import { vertexShader, fragmentShader } from '../lib/shaders/shaders';
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import CurtainsTransition from './CurtainsTransition';

import card1 from '../../../../public/card_01.png'
import card2 from '../../../../public/card_02.png'
import card3 from '../../../../public/card_03.png'
import card4 from '../../../../public/card_04.png'
import card5 from '../../../../public/card_05.jpg'

export default function SliderAnimation() {
  const [pixelRatio, setPixelRatio] = useState(0);
  const sliderRef = useRef(null);
  const slider2Ref = useRef(null);
  const slider3Ref = useRef(null);
  const slider4Ref = useRef(null);
  const slider5Ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setPixelRatio(Math.min(1.5, window.devicePixelRatio));
  }, []);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sliders = [sliderRef, slider2Ref, slider3Ref, slider4Ref, slider5Ref].map((ref) => ref.current);

    sliders.forEach((slider, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: slider,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      timeline.fromTo(
        slider,
        {
          transformStyle: 'preserve-3d',
          transformPerspective: 800,
          transformOrigin: 'center bottom',
          visibility: 'visible',
        },
        {
          scale: 0.7,
          filter: 'blur(6px)',
          rotationX: 30,
          duration: 1,
        }
      );
    });
  });

  return (
    <main className={styles.main}>
      <div className={styles.slider} ref={sliderRef} data-project-name="cool-project">
        <div className={styles.titleCard}>
          <p className={styles.labelType}>Branding</p>
        </div>

     <CurtainsTransition>
       
          <img src="/card_01.png" alt="Card 1" />
          
       
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
  );
}