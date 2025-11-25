import styles from './ProductGrid.module.css';

const liveRosinProducts = [
    {
        id: 1,
        name: "Tier 1 Live Rosin",
        subtitle: "The Apex of Excellence",
        description: "This is the supreme drop. Our 90u-120u live rosin is crafted from ultra-exclusive, pheno-hunted, farm-specific genetics. Expect striking color, insane terp profiles, and an unmatched flavor experience. If you know, you know - this is the peak of solventless perfection.",
        color: "var(--color-yellow)"
    },
    {
        id: 2,
        name: "Tier 2 Live Rosin",
        subtitle: "Top-Shelf Without the Top Price",
        description: "Sometimes, the best batches just hit different. When our Tier 1 strains yield exceptionally well, we pass the savings on to you. Same high-caliber 90u-120u live rosin, same premium experience—just at a friendlier price.",
        color: "var(--color-turquoise)"
    },
    {
        id: 3,
        name: "Tier 3 Live Rosin",
        subtitle: "Fire for the People",
        description: "The perfect balance between craft and value. This 90u-120u live rosin comes from high-yielding, widely cultivated strains that still bring elite flavor, aroma, and potency. It may not be as rare as Tier 1, but trust—it still slaps.",
        color: "var(--color-pea-green)"
    },
    {
        id: 4,
        name: "Tier 4 Live Rosin",
        subtitle: "The Sleeper Hit",
        description: "Bear Labs doesn't do 'low quality,' and this tier proves it. Pressed from 90u-160u, this is the most affordable way to experience true solventless excellence. It may have a slightly darker hue or a more mellow terp profile, but it still delivers a premium dab at a price that won't break the bank.",
        color: "var(--color-dark-turquoise)"
    }
];

export default function ProductGrid() {
    return (
        <section id="products" className={styles.section}>
            <h2 className={styles.mainHeading}>OUR COLLECTION</h2>

            {/* Live Rosin Section */}
            <div className={styles.category}>
                <h3 className={styles.categoryHeading}>Live Rosin</h3>
                <div className={styles.grid}>
                    {liveRosinProducts.map((product) => (
                        <div key={product.id} className={styles.card} style={{ '--accent-color': product.color }}>
                            <div className={styles.cardInner}>
                                <div className={styles.cardFront}>
                                    <h4 className={styles.productName}>{product.name}</h4>
                                    <span className={styles.productSubtitle}>{product.subtitle}</span>
                                </div>
                                <div className={styles.cardBack}>
                                    <p className={styles.description}>{product.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
