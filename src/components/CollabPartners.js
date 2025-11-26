import styles from './CollabPartners.module.css';

export default function CollabPartners() {
    const partners = [
        { id: 1, name: "Tychee Farms", image: "/images/partners/tychee-farms.png" },
        { id: 2, name: "Snake P", image: "/images/partners/snake-p.png" },
        { id: 3, name: "Motley Terpz", image: "/images/partners/motley-terpz.png" },
        { id: 4, name: "Four Fathers", image: "/images/partners/four-fathers.png" },
        { id: 5, name: "Hogwash Pharms", image: "/images/partners/hogwash-pharms.png" },
        { id: 6, name: "Casa Flor", image: "/images/partners/casa-flor.png" },
        { id: 7, name: "Coastal Sun", image: "/images/partners/coastal-sun.png" },
        { id: 8, name: "Canyon Creek", image: "/images/partners/canyon-creek.png" },
        { id: 9, name: "Booney Acres", image: "/images/partners/booney-acres.png" },
        { id: 10, name: "Chameleon", image: "/images/partners/chameleon.png" },
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
