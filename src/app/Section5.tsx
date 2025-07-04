import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function Section5() {
    return (
        <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.8, type: 'spring' }}
        >
            <h2 className={styles.sectionHeading}>Section 5</h2>
            <p className={styles.sectionText}>
                Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas.
            </p>
        </motion.section>
    );
}
