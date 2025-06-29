import React from 'react';
import { InLink } from '@ifla/theme';
import styles from './CompactButton.module.css';

interface CompactButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function CompactButton({ href, children }: CompactButtonProps) {
  return (
    <InLink href={href} className={`button button--primary button--sm ${styles.compactButton}`}>
      <span>{children}</span>
    </InLink>
  );
}