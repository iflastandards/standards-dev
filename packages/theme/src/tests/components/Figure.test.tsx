import React from 'react';
import { render, screen } from '@testing-library/react';
import { Figure } from '@ifla/theme/components/Figure';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Figure Component', () => {
  it('renders with required props', () => {
    render(
      <Figure 
        src="/img/test.png" 
        caption="Test Caption" 
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/test.png');
    expect(img).toHaveAttribute('alt', 'Test Caption');
    
    const caption = screen.getByText('Test Caption');
    expect(caption).toBeInTheDocument();
    
    // Should not render expand link
    const expandLink = screen.queryByText('[Expand image]');
    expect(expandLink).not.toBeInTheDocument();
  });
  
  it('renders with all props', () => {
    render(
      <Figure 
        src="/img/test.png" 
        caption="Test Caption" 
        alt="Custom alt text"
        expandLink="/img/test-full.png"
        expandText="[View full image]"
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img/test.png');
    expect(img).toHaveAttribute('alt', 'Custom alt text');
    
    const caption = screen.getByText('Test Caption');
    expect(caption).toBeInTheDocument();
    
    const expandLink = screen.getByText('[View full image]');
    expect(expandLink).toBeInTheDocument();
    expect(expandLink).toHaveAttribute('href', '/img/test-full.png');
  });
  
  it('processes image paths with useBaseUrl', () => {
    render(
      <Figure 
        src="img/relative-path.png" 
        caption="Test Caption" 
        expandLink="img/relative-path-full.png"
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img/relative-path.png');
    
    const expandLink = screen.getByText('[Expand image]');
    expect(expandLink).toHaveAttribute('href', '/img/relative-path-full.png');
  });
  
  it('has proper ARIA attributes for accessibility', () => {
    render(
      <Figure 
        src="/img/test.png" 
        caption="Test Caption" 
        expandLink="/img/test-full.png"
      />
    );
    
    // Group role with aria-labelledby
    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-labelledby');
    
    // Caption ID matches the aria-labelledby value
    const labelId = group.getAttribute('aria-labelledby');
    const caption = screen.getByText('Test Caption');
    expect(caption).toHaveAttribute('id', labelId);
    
    // Expand link has proper aria-label
    const expandLink = screen.getByText('[Expand image]');
    expect(expandLink).toHaveAttribute('aria-label', 'Expand image - view full size Test Caption');
  });
  
  it('passes accessibility test', async () => {
    const { container } = render(
      <Figure 
        src="/img/test.png" 
        caption="Test Caption" 
        expandLink="/img/test-full.png"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('handles missing alt text by using caption', () => {
    render(
      <Figure 
        src="/img/test.png" 
        caption="Test Caption" 
      />
    );
    
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test Caption');
  });
});