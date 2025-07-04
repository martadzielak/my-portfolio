import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function Section1() {
    return (
        <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, type: 'spring' }}
        >
            <h2 className={styles.sectionHeading}>Section 1</h2>
            <p className={styles.sectionText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.
            </p>
        </motion.section>
    );
}
