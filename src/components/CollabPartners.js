import styles from './CollabPartners.module.css';

export default function CollabPartners() {
    const partners = [
        { id: 1, name: "Tychee Farms", image: "/images/partners/tychee-farms.png" },
        { id: 2, name: "Partner", image: "/images/partners/snake-p.png" },
        { id: 3, name: "Motley Terpz", image: "/images/partners/motley-terpz.png" },
        { id: 4, name: "Four Fathers", image: "/images/partners/four-fathers.png" },
        { id: 5, name: "Hogwash Pharms", image: "/images/partners/hogwash-pharms.png" },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>COLLAB PARTNERS</h2>
                <div className={styles.grid}>
                    {partners.map((partner) => (
                        <div key={partner.id} className={styles.logoContainer}>
                            <img
                                src={partner.image}
                                alt={partner.name}
                                className={styles.logo}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
