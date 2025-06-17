import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import React from 'react';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          MulDiCat: Multilingual Dictionary of Cataloguing Terms
        </Heading>
        <p className="hero__subtitle">
          The authoritative multilingual dictionary for library cataloguing and metadata terminology
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Explore MulDiCat
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/elements">
            Browse Dictionary Terms
          </Link>
        </div>
      </div>
    </header>
  );
}

function IntroSection() {
  return (
    <section className={styles.introSection}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h2" className="text--center margin-bottom--lg">
              Supporting Global Library Standards
            </Heading>
            <p className="text--center text--lg">
              MulDiCat (Multilingual Dictionary of Cataloguing Terms and Concepts) is an authoritative,
              multilingual dictionary of terms and concepts used in library cataloging and classification.
              It provides definitions for core cataloguing and metadata terminology, reflecting international
              agreements, and is intended to support authoritative translations of IFLA cataloguing standards
              and related documents.
            </p>
            <p className="text--center text--lg">
              MulDiCat includes semantic relationships between terms (such as broader/narrower terms and synonyms)
              and is published as a linked open data vocabulary, making it accessible for integration into library
              systems and metadata applications.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HistorySection() {
  return (
    <section className={styles.benefitsSection}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--xl">
          Brief History
        </Heading>
        <div className="row">
          <div className="col col--12">
            <div className={styles.benefitCard}>
              <p>
                The MulDiCat project began in 1998, initiated by Monika Muennich for IFLA's Cataloguing Section.
                Originally, it was stored in a proprietary database developed by Bernard Eversberg in 2003.
              </p>
              <p>
                Over time, MulDiCat evolved, first appearing as a Word table and later as a SKOS file on the IFLA Namespace.
                The dictionary was shaped by international cataloguing code meetings, which reviewed terminology from FRBR,
                FRAD, and ISBD while developing the International Cataloguing Principles (ICP).
              </p>
              <p>
                Updates and translations have been ongoing, with recent efforts focusing on refining English terms,
                developing semantic relationships, and ensuring harmonization with other IFLA metadata standards.
                As of 2023, MulDiCat is maintained and updated by a working group that coordinates feedback from
                IFLA metadata sections and other review groups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleSection() {
  return (
    <section className={styles.showcaseSection}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--xl">
          Role in Library Cataloging Today
        </Heading>
        <div className="row">
          <div className="col col--6">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🔗</div>
              <Heading as="h4">Standards Harmonization</Heading>
              <p>
                MulDiCat serves as a cornerstone for harmonization among IFLA metadata standards,
                providing standardized definitions and semantic clarity for cataloguing concepts.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🌐</div>
              <Heading as="h4">Multilingual Support</Heading>
              <p>
                Used to ensure consistent, authoritative translations of cataloguing standards,
                supporting multilingual access and interoperability in the global library community.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🎓</div>
              <Heading as="h4">Educational Resource</Heading>
              <p>
                The dictionary is a semantic tool for cataloguers, aiding in the understanding and
                application of cataloguing principles, and is integrated into documentation, training,
                and cataloguing systems.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🔄</div>
              <Heading as="h4">Continuous Evolution</Heading>
              <p>
                MulDiCat is actively maintained to keep pace with evolving metadata standards,
                such as updates to ISBD and the IFLA Library Reference Model (LRM), ensuring
                its ongoing relevance in modern cataloguing practice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center">
            <Heading as="h2">Essential for Global Cataloguing</Heading>
            <p className="text--lg margin-bottom--lg">
              In summary, MulDiCat is a vital resource for the international cataloguing community,
              supporting consistent terminology, interoperability, and the multilingual application
              of library standards worldwide.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                Start with the Introduction
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/elements">
                Browse Dictionary Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="MulDiCat: Multilingual Dictionary of Cataloguing Terms"
      description="The authoritative multilingual dictionary for library cataloguing and metadata terminology, supporting global standards and interoperability">
      <HomepageHeader />
      <main>
        <IntroSection />
        <HistorySection />
        <RoleSection />
        <CallToAction />
      </main>
    </Layout>
  );
}
