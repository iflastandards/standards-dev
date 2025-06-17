import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './styles.module.scss';

export interface OutLinkProps {
  /**
   * URL to link to - will be processed through useBaseUrl for internal links
   */
  href: string;
  
  /**
   * Whether link should open in a new tab. Automatically set to true for external links.
   */
  external?: boolean;
  
  /**
   * Link content
   */
  children: React.ReactNode;
  
  /**
   * CSS class name
   */
  className?: string;
}

/**
 * OutLink component for external links with proper security attributes
 */
export const OutLink: React.FC<OutLinkProps> = ({
  href,
  external,
  children,
  className,
}) => {
  // Check if the URL is external by looking for protocol or domain
  const isExternal = React.useMemo(() => {
    if (typeof external !== 'undefined') {
      return external;
    }
    return /^(https?:\/\/|www\.|[^/]+\.[^/]+)/.test(href);
  }, [href, external]);

  // Process URLs for internal links - call hook unconditionally
  const baseProcessedHref = useBaseUrl(href);
  const processedHref = React.useMemo(() => {
    return isExternal ? href : baseProcessedHref;
  }, [href, isExternal, baseProcessedHref]);
  
  return (
    <a
      href={processedHref}
      className={clsx(
        'linkOutline',
        styles.outLink,
        isExternal && styles.outLinkExternal,
        className
      )}
      {...(isExternal && {
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${children} (opens in a new tab)`,
      })}
    >
      {children}
      {isExternal && (
        <span className={styles.externalIcon} aria-hidden="true">
          <svg
            width="13.5"
            height="13.5"
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={styles.iconSvg}
          >
            <path
              fill="currentColor"
              d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
            />
          </svg>
        </span>
      )}
    </a>
  );
};

export default OutLink; 