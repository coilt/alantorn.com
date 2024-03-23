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

import card1 from '../../../../public/card_01.png'
import card2 from '../../../../public/card_02.png'
import card3 from '../../../../public/card_03.png'
import card4 from '../../../../public/card_04.png'
import card5 from '../../../../public/card_05.jpg'

export default function Slider() {
  const [pixelRatio, setPixelRatio] = useState(0);
  const sliderRef = useRef(null);
  const slider2Ref = useRef(null);
  const slider3Ref = useRef(null);
  const slider4Ref = useRef(null);
  const slider5Ref = useRef(null);
  const router = useRouter();
  const curtainsRef = useRef();

  useEffect(() => {
    setPixelRatio(Math.min(1.5, window.devicePixelRatio));
  }, []);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sliders = [sliderRef, slider2Ref, slider3Ref, slider4Ref, slider5Ref].map((ref) => ref.current);

    const handleSliderClick = (event) => {
      const slider = event.currentTarget;
      const zoomInTimeline = gsap.timeline();

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
        onComplete: () => {
          const featuredProjectName = slider.dataset.projectName || 'default-project-name';
          const url = `/featured/${featuredProjectName}`;
          const transitionTrigger = document.querySelector('.transition-trigger');
          if (transitionTrigger) {
            transitionTrigger.click();
          }
          router.push(url);
        },
      });
    };

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
            slider.style.visibility = 'hidden';
          },
          onEnterBack: () => {
            slider.style.visibility = 'visible';
          },
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
        { scale: 0.7, filter: 'blur(6px)', rotationX: 30 }
      );

      slider.addEventListener('click', handleSliderClick);
    });

    const mouse = new Vec2();

    const params = {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      widthSegments: 12,
      heightSegments: 12,
      uniforms: {
        time: {
          name: 'uTime',
          type: '1f',
          value: 0,
        },
        fullscreenTransition: {
          name: 'uTransition',
          type: '1f',
          value: 0,
        },
        mousePosition: {
          name: 'uMousePosition',
          type: '2f',
          value: mouse,
        },
      },
    };

    const curtains = new Curtains({
      container: 'canvas',
      pixelRatio: Math.min(1.5, window.devicePixelRatio),
      autoRender: false,
    });

    curtainsRef.current = curtains;

    curtains
      .onError(() => {
        console.log('Curtains.js error occurred');
        document.body.classList.add('no-curtains', 'planes-loaded');
      })
      .onContextLost(() => {
        console.log('WebGL context lost');
        curtains.restoreContext();
      });

    gsap.ticker.add(curtains.render.bind(curtains));

    const planes = [];
    const planeElements = document.getElementsByClassName('plane');

    for (let i = 0; i < planeElements.length; i++) {
      const plane = new Plane(curtains, planeElements[i], params);
      planes.push(plane);
      handlePlanes(i);
    }

    // handle all the planes
    function handlePlanes(index) {
      const plane = planes[index];

      plane
        .onReady(() => {
          plane.textures[0].setScale(new Vec2(1.5, 1.5));

          // apply parallax on load
          applyPlanesParallax(plane);

          // once everything is ready, display everything
          if (index === planes.length - 1) {
            document.body.classList.add('planes-loaded');
          }

          plane.htmlElement.addEventListener('click', (e) => {
            onPlaneClick(e, plane);
          });
        })
        .onAfterResize(() => {
          // if plane is displayed fullscreen, update its scale and translations
          if (plane.userData.isFullscreen) {
            const planeBoundingRect = plane.getBoundingRect();
            const curtainBoundingRect = curtains.getBoundingRect();

            plane.setScale(
              new Vec2(
                curtainBoundingRect.width / planeBoundingRect.width,
                curtainBoundingRect.height / planeBoundingRect.height
              )
            );

            plane.setRelativeTranslation(
              new Vec3(
                (-1 * planeBoundingRect.left) / curtains.pixelRatio,
                (-1 * planeBoundingRect.top) / curtains.pixelRatio,
                0
              )
            );
          }

          // apply new parallax values after resize
          applyPlanesParallax(plane);
        })
        .onRender(() => {
          plane.uniforms.time.value++;
        });
    }

    function applyPlanesParallax(plane) {
      // calculate the parallax effect
      // get our window size
      const sceneBoundingRect = curtains.getBoundingRect();
      // get our plane center coordinate
      const planeBoundingRect = plane.getBoundingRect();
      const planeOffsetTop = planeBoundingRect.top + planeBoundingRect.height / 2;
      // get a float value based on window height (0 means the plane is centered)
      const parallaxEffect = (planeOffsetTop - sceneBoundingRect.height / 2) / sceneBoundingRect.height;

      // set texture offset
      const texture = plane.textures[0];
      texture.offset.y = (1 - texture.scale.y) * 0.5 * parallaxEffect;
    }

    // GALLERY

    const galleryState = {
      fullscreenThumb: false, // is actually displaying a fullscreen image
      openTween: null,
      closeTween: null,
    };

    function onPlaneClick(event, plane) {
      // if no planes are already displayed fullscreen
      if (!galleryState.fullscreenThumb) {
        // set fullscreen state
        galleryState.fullscreenThumb = true;
        document.body.classList.add('is-fullscreen');

        // flag this plane
        plane.userData.isFullscreen = true;

        // put plane in front
        plane.setRenderOrder(1);

        // start ripple effect from mouse position, and tween it to center
        const startMousePostion = plane.mouseToPlaneCoords(mouse);
        plane.uniforms.mousePosition.value.copy(startMousePostion);
        plane.uniforms.time.value = 0;

        // we'll be using bounding rect values to tween scale and translation values
        const planeBoundingRect = plane.getBoundingRect();
        const curtainBoundingRect = curtains.getBoundingRect();

        // starting values
        let animation = {
          scaleX: 1,
          scaleY: 1,
          translationX: 0,
          translationY: 0,
          transition: 0,
          textureScale: 1.5,
          mouseX: startMousePostion.x,
          mouseY: startMousePostion.y,
        };

        // create vectors only once and use them later on during tween onUpdate callback
        const newScale = new Vec2();
        const newTranslation = new Vec3();

        // kill tween
        if (galleryState.openTween) {
          galleryState.openTween.kill();
        }

        // we want to take top left corner as our plane transform origin
        plane.setTransformOrigin(newTranslation);

        galleryState.openTween = gsap.to(animation, 2, {
          scaleX: curtainBoundingRect.width / planeBoundingRect.width,
          scaleY: curtainBoundingRect.height / planeBoundingRect.height,
          translationX: (-1 * planeBoundingRect.left) / curtains.pixelRatio,
          translationY: (-1 * planeBoundingRect.top) / curtains.pixelRatio,
          transition: 1,
          textureScale: 1,
          mouseX: 0,
          mouseY: 0,
          ease: Power3.easeInOut,
          onUpdate: function () {
            // plane scale
            newScale.set(animation.scaleX, animation.scaleY);
            plane.setScale(newScale);

            // plane translation
            newTranslation.set(animation.translationX, animation.translationY, 0);
            plane.setRelativeTranslation(newTranslation);

            // texture scale
            newScale.set(animation.textureScale, animation.textureScale);
            plane.textures[0].setScale(newScale);

            // transition value
            plane.uniforms.fullscreenTransition.value = animation.transition;

            // apply parallax to change texture offset
            applyPlanesParallax(plane);
          },
        });
      }
    }

    return () => {
      curtains.dispose();
    };
  });

  return (
    <main className={styles.main}>
       <div id="canvas"></div>
      <div ref={sliderRef} data-project-name="cool-project">
     
        <div className={styles.titleCard}>
          <p className={styles.labelType}>Branding</p>
        </div>
        <div className="plane-wrapper">
          <div className="plane">
            <img src="/card_01.png" crossOrigin="" data-sampler="planeTexture" />
          </div>
        </div>
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