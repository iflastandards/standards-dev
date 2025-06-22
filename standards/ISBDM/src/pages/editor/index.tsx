import React from 'react';
import type { ReactElement } from 'react';
import Layout from '@theme/Layout';
import styles from './styles.module.scss';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

export default function Editor(): ReactElement {

  return (
    <Layout title="IFLA Standards Editor" description="Dashboard for managing IFLA standards documentation">
      <main className={styles.editorMain}>
        <div className={styles.header}>
          <h1>IFLA Standards Editor Dashboard</h1>
          <p className={styles.subtitle}>Manage standards, vocabularies, and documentation</p>
        </div>

        <div className={styles.dashboardContainer}>
          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <button className={clsx(styles.actionCard, styles.createVocab)}>
                <div className={styles.icon}>📝</div>
                <h3>Create Vocabulary</h3>
                <p>Start a new vocabulary with guided wizard</p>
              </button>
              
              <button className={clsx(styles.actionCard, styles.importDoc)}>
                <div className={styles.icon}>📊</div>
                <h3>Import Spreadsheet</h3>
                <p>Convert CSV/Excel to MDX documentation</p>
              </button>
              
              <button className={clsx(styles.actionCard, styles.translate)}>
                <div className={styles.icon}>🌐</div>
                <h3>Manage Translations</h3>
                <p>Review and update translations</p>
              </button>
              
              <button className={clsx(styles.actionCard, styles.publish)}>
                <div className={styles.icon}>🚀</div>
                <h3>Publish Changes</h3>
                <p>Deploy updates to production</p>
              </button>
            </div>
          </section>

          {/* Active Projects */}
          <section className={styles.activeProjects}>
            <h2>Active Projects</h2>
            <div className={styles.projectList}>
              <div className={styles.projectCard}>
                <div className={styles.projectHeader}>
                  <h3>ISBDM Vocabulary</h3>
                  <span className={styles.status}>In Progress</span>
                </div>
                <p>International Standard Bibliographic Description for Manifestation</p>
                <div className={styles.projectMeta}>
                  <span>12 elements</span>
                  <span>3 pending reviews</span>
                  <span>Last updated: 2 hours ago</span>
                </div>
                <div className={styles.projectActions}>
                  <button className={styles.btn}>Edit</button>
                  <button className={styles.btnSecondary}>Preview</button>
                  <button className={styles.btnSecondary}>History</button>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectHeader}>
                  <h3>Sensory Specification</h3>
                  <span className={clsx(styles.status, styles.review)}>Under Review</span>
                </div>
                <p>Vocabulary for sensory characteristics of resources</p>
                <div className={styles.projectMeta}>
                  <span>24 concepts</span>
                  <span>5 comments</span>
                  <span>Last updated: 1 day ago</span>
                </div>
                <div className={styles.projectActions}>
                  <button className={styles.btn}>Edit</button>
                  <button className={styles.btnSecondary}>Preview</button>
                  <button className={styles.btnSecondary}>History</button>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectHeader}>
                  <h3>RDA Entities</h3>
                  <span className={clsx(styles.status, styles.published)}>Published</span>
                </div>
                <p>Resource Description and Access entity definitions</p>
                <div className={styles.projectMeta}>
                  <span>156 entities</span>
                  <span>v2.1.0</span>
                  <span>Published: 1 week ago</span>
                </div>
                <div className={styles.projectActions}>
                  <button className={styles.btn}>New Version</button>
                  <button className={styles.btnSecondary}>View</button>
                  <button className={styles.btnSecondary}>Archive</button>
                </div>
              </div>
            </div>
          </section>

          {/* Workflow Status */}
          <section className={styles.workflowSection}>
            <h2>Workflow Status</h2>
            <div className={styles.workflowGrid}>
              <div className={styles.workflowCard}>
                <h3>Pending Reviews</h3>
                <div className={styles.workflowCount}>8</div>
                <ul className={styles.workflowList}>
                  <li>
                    <span>ISBDM Element 1022</span>
                    <span className={styles.time}>2h ago</span>
                  </li>
                  <li>
                    <span>Sensory Vocab Update</span>
                    <span className={styles.time}>5h ago</span>
                  </li>
                  <li>
                    <span>Translation: Spanish</span>
                    <span className={styles.time}>1d ago</span>
                  </li>
                </ul>
                <Link to="#" className={styles.viewAll}>View all →</Link>
              </div>

              <div className={styles.workflowCard}>
                <h3>Translation Progress</h3>
                <div className={styles.translationStats}>
                  <div className={styles.langProgress}>
                    <span>Spanish</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '85%' }}></div>
                    </div>
                    <span>85%</span>
                  </div>
                  <div className={styles.langProgress}>
                    <span>French</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '72%' }}></div>
                    </div>
                    <span>72%</span>
                  </div>
                  <div className={styles.langProgress}>
                    <span>German</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '45%' }}></div>
                    </div>
                    <span>45%</span>
                  </div>
                </div>
                <Link to="#" className={styles.viewAll}>Manage translations →</Link>
              </div>

              <div className={styles.workflowCard}>
                <h3>Recent Activity</h3>
                <ul className={styles.activityList}>
                  <li>
                    <div className={styles.activityIcon}>✏️</div>
                    <div>
                      <strong>Element 1240 updated</strong>
                      <span>by Sarah Chen • 30m ago</span>
                    </div>
                  </li>
                  <li>
                    <div className={styles.activityIcon}>✅</div>
                    <div>
                      <strong>Vocabulary approved</strong>
                      <span>by Review Board • 2h ago</span>
                    </div>
                  </li>
                  <li>
                    <div className={styles.activityIcon}>💬</div>
                    <div>
                      <strong>New comment on ISBDM</strong>
                      <span>by John Doe • 4h ago</span>
                    </div>
                  </li>
                </ul>
                <Link to="#" className={styles.viewAll}>View all activity →</Link>
              </div>
            </div>
          </section>

          {/* Tools & Resources */}
          <section className={styles.toolsSection}>
            <h2>Tools & Resources</h2>
            <div className={styles.toolsGrid}>
              <Link to="#" className={styles.toolCard}>
                <div className={styles.toolIcon}>🔧</div>
                <h3>Validation Tools</h3>
                <p>Check vocabulary consistency</p>
              </Link>
              <Link to="#" className={styles.toolCard}>
                <div className={styles.toolIcon}>📚</div>
                <h3>Documentation</h3>
                <p>Editor guidelines & tutorials</p>
              </Link>
              <Link to="#" className={styles.toolCard}>
                <div className={styles.toolIcon}>🔗</div>
                <h3>API Access</h3>
                <p>Integrate with external systems</p>
              </Link>
              <Link to="#" className={styles.toolCard}>
                <div className={styles.toolIcon}>👥</div>
                <h3>User Management</h3>
                <p>Manage team & permissions</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}