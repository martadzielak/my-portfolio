'use client'
import styles from "./page.module.css";
import Section1 from './Section1'
import Section2 from './Section2'
import Section3 from './Section3'
import Section4 from './Section4'
import Section5 from './Section5'
import Section6 from './Section6'


export default function Home() {

  return (
    <div className={styles.page}>
      <h1 className={styles.mainHeading}>Marta Dziełak</h1>
      <main className={styles.sectionsMain}>
        <Section1 data-aos="fade-left" data-aos-anchor-placement="top-top" data-aos-duration="1000" />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
      </main>
    </div>
  );
}
