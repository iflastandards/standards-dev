import {JSX, ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import { getSiteUrl, type SiteKey } from '@ifla/theme/config/siteConfig';
import { DocsEnv } from '@ifla/theme/config/siteConfigCore';

type StandardItem = {
  title: string;
  code: string;
  description: ReactNode;
  siteKey: SiteKey;
  status: 'published' | 'draft' | 'development';
  href: string; // Pre-computed URL
};

// Define the standards list data without hrefs (to be computed at render time)
const StandardsListData = [
  {
    title: 'ISBD for Manifestation (ISBDM)',
    code: 'ISBDM',
    description: (
      <>
        International Standard Bibliographic Description for Manifestation provides rules for creating 
        consistent bibliographic descriptions of library materials in their physical or digital form.
      </>
    ),
    siteKey: 'ISBDM' as SiteKey,
    status: 'published' as const,
  },
  {
    title: 'Library Reference Model (LRM)',
    code: 'LRM',
    description: (
      <>
        A high-level conceptual model that provides a framework for understanding the bibliographic universe 
        and the relationships between bibliographic entities.
      </>
    ),
    siteKey: 'LRM' as SiteKey,
    status: 'published' as const,
  },
  {
    title: 'International Standard Bibliographic Description (ISBD)',
    code: 'ISBD',
    description: (
      <>
        The foundational standard for bibliographic description, providing rules for creating consistent 
        and comprehensive bibliographic records across all types of library materials.
      </>
    ),
    siteKey: 'isbd' as SiteKey,
    status: 'development' as const,
  },
  {
    title: 'Functional Requirements (FR)',
    code: 'FRBR',
    description: (
      <>
        Specifications for functional requirements that support discovery, identification, selection, 
        and access to bibliographic resources.
      </>
    ),
    siteKey: 'FRBR' as SiteKey,
    status: 'development' as const,
  },
  {
    title: 'Multilingual Dictionary of Cataloguing Terms (MulDiCat)',
    code: 'MulDiCat',
    description: (
      <>
        A comprehensive multilingual dictionary providing standardized cataloguing terminology 
        to support international library cooperation.
      </>
    ),
    siteKey: 'muldicat' as SiteKey,
    status: 'development' as const,
  },
  {
    title: 'UNIMARC',
    code: 'UNIMARC',
    description: (
      <>
        Universal MARC format designed to facilitate the international exchange of bibliographic data 
        and support library automation.
      </>
    ),
    siteKey: 'unimarc' as SiteKey,
    status: 'development' as const,
  },
];

function StandardCard({title, code, description, href, status}: StandardItem) {
  const statusClass = status === 'published' ? styles.statusPublished : 
                     status === 'draft' ? styles.statusDraft : styles.statusDevelopment;
  
  return (
    <div className={clsx('col col--6', styles.standardCard)}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <Heading as="h3">{title}</Heading>
            <span className={clsx(styles.statusBadge, statusClass)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <p>{description}</p>
        </div>
        <div className={styles.cardFooter}>
          <Link
            className="button button--primary button--block"
            to={href}>
            View {code} Standard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  const { siteConfig: { customFields } } = useDocusaurusContext();
  
  // Get current environment from Docusaurus customFields
  const currentEnv = (customFields?.docsEnv as DocsEnv) || DocsEnv.Production;
  
  // Generate standards list with URLs computed at render time
  const StandardsList: StandardItem[] = StandardsListData.map(item => ({
    ...item,
    href: getSiteUrl(item.siteKey, '', currentEnv),
  }));

  return (
    <section className={styles.features} id="standards">
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">IFLA Standards</Heading>
          <p className={styles.sectionDescription}>
            Explore our comprehensive collection of international bibliographic standards, 
            developed through collaborative efforts with library professionals worldwide.
          </p>
        </div>
        <div className="row">
          {StandardsList.map((props, idx) => (
            <StandardCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
