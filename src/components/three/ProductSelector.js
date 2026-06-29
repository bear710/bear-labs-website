'use client';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, PRODUCTS, getDefaultProductForCategory, getProductByCategoryAndTier } from './productConfig';
import styles from './ProductShowroom.module.css';

const TIERS = [1, 2, 3, 4];

function indexOfProduct(id) {
    const index = PRODUCTS.findIndex((p) => p.id === id);
    return index === -1 ? 0 : index;
}

/**
 * Category tabs + tier buttons for fast, filtered navigation, plus a
 * wrapped grid of every product for direct selection / browsing — all
 * 11 are always visible at once, no horizontal scrolling. Neither
 * branch contains product-specific logic — both read purely from
 * productConfig.
 *
 * Focus management: product cards are never given the native `disabled`
 * attribute, even mid-transition — a genuinely disabled element can't
 * receive focus, which is what previously let an arrow-key press get
 * silently swallowed. Instead controls stay focusable/clickable and use
 * `aria-disabled` for the dimmed visual + AT hint, while `onQueueSelect`
 * decides whether the request applies immediately or gets queued.
 */
export default function ProductSelector({ activeProduct, onQueueSelect, isInteractive }) {
    const [selectedCategory, setSelectedCategory] = useState(activeProduct.category);

    // The keyboard grid's notion of "current position" — updated
    // optimistically on every arrow press so rapid presses compute the
    // next step from the last *requested* index, not the still-settling
    // active product. Navigation order always follows the PRODUCTS array
    // (left/right through the flat list), independent of how many
    // columns the grid happens to wrap into visually at a given width.
    const focusIndexRef = useRef(indexOfProduct(activeProduct.id));

    // Render-phase sync (React's documented "adjust state during render"
    // pattern, not an effect): keeps the category tab highlight truthful
    // whenever the active product changes via the grid, Prev/Next, or a
    // tier button — not just via a category tab click — without an extra
    // commit-then-effect render pass.
    const [lastSyncedId, setLastSyncedId] = useState(activeProduct.id);
    if (activeProduct.id !== lastSyncedId) {
        setLastSyncedId(activeProduct.id);
        setSelectedCategory(activeProduct.category);
    }

    // Ref writes belong in an effect, not the render body above.
    useEffect(() => {
        focusIndexRef.current = indexOfProduct(activeProduct.id);
    }, [activeProduct.id]);

    const handleCategoryClick = (categoryId, hasTiers) => {
        setSelectedCategory(categoryId);
        if (categoryId === activeProduct.category) return;
        const target = hasTiers
            ? getProductByCategoryAndTier(categoryId, 1)
            : getDefaultProductForCategory(categoryId);
        focusIndexRef.current = indexOfProduct(target.id);
        onQueueSelect(target.id);
    };

    const handleTierClick = (tier) => {
        const target = getProductByCategoryAndTier(selectedCategory, tier);
        focusIndexRef.current = indexOfProduct(target.id);
        onQueueSelect(target.id);
    };

    const handleProductClick = (product) => {
        focusIndexRef.current = indexOfProduct(product.id);
        onQueueSelect(product.id);
    };

    const handleProductKeyDown = (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (focusIndexRef.current + delta + PRODUCTS.length) % PRODUCTS.length;
        focusIndexRef.current = nextIndex;
        const next = PRODUCTS[nextIndex];
        onQueueSelect(next.id);
        // Always allowed to succeed: the destination card is focusable
        // even while a transition is in flight. The grid never scrolls,
        // so there's no competing scroll-into-view behavior to avoid —
        // preventScroll just keeps focus from nudging the page itself.
        document.getElementById(`product-card-${next.id}`)?.focus({ preventScroll: true });
    };

    const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
    const disabledAttr = !isInteractive;

    return (
        <nav className={styles.selector} aria-label="Product selection" aria-busy={disabledAttr}>
            <div className={styles.categoryTabs} role="tablist" aria-label="Product categories">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={selectedCategory === cat.id}
                        aria-disabled={disabledAttr}
                        className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.categoryTabActive : ''}`}
                        onClick={() => handleCategoryClick(cat.id, cat.hasTiers)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div
                className={styles.tierRow}
                role={activeCategory?.hasTiers ? 'group' : undefined}
                aria-label={activeCategory?.hasTiers ? 'Tier selection' : undefined}
                aria-hidden={!activeCategory?.hasTiers}
                style={!activeCategory?.hasTiers ? { visibility: 'hidden' } : undefined}
            >
                {TIERS.map((tier) => {
                    const isActive = activeProduct.category === selectedCategory && activeProduct.tier === tier;
                    return (
                        <button
                            key={tier}
                            type="button"
                            className={`${styles.tierBtn} ${isActive ? styles.tierBtnActive : ''}`}
                            onClick={() => handleTierClick(tier)}
                            aria-disabled={disabledAttr}
                            aria-pressed={isActive}
                            tabIndex={activeCategory?.hasTiers ? 0 : -1}
                        >
                            Tier {tier}
                        </button>
                    );
                })}
            </div>

            <div className={styles.productGrid} role="listbox" aria-label="All products">
                {PRODUCTS.map((product) => {
                    const isActive = product.id === activeProduct.id;
                    return (
                        <button
                            key={product.id}
                            id={`product-card-${product.id}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            aria-disabled={disabledAttr}
                            aria-label={`${product.railLabel}${isActive ? ' (currently viewing)' : ''}`}
                            className={`${styles.productCard} ${isActive ? styles.productCardActive : ''}`}
                            style={{ '--card-accent': product.accent }}
                            onClick={() => handleProductClick(product)}
                            onKeyDown={handleProductKeyDown}
                            tabIndex={isActive ? 0 : -1}
                        >
                            <span className={styles.productCardName}>
                                {product.railLabelLines.map((line, i) => (
                                    <span key={i} className={styles.productCardLine}>
                                        {line}
                                    </span>
                                ))}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
