'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import '../lib/base.css'
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

export default function Slider({ onImageRef, onImageClick }) {
  const cardImages = [card1, card2, card3, card4, card5]

  const sliderRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  const imageRefs = sliderRefs.map(() => useRef(null))
  const handleImageRef = (index, ref) => {
    // Pass the image ref to the GridToFullScreen component
    onImageRef(index, ref)
  }

  const router = useRouter();

  const handleSliderClick = (event, index) => {
    const slider = event.currentTarget;

    const scrollTrigger = ScrollTrigger.getById(`slider-${index}-trigger`);
    
    if (scrollTrigger) {
      const scrollToPosition = scrollTrigger.start;

      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: scrollToPosition,
          autoKill: false,
        },
        ease: 'power3',
        onComplete: () => {
          onImageClick(index);
        },
      });
    } else {
      console.warn(`ScrollTrigger not found for slider-${index}-trigger`);
      onImageClick(index);
    }
  };

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const sliders = sliderRefs.map((ref) => ref.current);

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
    });
  });

  return (
    <main className='main'>
      {sliderRefs.map((ref, index) => (
        <div
          key={index}
          id={`slider-${index}`}
          className='slider'
          ref={ref}
          onClick={(event) => handleSliderClick(event, index)}
          data-project-name={`cool-project-${index + 1}`}
        >
          <div className='titleCard'>
            <p className='labelType'>Branding</p>
          </div>
          <Image
            className='triggerItem'
            src={cardImages[index]}
            alt={`card${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
            }}
            ref={(ref) => onImageRef(index, ref)}
            
          />
        </div>
      ))}
    </main>
  )
}
