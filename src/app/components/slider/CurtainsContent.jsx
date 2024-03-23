'use client'
import CurtainsTransition from './CurtainsTransition'
 
 
const CurtainsContent = () => {
  return (
    <CurtainsTransition>
      <div className='plane' >
        <img src='/card_01.png' crossOrigin='' data-sampler='planeTexture' />
      </div>
    </CurtainsTransition>
  )
}

export default CurtainsContent
