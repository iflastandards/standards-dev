import React from 'react';
import { render, screen } from '@testing-library/react';
import { OutLink } from '@ifla/theme/components/OutLink';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('OutLink Component', () => {
  it('renders with required props', () => {
    render(
      <OutLink href="https://example.com">
        Example Link
      </OutLink>
    );
    
    const link = screen.getByText('Example Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Should have external icon
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });
  
  it('renders internal link correctly', () => {
    render(
      <OutLink href="/docs/page" external={false}>
        Internal Link
      </OutLink>
    );
    
    const link = screen.getByText('Internal Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/docs/page');
    
    // Should not have target="_blank", rel attributes, or icon
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).not.toBeInTheDocument();
  });
  
  it('handles external prop override', () => {
    render(
      <OutLink href="/docs/page" external={true}>
        Forced External
      </OutLink>
    );
    
    const link = screen.getByText('Forced External');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/docs/page');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Should have external icon
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });
  
  it('processes internal links with useBaseUrl', () => {
    render(
      <OutLink href="docs/page" external={false}>
        Processed Internal Link
      </OutLink>
    );
    
    const link = screen.getByText('Processed Internal Link');
    expect(link).toHaveAttribute('href', '/docs/page');
  });
  
  it('adds proper accessibility attributes for external links', () => {
    render(
      <OutLink href="https://example.com">
        External Link
      </OutLink>
    );
    
    const link = screen.getByText('External Link');
    expect(link).toHaveAttribute('aria-label', 'External Link (opens in a new tab)');
    
    // Icon should be hidden from screen readers
    const iconContainer = document.querySelector('span[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });
  
  it('applies additional className when provided', () => {
    render(
      <OutLink href="https://example.com" className="custom-class">
        With Custom Class
      </OutLink>
    );
    
    const link = screen.getByText('With Custom Class');
    expect(link).toHaveClass('custom-class');
  });
  
  it('auto-detects external URLs', () => {
    // Various forms of external URLs
    const externalUrls = [
      'https://example.com',
      'http://example.com',
      'www.example.com',
      'example.com/page',
    ];
    
    externalUrls.forEach(url => {
      const { unmount } = render(
        <OutLink href={url}>
          Link to {url}
        </OutLink>
      );
      
      const link = screen.getByText(`Link to ${url}`);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      
      unmount();
    });
  });
  
  it('passes accessibility tests', async () => {
    const { container } = render(
      <OutLink href="https://example.com">
        Accessible Link
      </OutLink>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});