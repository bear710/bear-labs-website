import styles from './CollabPartners.module.css';

export default function CollabPartners() {
    // Placeholder data - we will replace these with real images once uploaded
    const partners = [
        { id: 1, name: "Partner 1" },
        { id: 2, name: "Partner 2" },
        { id: 3, name: "Partner 3" },
        { id: 4, name: "Partner 4" },
        { id: 5, name: "Partner 5" },
        { id: 6, name: "Partner 6" },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>COLLAB PARTNERS</h2>
                <div className={styles.grid}>
                    {partners.map((partner) => (
                        <div key={partner.id} className={styles.logoContainer}>
                            <div className={styles.placeholderLogo}>{partner.name}</div>
                            {/* Once images are uploaded, we will use: 
              <img src="/images/partner-logo.png" alt={partner.name} className={styles.logo} /> 
              */}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
