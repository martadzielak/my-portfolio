import styles from "./page.module.css";
import Section from "./Section";
import Footer from "./Footer";
import CowCanvas from "./Canvas";

export const metadata = {
  title: "Marta Dziełak: Portfolio",
  description: "Hello, I'm Marta and this is my portfolio. I am a software engineer with a passion for creating innovative solutions. Let me show you my professional journey and the projects I have worked on.",
}

export default function Home() {

  return (
    <div className={styles.page}>
      <h1 className={styles.mainHeading}>Marta Dziełak</h1>
      <h2 className={styles.subHeading}>PORTFOLIO</h2>
      <main className={styles.sectionsMain}>
        <Section
          heading="Hi!"
          text="My name is Marta, and I am a software engineer with a passion for creating innovative solutions. Let me show you my professional journey and the projects I have worked on."

        />

        <Section
          heading="Tylko 2023-2025"
          text={"At Tylko I have been a part of a team responsible for the heart of Tylko's furniture configurator - parametric geometry. We have been working on creating and developing the parametrization concept, so that shelves and chests of drawers can be correct and look great for every configuration. This involves defining the rules and parameters that govern how the furniture is built, ensuring that it meets both functional and aesthetic requirements. The configurator allows users to customize their furniture in a way that is both flexible and precise, resulting in high-quality products that fit perfectly into their spaces."}
          videoSrc="/Tylko-movie.mp4"
        />
        <Section
          text={"I have also taken part in the development of a completely new product - sofas, creating a sofa configurator which is among the best in the market. It allows users many ways to customize their sofas, either globally for the whole sofa or individually for each module. The configurator is designed to be user-friendly and intuitive, allowing customers to easily visualize their choices and see how different options affect the overall look of the sofa. You can see how it works on the video below:"}
          videoSrc="/Tylko-movie2.mp4"
        />
        <Section
          heading="StepStone 2020-2022"
          text="At StepStone I had a chance to learn modern frontend technologies and diligent work organization. First, my team was responsible for implementing a new project - a CV Generator. It was using the latest technologies such as React, TypeScript, and GraphQL. The CV Generator allows users to create professional CVs in a user-friendly way, with various templates and customization options. Here is a video showing how it looks like now (it has been upgraded since!):"
          videoSrc="/StepStone-movie.mp4"
        />
        <Section
          text="After we finished it, we also worked on an innovative method of sending an application - without a CV! It was a form-based application system that allows users to apply for jobs without needing a traditional CV. This approach not only simplifies the application process but also enhances user experience by focusing on skills and qualifications rather than formal documents. Here is a video showing how it works:"
          videoSrc="/StepStone-movie2.mp4"
        />
        <Section
          heading="2019-2020 Sage"
          text="My previous position was at Sage, where I started by fixing bugs in legacy part of the software. I have been digging into code written in an internal 4GL language, created in the 70s! Later I worked on internal projects such as implementing a way of gathering documentation from different sources and deploying it automatically to a webpage. At last, I have also worked on preparing and conducting load tests!"
        />
        <Section
          heading="2019 - Praca.pl"
          text="My first professional experience as a software engineer was at Praca.pl, where I worked on implementing Wordpress webpages with job offers. I have been preparing them independently from the beginning to production! Also, my work included implementing improvements for SEO. Here is an example of a webpage I have created"
          videoSrc="/Pracapl-movie.mp4"
        />
        <Section
          heading="What is next?"
          text="I would like to advance my career in software engineering. I am particularly interested in creating user-centered applications and working closely with UX designers. I wonder where this will lead me?"
        />
      </main>
      <Footer />
      <CowCanvas />

    </div>
  );
}
