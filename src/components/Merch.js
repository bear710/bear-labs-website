import styles from './Merch.module.css';

export default function Merch() {
    return (
        <section id="merch" className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>BEAR LABS MERCH</h2>
                <p className={styles.subheading}>
                    Rep the brand with premium apparel and accessories
                </p>

                <div className={styles.merchShowcase}>
                    <div className={styles.merchContent}>
                        <div className={styles.featuredText}>
                            <h3 className={styles.featuredHeading}>Exclusive Collection</h3>
                            <p className={styles.description}>
                                From hoodies to hats, tees to accessories—our merch is designed for those who appreciate quality cannabis culture. Every piece features bold Bear Labs branding and premium materials.
                            </p>
                            <ul className={styles.features}>
                                <li>Premium quality materials</li>
                                <li>Exclusive Bear Labs designs</li>
                                <li>Limited edition drops</li>
                                <li>Free shipping on orders over $50</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.ctaContainer}>
                        <a
                            href="https://bear-labs-official-merch.myshopify.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.merchButton}
                        >
                            Shop Full Collection
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
