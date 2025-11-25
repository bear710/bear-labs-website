import styles from './ProductGrid.module.css';

const products = [
    {
        id: 1,
        name: "Solvent Extract (BHO)",
        tiers: "Tier 1 - Tier 4",
        description: "Premium hydrocarbon extracts preserving the full spectrum of terpenes and cannabinoids.",
        color: "var(--color-yellow)"
    },
    {
        id: 2,
        name: "Solventless Extract (SHO)",
        tiers: "Tier 1 - Tier 4",
        description: "Pure, solvent-free rosin pressed from the finest trichomes for an authentic experience.",
        color: "var(--color-turquoise)"
    },
    {
        id: 3,
        name: "Live Resin Vapes",
        tiers: "510 Thread",
        description: "Convenient and potent live resin in a high-quality hardware for on-the-go enjoyment.",
        color: "var(--color-pea-green)"
    },
    {
        id: 4,
        name: "Ampersand Edibles",
        tiers: "Concentrate",
        description: "High-potency edible concentrates designed for versatility and precise dosing.",
        color: "var(--color-dark-turquoise)"
    }
];

export default function ProductGrid() {
    return (
        <section id="products" className={styles.section}>
            <h2 className={styles.heading}>OUR COLLECTION</h2>
            <div className={styles.grid}>
                {products.map((product) => (
                    <div key={product.id} className={styles.card} style={{ '--accent-color': product.color }}>
                        <div className={styles.cardInner}>
                            <div className={styles.cardFront}>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <span className={styles.productTier}>{product.tiers}</span>
                            </div>
                            <div className={styles.cardBack}>
                                <p className={styles.description}>{product.description}</p>
                                <button className={styles.btn}>Learn More</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
