import React, { useState } from 'react';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.scss';

interface ManagementAction {
  id: string;
  title: string;
  description: string;
  type: 'github-cli' | 'codespaces' | 'internal' | 'external';
  disabled?: boolean;
}

interface TabData {
  id: string;
  label: string;
  actions: ManagementAction[];
}

export interface SiteManagementProps {
  siteTitle: string;
  siteCode: string;
  githubRepo?: string;
}

const managementTabs: TabData[] = [
  {
    id: 'overview',
    label: 'Overview',
    actions: [] // Special case - will show dashboard
  },
  {
    id: 'content',
    label: 'Content Management',
    actions: [
      {
        id: 'create-page',
        title: 'Create New Page',
        description: 'Add new documentation pages for elements, terms, or concepts',
        type: 'github-cli'
      },
      {
        id: 'scaffold-elements',
        title: 'Scaffold Element Pages',
        description: 'Generate element documentation from CSV data',
        type: 'github-cli'
      },
      {
        id: 'scaffold-vocabularies',
        title: 'Scaffold Vocabulary Pages',
        description: 'Generate value vocabulary pages from CSV data',
        type: 'github-cli'
      },
      {
        id: 'update-examples',
        title: 'Manage Examples',
        description: 'Add, edit, or organize usage examples',
        type: 'codespaces'
      },
      {
        id: 'organize-sidebar',
        title: 'Organize Navigation',
        description: 'Reorder sidebar structure and categorization',
        type: 'codespaces'
      }
    ]
  },
  {
    id: 'rdf',
    label: 'RDF & Vocabularies',
    actions: [
      {
        id: 'csv-to-rdf',
        title: 'CSV → RDF',
        description: 'Convert CSV vocabulary data to RDF format',
        type: 'github-cli'
      },
      {
        id: 'rdf-to-csv',
        title: 'RDF → CSV',
        description: 'Extract CSV data from RDF fragments',
        type: 'github-cli'
      },
      {
        id: 'sync-sheets',
        title: 'Sync Google Sheets',
        description: 'Pull/push data between CSV files and Google Sheets',
        type: 'github-cli'
      },
      {
        id: 'validate-rdf',
        title: 'Validate RDF',
        description: 'Check RDF fragments against DCTAP profile',
        type: 'github-cli'
      },
      {
        id: 'update-context',
        title: 'Update JSON-LD Context',
        description: 'Maintain context files for this standard',
        type: 'codespaces'
      },
      {
        id: 'generate-release',
        title: 'Generate RDF Release',
        description: 'Compile fragments into master RDF files',
        type: 'github-cli'
      }
    ]
  },
  {
    id: 'workflow',
    label: 'Review & Workflow',
    actions: [
      {
        id: 'review-queue',
        title: 'Review Queue',
        description: 'View and manage pending content reviews',
        type: 'internal'
      },
      {
        id: 'assign-reviewers',
        title: 'Assign Reviewers',
        description: 'Assign team members to review specific content',
        type: 'internal'
      },
      {
        id: 'track-deadlines',
        title: 'Track Deadlines',
        description: 'Monitor review timelines and upcoming deadlines',
        type: 'internal'
      },
      {
        id: 'workflow-status',
        title: 'Content Status',
        description: 'View what content is in each workflow stage',
        type: 'internal'
      },
      {
        id: 'merge-approved',
        title: 'Merge Approved Changes',
        description: 'Integrate reviewed and approved content',
        type: 'github-cli'
      }
    ]
  },
  {
    id: 'team',
    label: 'Team Management',
    actions: [
      {
        id: 'manage-members',
        title: 'Manage Team Members',
        description: 'Add or remove contributors to this standard',
        type: 'external'
      },
      {
        id: 'assign-roles',
        title: 'Assign Roles',
        description: 'Set reviewer and editor permissions',
        type: 'external'
      },
      {
        id: 'view-activity',
        title: 'View Team Activity',
        description: 'Monitor contributions and recent changes',
        type: 'internal'
      },
      {
        id: 'team-settings',
        title: 'Team Settings',
        description: 'Configure team preferences and notifications',
        type: 'internal'
      }
    ]
  },
  {
    id: 'releases',
    label: 'Releases & Publishing',
    actions: [
      {
        id: 'create-release',
        title: 'Create Release Candidate',
        description: 'Package content for testing and review',
        type: 'github-cli'
      },
      {
        id: 'release-notes',
        title: 'Generate Release Notes',
        description: 'Document changes and updates for this release',
        type: 'codespaces'
      },
      {
        id: 'export-pdf',
        title: 'Export PDF',
        description: 'Generate downloadable PDF documentation',
        type: 'github-cli'
      },
      {
        id: 'tag-release',
        title: 'Tag Stable Release',
        description: 'Mark and publish a stable version',
        type: 'github-cli'
      },
      {
        id: 'deploy-production',
        title: 'Deploy to Production',
        description: 'Publish approved release to live site',
        type: 'github-cli'
      }
    ]
  },
  {
    id: 'quality',
    label: 'Quality Assurance',
    actions: [
      {
        id: 'validate-links',
        title: 'Validate Links',
        description: 'Check all internal and external references',
        type: 'github-cli'
      },
      {
        id: 'check-consistency',
        title: 'Check Consistency',
        description: 'Validate terminology and cross-references',
        type: 'github-cli'
      },
      {
        id: 'accessibility-audit',
        title: 'Accessibility Audit',
        description: 'Verify WCAG compliance across all pages',
        type: 'github-cli'
      },
      {
        id: 'translation-check',
        title: 'Translation Status',
        description: 'Review multilingual content consistency',
        type: 'internal'
      },
      {
        id: 'performance-test',
        title: 'Performance Test',
        description: 'Check site speed and build performance',
        type: 'github-cli'
      }
    ]
  }
];

function StatusDashboard({ siteTitle, siteCode }: { siteTitle: string, siteCode: string }) {
  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.statusCard}>
        <h3>Current Status</h3>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Last Updated:</span>
          <span className={styles.statusValue}>2 hours ago</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Build Status:</span>
          <span className={clsx(styles.statusValue, styles.statusSuccess)}>Passing</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Open PRs:</span>
          <span className={styles.statusValue}>3</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Pending Reviews:</span>
          <span className={styles.statusValue}>5</span>
        </div>
      </div>
      
      <div className={styles.statusCard}>
        <h3>Recent Activity</h3>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>2h ago</span>
            <span className={styles.activityText}>Updated element C2001</span>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>1d ago</span>
            <span className={styles.activityText}>Merged PR #45</span>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityTime}>2d ago</span>
            <span className={styles.activityText}>Added new vocabulary terms</span>
          </div>
        </div>
      </div>
      
      <div className={styles.statusCard}>
        <h3>Quick Actions</h3>
        <div className={styles.quickActions}>
          <button className="button button--primary button--sm" disabled>
            New Content
          </button>
          <button className="button button--secondary button--sm" disabled>
            Sync Sheets
          </button>
          <button className="button button--secondary button--sm" disabled>
            View PRs
          </button>
        </div>
      </div>
      
      <div className={styles.statusCard}>
        <h3>Team Overview</h3>
        <div className={styles.teamStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>8</span>
            <span className={styles.statLabel}>Team Members</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>Active Reviewers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionGrid({ actions }: { actions: ManagementAction[] }) {
  const getActionTypeIcon = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli': return '⚡';
      case 'codespaces': return '💻';
      case 'internal': return '🔧';
      case 'external': return '🔗';
      default: return '📋';
    }
  };
  
  const getActionTypeLabel = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli': return 'GitHub CLI';
      case 'codespaces': return 'Codespaces';
      case 'internal': return 'Internal Tool';
      case 'external': return 'External Link';
      default: return 'Action';
    }
  };
  
  return (
    <div className={styles.actionGrid}>
      {actions.map((action) => (
        <div key={action.id} className={clsx(styles.actionCard, action.disabled && styles.actionDisabled)}>
          <div className={styles.actionHeader}>
            <h4>{action.title}</h4>
            <span className={styles.actionType} title={getActionTypeLabel(action.type)}>
              {getActionTypeIcon(action.type)}
            </span>
          </div>
          <p className={styles.actionDescription}>{action.description}</p>
          <div className={styles.actionFooter}>
            <button 
              className={clsx(
                'button',
                action.disabled !== false ? 'button--secondary' : 'button--primary',
                'button--sm'
              )}
              disabled={action.disabled !== false}
            >
              {action.disabled !== false ? 'Coming Soon' : 'Run Action'}
            </button>
            <span className={styles.actionTypeLabel}>{getActionTypeLabel(action.type)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SiteManagement({ 
  siteTitle, 
  siteCode, 
  githubRepo = 'iflastandards/standards-dev' 
}: SiteManagementProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const currentTab = managementTabs.find(tab => tab.id === activeTab);
  
  return (
    <div className={styles.managementContainer}>
      <div className="container">
        <div className={styles.header}>
          <Heading as="h1">{siteTitle} Management</Heading>
          <p className={styles.headerDescription}>
            Manage content, workflows, and team collaboration for the {siteTitle} standard
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {managementTabs.map((tab) => (
            <button
              key={tab.id}
              className={clsx(
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' ? (
            <StatusDashboard siteTitle={siteTitle} siteCode={siteCode} />
          ) : (
            currentTab && (
              <>
                <div className={styles.tabHeader}>
                  <Heading as="h2">{currentTab.label}</Heading>
                  <p>Manage {currentTab.label.toLowerCase()} for {siteTitle}</p>
                </div>
                <ActionGrid actions={currentTab.actions} />
              </>
            )
          )}
        </div>
        
        {/* Footer Links */}
        <div className={styles.managementFooter}>
          <div className={styles.footerSection}>
            <h4>External Resources</h4>
            <div className={styles.footerLinks}>
              <Link href={`https://github.com/${githubRepo}`} className="button button--outline button--sm">
                GitHub Repository
              </Link>
              <Link href={`https://github.com/${githubRepo}/issues`} className="button button--outline button--sm">
                Issues
              </Link>
              <Link href={`https://github.com/${githubRepo}/pulls`} className="button button--outline button--sm">
                Pull Requests
              </Link>
              <Link href={`https://github.com/orgs/iflastandards/teams`} className="button button--outline button--sm">
                Team Management
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
