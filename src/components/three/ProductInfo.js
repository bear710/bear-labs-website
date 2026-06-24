'use client';
import { CATEGORIES } from './productConfig';
import styles from './ProductShowroom.module.css';

export default function ProductInfo({ product }) {
    const category = CATEGORIES.find((c) => c.id === product.category);

    return (
        <div className={styles.info}>
            <p className={styles.infoFamily} style={{ color: product.accent }}>
                {category?.label}
                {product.tier ? ` · Tier ${product.tier}` : ''}
            </p>
            <h3 className={styles.infoName}>{product.name}</h3>
            <p className={styles.infoDescription}>{product.description}</p>
            {/* Announces the active product to screen readers without
                forcing a focus jump on every switch. */}
            <p className={styles.srOnly} role="status" aria-live="polite">
                Now viewing {product.name}
            </p>
        </div>
    );
}
