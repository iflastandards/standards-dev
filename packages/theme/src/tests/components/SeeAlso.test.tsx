import React from 'react';
import { render, screen } from '@testing-library/react';
import { SeeAlso } from '@ifla/theme/components/SeeAlso';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('SeeAlso Component', () => {
  it('renders with text content', () => {
    render(
      <SeeAlso>
        Related content
      </SeeAlso>
    );
    
    const seeAlsoText = screen.getAllByText((content, element) => {
      return element?.textContent?.startsWith('See also:') ?? false;
    })[0];
    expect(seeAlsoText).toBeInTheDocument();
    
    const content = screen.getByText(/Related content/);
    expect(content).toBeInTheDocument();
  });
  
  it('renders with element content', () => {
    render(
      <SeeAlso>
        <a href="/link">Related content</a>
      </SeeAlso>
    );
    
    const link = screen.getByRole('link', { name: 'Related content' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/link');
  });
  
  it('renders with multiple links', () => {
    render(
      <SeeAlso>
        <a href="/link1">First link</a> and <a href="/link2">Second link</a>
      </SeeAlso>
    );
    
    const firstLink = screen.getByRole('link', { name: 'First link' });
    const secondLink = screen.getByRole('link', { name: 'Second link' });
    
    expect(firstLink).toBeInTheDocument();
    expect(secondLink).toBeInTheDocument();
  });
  
  it('applies additional className when provided', () => {
    render(
      <SeeAlso className="custom-class">
        Related content
      </SeeAlso>
    );
    
    const container = screen.getAllByText((content, element) => {
      return element?.textContent?.startsWith('See also:') ?? false;
    })[0];
    expect(container).not.toBeNull();
    const seeAlsoDiv = document.querySelector('.seeAlso.custom-class');
    expect(seeAlsoDiv).toBeInTheDocument();
    expect(seeAlsoDiv).toHaveClass('custom-class');
  });
  
  it('passes accessibility test', async () => {
    const { container } = render(
      <SeeAlso>
        <a href="/link">Related content</a>
      </SeeAlso>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});