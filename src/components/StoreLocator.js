'use client';

import styles from './StoreLocator.module.css';
import WeedmapsLocator from './WeedmapsLocator';

export default function StoreLocator() {
    return (
        <section id="stores" className={styles.section} data-oil-foreground>
            <h2 className={styles.heading}>FIND BEAR LABS</h2>
            <p className={styles.subheading}>Locate Bear Labs products at a retailer near you</p>

            <div className={styles.buttonContainer}>
                <a
                    href="https://bearlabs.wm.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.storeButton}
                    aria-label="Shop Bear Labs on Weedmaps (opens in a new tab)"
                >
                    Shop Bear Labs
                </a>
            </div>

            <WeedmapsLocator />
        </section>
    );
}
