'use client';

import styles from './StoreLocator.module.css';

export default function StoreLocator() {
    const embedScript = `
    <div id="wm-retailers-embed"></div>
    <script src="https://bearlabs.wm.store/static/js/retailers-embed.js"></script>
  `;

    return (
        <section id="stores" className={styles.section}>
            <h2 className={styles.heading}>FIND BEAR LABS</h2>
            <p className={styles.subheading}>Locate Bear Labs products at a retailer near you</p>

            <div
                className={styles.mapContainer}
                dangerouslySetInnerHTML={{ __html: embedScript }}
            />
        </section>
    );
}
