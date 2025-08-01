import { SocialIcon } from 'react-social-icons';
import styles from './page.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <main className={styles.footerMain}>
                <section className={styles.footerSection}>
                    <h3 className={styles.footerHeading}>Contact:</h3>
                    <a href="mailto:marta.dzielak@gmail.com">marta.dzielak@gmail.com</a>
                </section>
                <section className={styles.footerSection}>
                    <h3>Links:</h3>
                    <SocialIcon url="https://github.com/martadzielak" style={{ margin: "0 5px" }} />
                    <SocialIcon url="https://www.linkedin.com/in/martadzielak/" style={{ margin: "0 5px" }} />
                    <SocialIcon url="https://leetcode.com/u/marthvader/" style={{ margin: "0 5px" }} />
                    <SocialIcon url="https://www.codewars.com/users/darkmartter" style={{ margin: "0 5px" }} />
                </section>
            </main>
            <p>© 2025 Marta Dziełak</p>
        </footer>
    );
}
