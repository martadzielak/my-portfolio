import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function Section3() {
    return (
        <motion.section
            className={styles.section}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
        >
            <h2 className={styles.sectionHeading}>Section 3</h2>
            <p className={styles.sectionText}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
        </motion.section>
    );
}
