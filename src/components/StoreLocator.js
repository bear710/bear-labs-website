'use client';

import styles from './StoreLocator.module.css';

export default function StoreLocator() {
    return (
        <section id="stores" className={styles.section}>
            <h2 className={styles.heading}>FIND BEAR LABS</h2>
            <p className={styles.subheading}>Locate Bear Labs products at a retailer near you</p>

            <div className={styles.buttonContainer}>
                <a
                    href="https://bearlabs.wm.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.storeButton}
                >
                    View Store Locator
                </a>
            </div>
        </section>
    );
}
