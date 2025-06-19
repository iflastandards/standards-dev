import React from 'react';

export default function Heading({ as: Tag = 'h1', children, ...props }: { as?: any; children: any; [key: string]: any }) {
  return <Tag {...props}>{children}</Tag>;
}