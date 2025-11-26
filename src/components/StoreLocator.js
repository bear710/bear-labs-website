'use client';

import { useEffect, useRef } from 'react';
import styles from './StoreLocator.module.css';

export default function StoreLocator() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            // Create the embed div
            const embedDiv = document.createElement('div');
            embedDiv.id = 'wm-retailers-embed';
            containerRef.current.appendChild(embedDiv);

            // Load the Weedmaps script
            const script = document.createElement('script');
            script.src = 'https://bearlabs.wm.store/static/js/retailers-embed.js';
            script.async = true;
            document.head.appendChild(script);

            return () => {
                // Cleanup
                if (embedDiv.parentNode) {
                    embedDiv.parentNode.removeChild(embedDiv);
                }
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        }
    }, []);

    return (
        <section id="stores" className={styles.section}>
            <h2 className={styles.heading}>FIND BEAR LABS</h2>
            <p className={styles.subheading}>Locate Bear Labs products at a retailer near you</p>

            <div ref={containerRef} className={styles.mapContainer}></div>
        </section>
    );
}
