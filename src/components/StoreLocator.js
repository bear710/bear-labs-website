'use client';

import { useEffect } from 'react';
import styles from './StoreLocator.module.css';

export default function StoreLocator() {
    useEffect(() => {
        // Load the Weedmaps script
        const script = document.createElement('script');
        script.src = 'https://bearlabs.wm.store/static/js/retailers-embed.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup: remove script when component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <section id="stores" className={styles.section}>
            <h2 className={styles.heading}>FIND BEAR LABS</h2>
            <p className={styles.subheading}>Locate Bear Labs products at a retailer near you</p>

            <div className={styles.mapContainer}>
                <div id="wm-retailers-embed"></div>
            </div>
        </section>
    );
}
