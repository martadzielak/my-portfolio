import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function Section6() {
    return (
        <motion.section
            className={styles.section}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.7, type: 'tween' }}
        >
            <h2 className={styles.sectionHeading}>Section 6</h2>
            <p className={styles.sectionText}>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.
            </p>
        </motion.section>
    );
}
