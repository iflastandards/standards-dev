import React from 'react';
export default function CodeBlock({ children, language }: { children: any; language: any }) {
  return (
    <pre data-testid={`codeblock-${language || 'unknown'}`}>
      <code>{children}</code>
    </pre>
  );
} 