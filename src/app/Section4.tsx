import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function Section4() {
    return (
        <motion.section
            className={styles.section}
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 10, opacity: 0 }}
            transition={{ duration: 0.7, type: 'tween' }}
        >
            <h2 className={styles.sectionHeading}>Section 4</h2>
            <p className={styles.sectionText}>
                Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
            </p>
        </motion.section>
    );
}
