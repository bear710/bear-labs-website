'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './ProductShowcase.module.css';

const PRODUCTS = [
    {
        label: 'Live Rosin',
        name: 'Live Rosin',
        hasTiers: true,
        tiers: [
            {
                tier: 1,
                subtitle: 'The Apex of Excellence',
                description: 'This is the supreme drop. Our 90u-120u live rosin is crafted from ultra-exclusive, pheno-hunted, farm-specific genetics. Expect striking color, insane terp profiles, and an unmatched flavor experience. If you know, you know - this is the peak of solventless perfection.',
                image: '/images/products/tier1-live-rosin.jpg',
                accentColor: 'var(--color-yellow)'
            },
            {
                tier: 2,
                subtitle: 'Top-Shelf Without the Top Price',
                description: 'Sometimes, the best batches just hit different. When our Tier 1 strains yield exceptionally well, we pass the savings on to you. Same high-caliber 90u-120u live rosin, same premium experience—just at a friendlier price.',
                image: '/images/products/tier2-live-rosin.jpg',
                accentColor: 'var(--color-turquoise)'
            },
            {
                tier: 3,
                subtitle: 'Fire for the People',
                description: 'The perfect balance between craft and value. This 90u-120u live rosin comes from high-yielding, widely cultivated strains that still bring elite flavor, aroma, and potency. It may not be as rare as Tier 1, but trust—it still slaps.',
                image: '/images/products/tier3-live-rosin.jpg',
                accentColor: 'var(--color-pea-green)'
            },
            {
                tier: 4,
                subtitle: 'The Sleeper Hit',
                description: "Bear Labs doesn't do 'low quality,' and this tier proves it. Pressed from 90u-160u, this is the most affordable way to experience true solventless excellence. It may have a slightly darker hue or a more mellow terp profile, but it still delivers a premium dab at a price that won't break the bank.",
                image: '/images/products/tier4-live-rosin.jpg',
                accentColor: 'var(--color-dark-turquoise)'
            }
        ]
    },
    {
        label: 'Live Resin',
        name: 'Live Resin',
        hasTiers: true,
        tiers: [
            {
                tier: 1,
                subtitle: 'Premium Spectrum Sauce',
                description: "This is the top-tier resin experience—whether it's live or cured. We're talking clean, flavorful diamonds drenched in terp-loaded sauce, extracted from rare, farm-direct genetics. Whether it starts as fresh frozen or expertly cured flower, the outcome is the same: loud aroma, vibrant color, and smooth potency.",
                image: '/images/products/tier1-live-resin.jpg',
                accentColor: 'var(--color-yellow)'
            },
            {
                tier: 2,
                subtitle: 'Craft Resin With A Punch',
                description: 'Tier 2 brings serious quality at a more accessible price. These live or cured resin batches often punch above their tier, delivering nearly Tier 1 flavor and effects thanks to high-yielding cultivars. The sauce might be a little less runny, or the diamonds a little smaller.',
                image: '/images/products/tier2-live-resin.jpg',
                accentColor: 'var(--color-turquoise)'
            },
            {
                tier: 3,
                subtitle: 'Everyday Essential',
                description: 'This is the people\'s resin. Crafted from widely available strains, Tier 3 live and cured resin brings you solid flavor, dependable potency, and a price that makes sense for your daily dab. You might notice slight color or texture differences.',
                image: '/images/products/tier3-live-resin.png',
                accentColor: 'var(--color-pea-green)'
            },
            {
                tier: 4,
                subtitle: 'Budget Banger',
                description: "Don't sleep on Tier 4. This is the most wallet-friendly option in the Bear lineup, but it still brings the fire. You'll find full-spectrum resin that might run a little darker or come from older harvests, but it still delivers on flavor and effect.",
                image: '/images/products/tier4-live-resin.jpg',
                accentColor: 'var(--color-dark-turquoise)'
            }
        ]
    },
    {
        label: '510 Vapes',
        name: 'Live Resin 510 Vapes',
        subtitle: 'Premium Live Resin Cartridges',
        description: '100% live resin, distillate-free, delivered through medical-grade ceramic hardware. Every pull tastes like cracking open a jar of top-shelf nugs — retaining 2-3x more terpenes for true-to-strain flavor and a full entourage effect.',
        accentColor: 'var(--color-turquoise)',
        isVape: true,
        images: [
            '/images/products/vape-1.jpg',
            '/images/products/vape-2.jpg',
            '/images/products/vape-3.jpg'
        ]
    },
    {
        label: 'Edibles',
        name: 'Ampersand',
        subtitle: 'The Smokeless Dab',
        description: 'A zero-calorie, zero-sugar edible live rosin concentrate that melts on your tongue. Absorbs through your mouth for a fast, predictable lift that feels closer to a dab than a traditional edible. Vegan, gluten-free, and discreet.',
        accentColor: 'var(--color-yellow)',
        image: '/images/products/ampersand.png'
    }
];

function LoadingSpinner() {
    return (
        <div className={styles.loadingFallback}>
            <div className={styles.spinner} />
        </div>
    );
}

/* ── Desktop: pinned scroll layout ── */
function DesktopShowcase() {
    const sectionRef = useRef(null);
    const stickyRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [rosinTier, setRosinTier] = useState(1);
    const [resinTier, setResinTier] = useState(1);

    useEffect(() => {
        let ctx;
        const initGSAP = async () => {
            const gsapModule = await import('gsap');
            const scrollTriggerModule = await import('gsap/ScrollTrigger');
            const scrollToModule = await import('gsap/ScrollToPlugin');
            const gsap = gsapModule.default || gsapModule;
            const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;
            const ScrollToPlugin = scrollToModule.ScrollToPlugin || scrollToModule.default;
            gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

            ctx = gsap.context(() => {
                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: stickyRef.current,
                    pinSpacing: false,
                    scrub: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const newIndex = Math.min(
                            PRODUCTS.length - 1,
                            Math.floor(progress * PRODUCTS.length)
                        );
                        setActiveIndex(newIndex);
                    },
                });
            }, sectionRef);
        };

        initGSAP();
        return () => ctx && ctx.revert();
    }, []);

    const scrollToIndex = async (index) => {
        const gsapModule = await import('gsap');
        const scrollToModule = await import('gsap/ScrollToPlugin');
        const gsap = gsapModule.default || gsapModule;
        const ScrollToPlugin = scrollToModule.ScrollToPlugin || scrollToModule.default;
        gsap.registerPlugin(ScrollToPlugin);

        if (sectionRef.current) {
            const section = sectionRef.current;
            const start = section.offsetTop;
            const scrollRange = section.offsetHeight - window.innerHeight;
            const targetScroll = start + (index / (PRODUCTS.length - 1)) * scrollRange;

            gsap.to(window, {
                scrollTo: { y: targetScroll, autoKill: false },
                duration: 1.2,
                ease: 'power3.inOut'
            });
        }
    };

    const product = PRODUCTS[activeIndex];
    const getTierIndex = (idx) => {
        if (idx === 0) return rosinTier - 1;
        if (idx === 1) return resinTier - 1;
        return 0;
    };

    const activeTierData = product.hasTiers ? product.tiers[getTierIndex(activeIndex)] : null;
    const name = activeTierData ? `${product.name} - Tier ${activeTierData.tier}` : product.name;
    const subtitle = activeTierData ? activeTierData.subtitle : product.subtitle;
    const description = activeTierData ? activeTierData.description : product.description;
    const accentColor = activeTierData ? activeTierData.accentColor : product.accentColor;

    return (
        <section
            ref={sectionRef}
            id="products"
            className={`${styles.section} ${styles.sectionDesktop}`}
        >
            <div ref={stickyRef} className={styles.stickyContainer}>
                <h2 className={styles.mainHeading}>OUR COLLECTION</h2>

                {/* Left: Interactive Image Panel */}
                <div className={styles.visualPanel}>
                    {PRODUCTS.map((prod, index) => {
                        const isCurrent = index === activeIndex;
                        const activeGlow = prod.hasTiers 
                            ? prod.tiers[getTierIndex(index)].accentColor 
                            : (prod.accentColor || 'var(--color-yellow)');

                        return (
                            <div
                                key={index}
                                className={`${styles.productVisual} ${isCurrent ? styles.activeVisual : ''}`}
                                style={{ '--accent-glow': activeGlow }}
                            >
                                {/* Glow Backdrop */}
                                <div className={styles.glowBackdrop} />

                                {/* Images */}
                                {prod.hasTiers ? (
                                    prod.tiers.map((t, tIdx) => {
                                        const isTierActive = getTierIndex(index) === tIdx;
                                        return (
                                            <img
                                                key={tIdx}
                                                src={t.image}
                                                alt={`${prod.name} - Tier ${t.tier}`}
                                                className={`${styles.productImage} ${isTierActive && isCurrent ? styles.activeImage : ''}`}
                                            />
                                        );
                                    })
                                ) : prod.isVape ? (
                                    <div className={styles.vapeImageContainer}>
                                        {prod.images.map((imgUrl, imgIdx) => (
                                            <div
                                                key={imgIdx}
                                                className={`${styles.vapeCard} ${styles[`vapeCard${imgIdx + 1}`]} ${isCurrent ? styles.animateVape : ''}`}
                                            >
                                                <img src={imgUrl} alt={`${prod.name} ${imgIdx + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className={`${styles.productImage} ${isCurrent ? styles.activeImage : ''}`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right: Text Panel */}
                <div className={styles.textPanel}>
                    <div
                        key={activeIndex}
                        className={`${styles.textContent} ${styles.visible}`}
                    >
                        <p
                            className={styles.productLabel}
                            style={{ color: accentColor }}
                        >
                            {product.label}
                        </p>
                        <h3 className={styles.productName}>{name}</h3>
                        <p className={styles.productSubtitle}>{subtitle}</p>
                        
                        {/* Interactive Tier Selector */}
                        {product.hasTiers && (
                            <div className={styles.tierSelector}>
                                <span className={styles.tierSelectorLabel}>Select Tier</span>
                                <div className={styles.tierButtons}>
                                    {product.tiers.map((t) => {
                                        const isActive = (activeIndex === 0 ? rosinTier : resinTier) === t.tier;
                                        return (
                                            <button
                                                key={t.tier}
                                                className={`${styles.tierBtn} ${isActive ? styles.activeTierBtn : ''}`}
                                                style={{ '--tier-accent': t.accentColor }}
                                                onClick={() => {
                                                    if (activeIndex === 0) setRosinTier(t.tier);
                                                    if (activeIndex === 1) setResinTier(t.tier);
                                                }}
                                            >
                                                Tier {t.tier}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <p className={styles.productDescription}>{description}</p>
                        <a href="#store-locator" className={styles.ctaButton}>
                            Find Near You
                        </a>
                    </div>
                </div>

                {/* Progress Dots */}
                <div className={styles.progressDots}>
                    {PRODUCTS.map((_, i) => (
                        <button
                            key={i}
                            className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ''}`}
                            aria-label={`View ${PRODUCTS[i].name}`}
                            onClick={() => scrollToIndex(i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Mobile: stacked layout ── */
function MobileShowcase() {
    const [rosinTier, setRosinTier] = useState(1);
    const [resinTier, setResinTier] = useState(1);

    return (
        <section id="products" className={`${styles.section} ${styles.mobileSection}`}>
            <h2 className={styles.mobileHeading}>OUR COLLECTION</h2>
            {PRODUCTS.map((prod, i) => {
                const isRosin = i === 0;
                const isResin = i === 1;
                const isVape = i === 2;

                const activeTier = isRosin ? rosinTier : isResin ? resinTier : 1;
                const tierData = prod.hasTiers ? prod.tiers[activeTier - 1] : null;

                const name = tierData ? `${prod.name} - Tier ${tierData.tier}` : prod.name;
                const subtitle = tierData ? tierData.subtitle : prod.subtitle;
                const description = tierData ? tierData.description : prod.description;
                const accentColor = tierData ? tierData.accentColor : prod.accentColor;
                const imageSrc = tierData ? tierData.image : prod.image;

                return (
                    <div key={i} className={styles.mobileCard}>
                        {/* Mobile Visual Wrap */}
                        <div className={styles.mobileVisualWrap}>
                            <div className={styles.glowBackdrop} style={{ '--accent-glow': accentColor || 'var(--color-yellow)' }} />

                            {prod.hasTiers ? (
                                <img
                                    src={imageSrc}
                                    alt={name}
                                    className={styles.mobileProductImage}
                                />
                            ) : isVape ? (
                                <div className={styles.mobileVapeImageContainer}>
                                    {prod.images.map((imgUrl, imgIdx) => (
                                        <div key={imgIdx} className={styles.mobileVapeCard}>
                                            <img src={imgUrl} alt={`${prod.name} ${imgIdx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className={styles.mobileProductImage}
                                />
                            )}
                        </div>

                        {/* Mobile Text Panel */}
                        <div className={styles.mobileTextContent}>
                            <p className={styles.productLabel} style={{ color: accentColor }}>
                                {prod.label}
                            </p>
                            <h3 className={styles.mobileProductName}>{name}</h3>
                            <p className={styles.mobileProductSubtitle}>{subtitle}</p>

                            {/* Mobile Tier Selector */}
                            {prod.hasTiers && (
                                <div className={styles.mobileTierSelector}>
                                    {prod.tiers.map((t) => {
                                        const isActive = activeTier === t.tier;
                                        return (
                                            <button
                                                key={t.tier}
                                                className={`${styles.tierBtn} ${isActive ? styles.activeTierBtn : ''}`}
                                                style={{ '--tier-accent': t.accentColor }}
                                                onClick={() => {
                                                    if (isRosin) setRosinTier(t.tier);
                                                    if (isResin) setResinTier(t.tier);
                                                }}
                                            >
                                                Tier {t.tier}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <p className={styles.mobileProductDescription}>{description}</p>
                            <a href="#store-locator" className={styles.ctaButton}>
                                Find Near You
                            </a>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

export default function ProductShowcase() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const mq = window.matchMedia('(max-width: 768px)');
        setIsMobile(mq.matches);

        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    if (!mounted) {
        return (
            <section id="products" className={styles.section} style={{ minHeight: '100vh' }}>
                <LoadingSpinner />
            </section>
        );
    }

    return isMobile ? <MobileShowcase /> : <DesktopShowcase />;
}
