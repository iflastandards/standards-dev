import React from 'react';
export default function TabItem({ label, value, children }: { label: any; value: any; children: any }) {
  return (
    <div data-testid={`tab-${value || label?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}`}>
      <div>{label}</div>
      <div>{children}</div>
    </div>
  );
} 