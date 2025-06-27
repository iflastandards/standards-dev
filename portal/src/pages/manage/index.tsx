import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import { type SiteKey, type SiteConfigEntry } from '@ifla/theme/config/siteConfig';
import styles from './styles.module.css';
// This will eventually check GitHub org membership
// For now, we'll create the UI structure
function ManagementDashboard(): React.ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const siteConfigs = siteConfig.customFields?.siteConfigs as Record<SiteKey, SiteConfigEntry>;

  // Helper function to build site URLs
  const buildSiteUrl = (siteKey: SiteKey, path: string = '/') => {
    const config = siteConfigs[siteKey];
    if (!config) {
      throw new Error(`Site configuration not found for ${siteKey}`);
    }
    return config.url + config.baseUrl + path.replace(/^\//, '');
  };

  return (
    <div className={styles.managementContainer}>
      <div className="container">
        <div className={styles.header}>
          <Heading as="h1">Site Management</Heading>
          <p className={styles.headerDescription}>
            Manage IFLA Standards development, review groups, and workflows
          </p>
        </div>

        <div className="row">
          {/* Site-wide Management */}
          <div className="col col--6">
            <div className={styles.managementCard}>
              <Heading as="h2">Site-wide Management</Heading>
              <p>Organization-level tools and oversight</p>

              <div className={styles.cardActions}>
                <h3>GitHub Projects & Issues</h3>
                <div className={styles.actionGroup}>
                  <Link
                    className="button button--primary"
                    href="https://github.com/iflastandards/standards-dev/projects">
                    View Projects
                  </Link>
                  <Link
                    className="button button--secondary"
                    href="https://github.com/iflastandards/standards-dev/issues">
                    Open Issues
                  </Link>
                  <Link
                    className="button button--secondary"
                    href="https://github.com/iflastandards/standards-dev/pulls">
                    Pull Requests
                  </Link>
                </div>

                <h3>Team Management</h3>
                <div className={styles.actionGroup}>
                  <Link
                    className="button button--primary"
                    href="https://github.com/orgs/iflastandards/teams">
                    Manage Teams
                  </Link>
                  {/* <Link
                    className="button button--secondary"
                    to="/manage/assign-managers/"> 
                    Assign Team Managers
                  </Link> */}
                </div>

                <h3>Global Tools</h3>
                <div className={styles.actionGroup}>
                  {/* <Link
                    className="button button--outline button--primary"
                    to="/manage/create-standard/"> 
                    Create New Standard
                  </Link> */}
                </div>
              </div>
            </div>
          </div>

          {/* Standards Overview */}
          <div className="col col--6">
            <div className={styles.managementCard}>
              <Heading as="h2">Standards Overview</Heading>
              <p>Quick access to per-standard management</p>

              <div className={styles.standardsList}>
                {[
                  { code: 'ISBDM', name: 'ISBD for Manifestation', href: buildSiteUrl('ISBDM', '/manage'), status: 'published' },
                  { code: 'LRM', name: 'Library Reference Model', href: buildSiteUrl('LRM', '/manage'), status: 'published' },
                  { code: 'ISBD', name: 'International Standard Bibliographic Description', href: buildSiteUrl('isbd', '/manage'), status: 'development' },
                  { code: 'FRBR', name: 'Functional Requirements', href: buildSiteUrl('FRBR', '/manage'), status: 'development' },
                  { code: 'MulDiCat', name: 'Multilingual Dictionary', href: buildSiteUrl('muldicat', '/manage'), status: 'development' },
                  { code: 'UNIMARC', name: 'UNIMARC', href: buildSiteUrl('unimarc', '/manage'), status: 'development' },
                ].map((standard) => (
                  <div key={standard.code} className={styles.standardItem}>
                    <div className={styles.standardInfo}>
                      <strong>{standard.code}</strong>
                      <span className={styles.standardName}>{standard.name}</span>
                      <span className={clsx(
                        styles.statusBadge, 
                        standard.status === 'published' ? styles.statusPublished : styles.statusDevelopment
                      )}>
                        {standard.status}
                      </span>
                    </div>
                    <Link
                      className="button button--sm button--outline"
                      to={standard.href}>
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="row margin-top--lg">
          <div className="col">
            <div className={styles.quickActionsCard}>
              <Heading as="h2">Priority Tools</Heading>
              <p>Most-needed functionality for immediate use</p>

              <div className="row">
                <div className="col col--4">
                  <div className={styles.toolCard}>
                    <h3>CSV ↔ RDF</h3>
                    <p>Convert between CSV and RDF formats</p>
                    {/* <Link className="button button--primary button--block" to="/manage/csv-rdf/"> 
                      CSV/RDF Tools
                    </Link> */}
                  </div>
                </div>

                <div className="col col--4">
                  <div className={styles.toolCard}>
                    <h3>Google Sheets</h3>
                    <p>Sync with Google Sheets</p>
                    {/* <Link className="button button--primary button--block" to="/manage/sheets/"> 
                      Sheet Tools
                    </Link> */}
                  </div>
                </div>

                <div className="col col--4">
                  <div className={styles.toolCard}>
                    <h3>Scaffold Pages</h3>
                    <p>Generate documentation pages</p>
                    {/* <Link className="button button--primary button--block" to="/manage/scaffold/"> 
                      Scaffold Tools
                    </Link> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagePage(): React.ReactNode {
  // TODO: Add GitHub org membership check here
  // For now, show the management dashboard

  return (
    <Layout
      title="Site Management"
      description="IFLA Standards site management dashboard">
      <ManagementDashboard />
    </Layout>
  );
}
