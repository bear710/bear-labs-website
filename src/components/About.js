import styles from './About.module.css';

export default function About() {
    return (
        <section id="about" className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.heading}>
                    COMMUNITY DRIVEN.<br />
                    PREMIUM QUALITY.
                </h2>

                <div className={styles.content}>
                    <p className={styles.paragraph}>
                        BEAR Labs (short for Botanical Extractions and Research Labs) is a legacy California cannabis brand founded in 2014 and built on one simple idea: Smoke Better With BEAR. From day one we've been obsessed with doing things the right way—working hand-in-hand with top cultivators, obsessing over every wash and purge, and only putting our name on products we're proud to sesh with ourselves.
                    </p>

                    <p className={styles.paragraph}>
                        We're known for premium live resin, live rosin, vapes and ingestibles that showcase real strain flavor, not shortcuts. Our collabs with farmers let us highlight and empower their craft while bringing you unique genetics and terp profiles you won't find anywhere else.
                    </p>

                    <p className={styles.paragraph}>
                        Beyond the jar, BEAR Labs is about community and culture—from sesh-friendly pop-ups and brunch & dab events to educational tastings and brand collaborations, we show up where our people are. A decade in, we're still independently operated, still perfectionists about quality, and still here for the heads who care what they're smoking as much as how it makes them feel.
                    </p>
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.number}>10+</span>
                        <span className={styles.label}>YEARS</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.number}>100%</span>
                        <span className={styles.label}>AUTHENTIC</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.number}>EST.</span>
                        <span className={styles.label}>2014</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
