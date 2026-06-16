'use client';
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import styles from './ProductShowcase.module.css';

const ProductScene = lazy(() => import('./ProductScene'));

const PRODUCTS = [
    {
        label: 'Live Rosin',
        name: 'Live Rosin',
        subtitle: 'The Apex of Solventless',
        description:
            'Our 90u-120u live rosin is crafted from ultra-exclusive, pheno-hunted, farm-specific genetics. Available in 4 tiers — from the supreme Tier 1 drop to the everyday Tier 4 sleeper hit — every jar delivers striking color, insane terp profiles, and an unmatched flavor experience.',
        accentColor: 'var(--color-yellow)',
    },
    {
        label: 'Live Resin',
        name: 'Live Resin',
        subtitle: 'Premium Spectrum Sauce',
        description:
            'Clean, flavorful diamonds drenched in terp-loaded sauce, extracted from rare, farm-direct genetics. Whether it starts as fresh frozen or expertly cured flower, the outcome is the same: loud aroma, vibrant color, and smooth potency across all four tiers.',
        accentColor: 'var(--color-turquoise)',
    },
    {
        label: '510 Vapes',
        name: 'Live Resin 510 Vapes',
        subtitle: 'Premium Live Resin Cartridges',
        description:
            '100% live resin, distillate-free, delivered through medical-grade ceramic hardware. Every pull tastes like cracking open a jar of top-shelf nugs — retaining 2-3x more terpenes for true-to-strain flavor and a full entourage effect.',
        accentColor: 'var(--color-turquoise)',
    },
    {
        label: 'Edibles',
        name: 'Ampersand',
        subtitle: 'The Smokeless Dab',
        description:
            'A zero-calorie, zero-sugar edible live rosin concentrate that melts on your tongue. Absorbs through your mouth for a fast, predictable lift that feels closer to a dab than a traditional edible. Vegan, gluten-free, and discreet.',
        accentColor: 'var(--color-yellow)',
    },
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
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        let ctx;
        const initGSAP = async () => {
            const gsapModule = await import('gsap');
            const scrollTriggerModule = await import('gsap/ScrollTrigger');
            const gsap = gsapModule.default || gsapModule;
            const ScrollTrigger = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;
            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
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

    const product = PRODUCTS[activeIndex];

    return (
        <section
            ref={sectionRef}
            id="products"
            className={`${styles.section} ${styles.sectionDesktop}`}
        >
            <div className={styles.stickyContainer}>
                <h2 className={styles.mainHeading}>OUR COLLECTION</h2>

                {/* Left: 3D Canvas */}
                <div className={styles.canvasWrap}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProductScene activeIndex={activeIndex} />
                    </Suspense>
                </div>

                {/* Right: Text Panel */}
                <div className={styles.textPanel}>
                    <div
                        key={activeIndex}
                        className={`${styles.textContent} ${styles.visible}`}
                    >
                        <p
                            className={styles.productLabel}
                            style={{ color: product.accentColor }}
                        >
                            {product.label}
                        </p>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <p className={styles.productSubtitle}>{product.subtitle}</p>
                        <p className={styles.productDescription}>{product.description}</p>
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
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Mobile: stacked layout ── */
function MobileShowcase() {
    return (
        <section id="products" className={`${styles.section} ${styles.mobileSection}`}>
            <h2 className={styles.mobileHeading}>OUR COLLECTION</h2>
            {PRODUCTS.map((product, i) => (
                <div key={i} className={styles.mobileCard}>
                    <div className={styles.mobileCanvasWrap}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ProductScene activeIndex={i} />
                        </Suspense>
                    </div>
                    <div className={styles.mobileTextContent}>
                        <h3 className={styles.mobileProductName}>{product.name}</h3>
                        <p className={styles.mobileProductSubtitle}>{product.subtitle}</p>
                        <p className={styles.mobileProductDescription}>{product.description}</p>
                        <a href="#store-locator" className={styles.ctaButton}>
                            Find Near You
                        </a>
                    </div>
                </div>
            ))}
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
