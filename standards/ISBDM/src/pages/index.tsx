import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import React from 'react';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Welcome to the Future of IFLA Standards
        </Heading>
        <p className="hero__subtitle">
          Experience the new ISBD for Manifestation (ISBDM) - a modern, interactive approach to bibliographic standards documentation
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Explore ISBDM
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/about/docusaurus-for-ifla">
            Learn About This Platform
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
              A New Era for Library Standards Documentation
            </Heading>
            <p className="text--center text--lg">
              ISBDM represents a groundbreaking shift in how IFLA presents and maintains its standards. 
              Built on modern web technologies, this platform offers librarians, archivists, and catalogers 
              an intuitive, searchable, and multilingual experience that adapts to your needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className={styles.benefitsSection}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--xl">
          Why This New Approach Matters
        </Heading>
        <div className="row">
          <div className="col col--6">
            <div className={styles.benefitCard}>
              <Heading as="h3">🔍 Instant Access</Heading>
              <p>
                Find any element, stipulation, or example in seconds with powerful search capabilities. 
                No more scrolling through PDFs or flipping through printed pages.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.benefitCard}>
              <Heading as="h3">🌐 Truly Multilingual</Heading>
              <p>
                Switch seamlessly between English, French, Spanish, and German. 
                Every element maintains its context and relationships across languages.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.benefitCard}>
              <Heading as="h3">🔗 Interconnected Knowledge</Heading>
              <p>
                Navigate relationships between elements effortlessly. See how manifestations 
                connect to other LRM entities with just a click.
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.benefitCard}>
              <Heading as="h3">📱 Works Everywhere</Heading>
              <p>
                Access ISBDM from any device - desktop, tablet, or mobile. 
                The responsive design ensures a perfect experience on any screen size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocusaurusShowcase() {
  return (
    <section className={clsx(styles.showcaseSection, 'hero hero--dark')}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--xl">
          Powered by Docusaurus: The Future of Documentation
        </Heading>
        <div className="row">
          <div className="col col--12">
            <p className="text--center text--lg margin-bottom--lg">
              This ISBDM site demonstrates how modern documentation platforms can transform 
              the way we interact with library standards. Built with Docusaurus, it offers:
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col col--4">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>⚡</div>
              <Heading as="h4">Lightning Fast</Heading>
              <p>
                Static site generation means pages load instantly. 
                No waiting for servers or databases.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🔄</div>
              <Heading as="h4">Version Control</Heading>
              <p>
                Track every change, compare versions, and maintain a complete 
                history of standard evolution.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🤝</div>
              <Heading as="h4">Community Driven</Heading>
              <p>
                Enable collaborative editing and review processes with 
                built-in commenting and contribution workflows.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🎨</div>
              <Heading as="h4">Customizable</Heading>
              <p>
                Adapt the look and feel to match IFLA branding while 
                maintaining accessibility standards.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>📊</div>
              <Heading as="h4">Rich Components</Heading>
              <p>
                Interactive tables, diagrams, and examples that make 
                complex relationships easy to understand.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseIcon}>🌙</div>
              <Heading as="h4">Dark Mode</Heading>
              <p>
                Reduce eye strain with automatic dark mode support 
                for comfortable reading in any environment.
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
            <Heading as="h2">Ready to Explore?</Heading>
            <p className="text--lg margin-bottom--lg">
              Discover how ISBDM reimagines bibliographic standards for the digital age. 
              See how this approach could transform all IFLA documentation.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                Start with the Introduction
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/fullex">
                View Full Examples
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Welcome to the Future of IFLA Standards"
      description="ISBD for Manifestation (ISBDM) - A modern, interactive approach to bibliographic standards documentation powered by Docusaurus">
      <HomepageHeader />
      <main>
        <IntroSection />
        <HomepageFeatures />
        <BenefitsSection />
        <DocusaurusShowcase />
        <CallToAction />
      </main>
    </Layout>
  );
}
