import styles from './ProductShowcase.module.css';
import ProductShowroom from './three/ProductShowroom';

export default function ProductShowcase() {
    return (
        <section id="products" className={styles.jarPreviewSection}>
            <h2 className={styles.jarPreviewHeading}>INTERACTIVE PREVIEW</h2>
            <p className={styles.jarPreviewSubheading}>
                Prototype — explore the full lineup, then rotate and open each product.
            </p>
            <ProductShowroom />
        </section>
    );
}
