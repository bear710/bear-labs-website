import styles from './About.module.css';

export default function About() {
    return (
        <section id="about" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.heading}>COMMUNITY DRIVEN.<br />PREMIUM QUALITY.</h2>
                    <p className={styles.text}>
                        Bear Labs is more than just extracts; it's a movement. Born from the streets and built for the connoisseur, we represent the hustle and the reward.
                    </p>
                    <p className={styles.text}>
                        We pride ourselves on delivering the cleanest, most potent solventless and hydrocarbon extracts in the game. Whether you're after the purity of Rosin or the punch of BHO, we set the standard.
                    </p>
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.number}>100%</span>
                            <span className={styles.label}>Authentic</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.number}>4</span>
                            <span className={styles.label}>Premium Tiers</span>
                        </div>
                    </div>
                </div>
                <div className={styles.visual}>
                    <div className={styles.imagePlaceholder}>
                        {/* Abstract visual representing community/trust */}
                        <div className={styles.circle}></div>
                        <div className={styles.square}></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
