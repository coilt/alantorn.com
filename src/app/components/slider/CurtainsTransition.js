'use client'
import { useRef } from 'react'
import { Curtains, Plane, Vec2, Vec3 } from 'curtainsjs'
import { Power3, gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { vertexShader, fragmentShader } from '../lib/shaders/shaders'
 
import './curtains.css'

const CurtainsTransition = () => {
  const curtainsRef = useRef()

  useGSAP(() => {
    const mouse = new Vec2()

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
    }

    const curtains = new Curtains({
      container: 'canvas',
      pixelRatio: Math.min(1.5, window.devicePixelRatio),
      autoRender: false,
    })

    curtainsRef.current = curtains

    curtains
      .onError(() => {
        console.log('Curtains.js error occurred')
        document.body.classList.add('no-curtains', 'planes-loaded')
      })
      .onContextLost(() => {
        console.log('WebGL context lost')
        curtains.restoreContext()
      })

    gsap.ticker.add(curtains.render.bind(curtains))

    const planes = []
    const planeElements = document.getElementsByClassName('plane')

    for (let i = 0; i < planeElements.length; i++) {
      const plane = new Plane(curtains, planeElements[i], params)
      planes.push(plane)
      handlePlanes(i)
    }

    // handle all the planes
    function handlePlanes(index) {
      const plane = planes[index]

      plane
        .onReady(() => {
          plane.textures[0].setScale(new Vec2(1.5, 1.5))

          // apply parallax on load
          applyPlanesParallax(plane)

          // once everything is ready, display everything
          if (index === planes.length - 1) {
            document.body.classList.add('planes-loaded')
          }

          plane.htmlElement.addEventListener('click', (e) => {
            onPlaneClick(e, plane)
          })
        })
        .onAfterResize(() => {
          // if plane is displayed fullscreen, update its scale and translations
          if (plane.userData.isFullscreen) {
            const planeBoundingRect = plane.getBoundingRect()
            const curtainBoundingRect = curtains.getBoundingRect()

            plane.setScale(
              new Vec2(
                curtainBoundingRect.width / planeBoundingRect.width,
                curtainBoundingRect.height / planeBoundingRect.height
              )
            )

            plane.setRelativeTranslation(
              new Vec3(
                (-1 * planeBoundingRect.left) / curtains.pixelRatio,
                (-1 * planeBoundingRect.top) / curtains.pixelRatio,
                0
              )
            )
          }

          // apply new parallax values after resize
          applyPlanesParallax(plane)
        })
        .onRender(() => {
          plane.uniforms.time.value++
        })
    }

    function applyPlanesParallax(plane) {
      // calculate the parallax effect
      // get our window size
      const sceneBoundingRect = curtains.getBoundingRect()
      // get our plane center coordinate
      const planeBoundingRect = plane.getBoundingRect()
      const planeOffsetTop =
        planeBoundingRect.top + planeBoundingRect.height / 2
      // get a float value based on window height (0 means the plane is centered)
      const parallaxEffect =
        (planeOffsetTop - sceneBoundingRect.height / 2) /
        sceneBoundingRect.height

      // set texture offset
      const texture = plane.textures[0]
      texture.offset.y = (1 - texture.scale.y) * 0.5 * parallaxEffect
    }

    // GALLERY

    const galleryState = {
      fullscreenThumb: false, // is actually displaying a fullscreen image
      openTween: null,
      closeTween: null,
    }

    function onPlaneClick(event, plane) {
      // if no planes are already displayed fullscreen
      if (!galleryState.fullscreenThumb) {
        // set fullscreen state
        galleryState.fullscreenThumb = true
        document.body.classList.add('is-fullscreen')

        // flag this plane
        plane.userData.isFullscreen = true

        // put plane in front
        plane.setRenderOrder(1)

        // start ripple effect from mouse position, and tween it to center
        const startMousePostion = plane.mouseToPlaneCoords(mouse)
        plane.uniforms.mousePosition.value.copy(startMousePostion)
        plane.uniforms.time.value = 0

        // we'll be using bounding rect values to tween scale and translation values
        const planeBoundingRect = plane.getBoundingRect()
        const curtainBoundingRect = curtains.getBoundingRect()

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
        }

        // create vectors only once and use them later on during tween onUpdate callback
        const newScale = new Vec2()
        const newTranslation = new Vec3()

        // kill tween
        if (galleryState.openTween) {
          galleryState.openTween.kill()
        }

        // we want to take top left corner as our plane transform origin
        plane.setTransformOrigin(newTranslation)

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
            newScale.set(animation.scaleX, animation.scaleY)
            plane.setScale(newScale)

            // plane translation
            newTranslation.set(
              animation.translationX,
              animation.translationY,
              0
            )
            plane.setRelativeTranslation(newTranslation)

            // texture scale
            newScale.set(animation.textureScale, animation.textureScale)
            plane.textures[0].setScale(newScale)

            // transition value
            plane.uniforms.fullscreenTransition.value = animation.transition

            // apply parallax to change texture offset
            applyPlanesParallax(plane)
          },
        })
      }
    }

    return () => {
      curtains.dispose()
    }
  }, [])

  return (
    <>
      <div id='canvas'></div>
      <div id='planes'>
        <div className='plane-wrapper'>
          <div className='plane'>
            <img src='/1.jpg' crossOrigin='' data-sampler='planeTexture' />
          </div>
        </div>
      </div>
    </>
  )
}

export default CurtainsTransition
