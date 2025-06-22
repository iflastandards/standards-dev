import React from 'react';
export default function CodeBlock({ children, language, 'data-testid': dataTestId, ...props }: { children: any; language: any; 'data-testid'?: string; [key: string]: any }) {
  return (
    <pre data-testid={dataTestId || `codeblock-${language || 'unknown'}`} {...props}>
      <code>{children}</code>
    </pre>
  );
} 