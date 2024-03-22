import Image from 'next/image'
import styles from '../featured.module.css'

import card1 from '../../../../public/card_01.png'
import card2 from '../../../../public/card_02.png'
import card3 from '../../../../public/card_03.png'
import card4 from '../../../../public/card_04.png'
import card5 from '../../../../public/card_05.jpg'

export default function Featured() {

return (

  <div className={styles.featuredCover}>
          <Image
            src={card1}
            alt='card1'
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

)


}