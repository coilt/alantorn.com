import Link from 'next/link'
import styles from './navbar.module.css'

export default function Navbar() {
  return (
    <div className={styles.navbar}>
      <ul className={styles.menuContainer}>
        <li className={styles.menuItem}>
          <a className={styles.menuButton} href='/'>Home</a>
        </li>
        <li className={styles.menuItem}>
          <a className={styles.menuButton} href='/about'>About</a>
        </li>
        <li className={styles.menuItem}>
          <a className={styles.menuButton} href='/services'>Services</a>
        </li>
        <li className={styles.menuItem}>
          <a className={styles.menuButton} href='/contact'>Contact</a>
        </li>
      </ul>
    </div>
  )
}
