import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function Section2() {
    return (
        <motion.section
            className={styles.section}
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            transition={{ duration: 0.8, type: 'tween' }}
        >
            <h2 className={styles.sectionHeading}>Section 2</h2>
            <p className={styles.sectionText}>
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
        </motion.section>
    );
}
