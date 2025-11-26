'use client';
import { useState } from 'react';
import styles from './ProductGrid.module.css';

const liveRosinProducts = [
    {
        id: 1,
        name: "Tier 1 Live Rosin",
        subtitle: "The Apex of Excellence",
        description: "This is the supreme drop. Our 90u-120u live rosin is crafted from ultra-exclusive, pheno-hunted, farm-specific genetics. Expect striking color, insane terp profiles, and an unmatched flavor experience. If you know, you know - this is the peak of solventless perfection.",
        color: "var(--color-yellow)",
        image: "/images/products/tier1-live-rosin.jpg"
    },
    {
        id: 2,
        name: "Tier 2 Live Rosin",
        subtitle: "Top-Shelf Without the Top Price",
        description: "Sometimes, the best batches just hit different. When our Tier 1 strains yield exceptionally well, we pass the savings on to you. Same high-caliber 90u-120u live rosin, same premium experience—just at a friendlier price.",
        color: "var(--color-turquoise)",
        image: "/images/products/rosin-jar-placeholder.png"
    },
    {
        id: 3,
        name: "Tier 3 Live Rosin",
        subtitle: "Fire for the People",
        description: "The perfect balance between craft and value. This 90u-120u live rosin comes from high-yielding, widely cultivated strains that still bring elite flavor, aroma, and potency. It may not be as rare as Tier 1, but trust—it still slaps.",
        color: "var(--color-pea-green)",
        image: "/images/products/rosin-jar-placeholder.png"
    },
    {
        id: 4,
        name: "Tier 4 Live Rosin",
        subtitle: "The Sleeper Hit",
        description: "Bear Labs doesn't do 'low quality,' and this tier proves it. Pressed from 90u-160u, this is the most affordable way to experience true solventless excellence. It may have a slightly darker hue or a more mellow terp profile, but it still delivers a premium dab at a price that won't break the bank.",
        color: "var(--color-dark-turquoise)",
        image: "/images/products/rosin-jar-placeholder.png"
    }
];

const liveResinProducts = [
    {
        id: 1,
        name: "Tier 1 Live Resin",
        subtitle: "Premium Spectrum Sauce",
        description: "This is the top-tier resin experience—whether it's live or cured. We're talking clean, flavorful diamonds drenched in terp-loaded sauce, extracted from rare, farm-direct genetics. Whether it starts as fresh frozen or expertly cured flower, the outcome is the same: loud aroma, vibrant color, and smooth potency. This is the resin that sets the bar at Bear Labs.",
        color: "var(--color-yellow)",
        image: "/images/products/resin-jar-placeholder.png"
    },
    {
        id: 2,
        name: "Tier 2 Live Resin",
        subtitle: "Craft Resin With A Punch",
        description: "Tier 2 brings serious quality at a more accessible price. These live or cured resin batches often punch above their tier, delivering nearly Tier 1 flavor and effects thanks to high-yielding cultivars. The sauce might be a little less runny, or the diamonds a little smaller—but the dab still hits hard. Premium vibes without the premium price.",
        color: "var(--color-turquoise)",
        image: "/images/products/resin-jar-placeholder.png"
    },
    {
        id: 3,
        name: "Tier 3 Live Resin",
        subtitle: "Everyday Essential",
        description: "This is the people's resin. Crafted from widely available strains, Tier 3 live and cured resin brings you solid flavor, dependable potency, and a price that makes sense for your daily dab. You might notice slight color or texture differences compared to higher tiers, but the quality remains solid and consistent. A workhorse in the best way.",
        color: "var(--color-pea-green)",
        image: "/images/products/resin-jar-placeholder.png"
    },
    {
        id: 4,
        name: "Tier 4 Live Resin",
        subtitle: "Budget Banger",
        description: "Don't sleep on Tier 4. This is the most wallet-friendly option in the Bear lineup, but it still brings the fire. You'll find full-spectrum resin that might run a little darker or come from older harvests, but it still delivers on flavor and effect. Whether it's live or cured, it's the best bang for your buck—perfect for stretching the stash without compromising on quality.",
        color: "var(--color-dark-turquoise)",
        image: "/images/products/resin-jar-placeholder.png"
    }
];

function ProductCard({ product }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showImage, setShowImage] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        // Delay image appearance until after flip animation (0.8s)
        setTimeout(() => {
            setShowImage(true);
        }, 800);
    };

    const handleMouseLeave = () => {
        // Hide image first
        setShowImage(false);
        // Flip card back after image slides away (0.4s)
        setTimeout(() => {
            setIsHovered(false);
        }, 400);
    };

    return (
        <div
            className={styles.card}
            style={{ '--accent-color': product.color }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`${styles.cardInner} ${isHovered ? styles.flipped : ''}`}>
                <div className={styles.cardFront}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <span className={styles.productSubtitle}>{product.subtitle}</span>
                </div>
                <div className={styles.cardBack}>
                    <p className={styles.description}>{product.description}</p>
                </div>
            </div>
            {product.image && (
                <div className={`${styles.productImage} ${showImage ? styles.showImage : ''}`}>
                    <img src={product.image} alt={product.name} />
                </div>
            )}
        </div>
    );
}

export default function ProductGrid() {
    return (
        <section id="products" className={styles.section}>
            <h2 className={styles.mainHeading}>OUR COLLECTION</h2>

            {/* Live Rosin Section */}
            <div className={styles.category}>
                <h3 className={styles.categoryHeading}>Live Rosin</h3>
                <div className={styles.grid}>
                    {liveRosinProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* Live Resin Section */}
            <div className={styles.category}>
                <h3 className={styles.categoryHeading}>Live Resin</h3>
                <div className={styles.grid}>
                    {liveResinProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* 510 Vapes Section */}
            <div className={styles.category}>
                <h3 className={styles.categoryHeading}>Live Resin 510 Vapes</h3>
                <div className={styles.wideCard} style={{ '--accent-color': 'var(--color-turquoise)' }}>
                    <div className={styles.cardInner}>
                        <div className={styles.cardFront}>
                            <h4 className={styles.productName}>Live Resin 510 Thread Vapes</h4>
                            <span className={styles.productSubtitle}>Premium Live Resin Cartridges</span>
                        </div>
                        <div className={styles.cardBack}>
                            <p className={styles.description}>BEAR Labs Live Resin 510 vapes are filled with 100% live resin made from fresh-frozen flower harvested at peak ripeness, so every pull tastes like cracking open a jar of top-shelf nugs. By skipping the dry and cure stage, our live resin avoids harsh chlorophyll breakdown and oxidation, giving you a smoother, cleaner vape with less "burn" or "ashy" notes than cured resin carts. Each small-batch, handcrafted strain captures the plant exactly as it was when harvested, typically retaining 2–3x more terpenes for true-to-strain taste, loud flavor, and a bright, fresh aroma. Beyond THC and CBD, our process preserves more of the minor cannabinoids and volatile monoterpenes like pinene, limonene, and myrcene that are usually lost in drying, delivering a well-rounded, strain-specific entourage effect. All of this goodness is delivered through medical-grade ceramic hardware with a rotating cap that fits any battery orientation—premium live resin, zero shortcuts.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ampersand Section */}
            <div className={styles.category}>
                <h3 className={styles.categoryHeading}>Ampersand: A Premium Edible Concentrate</h3>
                <div className={styles.wideCard} style={{ '--accent-color': 'var(--color-yellow)' }}>
                    <div className={styles.cardInner}>
                        <div className={styles.cardFront}>
                            <h4 className={styles.productName}>Ampersand Edible Concentrate</h4>
                            <span className={styles.productSubtitle}>Premium Cannabis-Infused Concentrate</span>
                        </div>
                        <div className={styles.cardBack}>
                            <p className={styles.description}>Meet Ampersand – the Smokeless Dab. This zero-calorie, zero-sugar edible live rosin concentrate melts on your tongue, then you simply swish and savor; in about five minutes you'll feel a clear, fast, and predictable lift every time. Because it absorbs through your mouth instead of your stomach, the experience feels closer to taking a dab or smoking your favorite strain than eating a traditional edible. Crafted from full-spectrum live rosin (never distillate), Ampersand keeps the plant's natural minor cannabinoids and terpenes intact for rich flavor and a layered, true-to-flower high. It's vegan, gluten-free, dairy-free, and discreet enough to enjoy almost anywhere—just add tongue.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
