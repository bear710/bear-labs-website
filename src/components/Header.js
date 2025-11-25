import styles from './Header.module.css';
import Link from 'next/link';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link href="/">BEAR LABS</Link>
            </div>
            <nav className={styles.nav}>
                <Link href="#products">Products</Link>
                <Link href="#about">About</Link>
                <a href="https://merch.getbearlabs.com" target="_blank" rel="noopener noreferrer">Merch</a>
                <a href="https://shop.getbearlabs.com" target="_blank" rel="noopener noreferrer">Rewards</a>
            </nav>
        </header>
    );
}
