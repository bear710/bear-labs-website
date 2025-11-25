import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.content}>
                <h1 className={styles.title}>
                    <span className={styles.highlight}>PREMIUM CANNABIS</span><br />
                    <span className={styles.gradient}>VAPES CONCENTRATES AND INGESTIBLES</span>
                </h1>
                <p className={styles.subtitle}>
                    Smoke Better with Bear
                </p>
                <div className={styles.ctaGroup}>
                    <a href="#products" className={styles.ctaPrimary}>View Products</a>
                    <a href="https://shop.getbearlabs.com" className={styles.ctaSecondary}>Join Rewards</a>
                </div>
            </div>
            <div className={styles.visual}>
                <div className={styles.orb}></div>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <h3>BEAR LABS</h3>
                        <p>EST. 2024</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
