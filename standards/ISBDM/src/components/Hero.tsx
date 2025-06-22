import React, {JSX} from 'react';
import Link from '@docusaurus/Link';
import styles from './Hero.module.css';

export default function Hero(): JSX.Element {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            ISBDM Standard
          </h1>
          <p className={styles.heroSubtitle}>
            International Standard Bibliographic Description for Monographic Publications
          </p>
          
          <div className={styles.heroActions}>
            <Link
              className="button button--primary button--lg"
              to="/docs/overview">
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/elements">
              Browse Elements
            </Link>
          </div>
          
          <div className={styles.heroDescription}>
            <h2>Bibliographic Description Standard</h2>
            <p>
              ISBDM provides standardized rules for the bibliographic description of monographic publications, enabling:
            </p>
            <ul>
              <li>Consistent cataloging practices</li>
              <li>International resource sharing</li>
              <li>Improved discovery and access</li>
              <li>Interoperability between systems</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}