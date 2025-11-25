import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.brand}>
                    <h3>BEAR LABS</h3>
                    <p>© 2024 Bear Labs. All rights reserved.</p>
                </div>
                <div className={styles.links}>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                    <a href="mailto:info@getbearlabs.com">Contact</a>
                    <a href="/privacy">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
}
