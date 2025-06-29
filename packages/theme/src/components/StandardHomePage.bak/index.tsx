import React, { useState } from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

export interface StandardHomePageProps {
  children: React.ReactNode;
  contentsContent?: React.ReactNode;
  frontMatter?: {
    title?: string;
    subtitle?: string;
  };
}

const StandardHomePage: React.FC<StandardHomePageProps> = ({
  children,
  contentsContent,
  frontMatter = {}
}) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'contents'>('welcome');

  // Hook calls must be unconditional – compute the logo URL here once
  const logoUrl = useBaseUrl('/img/logo-ifla_black.png');

  const { title = "International Standard Bibliographic Description", subtitle } = frontMatter;

  return (
    <div className={styles.standardHomepage}>
      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={clsx(styles.tabButton, {
            [styles.tabButtonActive]: activeTab === 'welcome'
          })}
          onClick={() => setActiveTab('welcome')}
          aria-selected={activeTab === 'welcome'}
          role="tab"
        >
          Welcome
        </button>
        <button
          className={clsx(styles.tabButton, {
            [styles.tabButtonActive]: activeTab === 'contents'
          })}
          onClick={() => setActiveTab('contents')}
          aria-selected={activeTab === 'contents'}
          role="tab"
        >
          Contents
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'welcome' && (
          <div className={styles.welcomeTab} role="tabpanel" aria-labelledby="welcome-tab">
            <div className={styles.heroSection}>
              <div className={styles.heroContent}>
                <div className={styles.logoContainer}>
                  <img
                    src={logoUrl}
                    alt="IFLA Logo"
                  />
                </div>
                <div className={styles.titleContainer}>
                  <h1 className={styles.heroTitle}>{title}</h1>
                  {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
                </div>
                <div className={styles.quickStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Current Release</span>
                    <span className={styles.statValue}>2024.1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.welcomeContent}>
              {children}
            </div>
          </div>
        )}

        {activeTab === 'contents' && (
          <div className={styles.contentsTab} role="tabpanel" aria-labelledby="contents-tab">
            {contentsContent || (
              <div className={styles.contentsPlaceholder}>
                <p>Contents tab content should be provided via the contentsContent prop.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardHomePage;
