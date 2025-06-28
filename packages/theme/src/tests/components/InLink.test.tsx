import React from 'react';
import { render, screen } from '@testing-library/react';
import { InLink } from '@ifla/theme/components/InLink';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock useBaseUrl
vi.mock('@docusaurus/useBaseUrl', () => ({
  default: (url: string) => url.startsWith('/') ? url : `/${url}`,
}));

// Mock Link component
vi.mock('@docusaurus/Link', () => ({
  default: ({ children, to, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe('InLink Component', () => {
  it('renders with required props', () => {
    render(
      <InLink href="/docs/attributes/1277.html">
        has extent of embodied content
      </InLink>
    );

    const link = screen.getByText('has extent of embodied content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/docs/attributes/1277.html');
    expect(link).toHaveClass('linkInline');
  });

  it('processes URLs with useBaseUrl', () => {
    render(
      <InLink href="docs/attributes/1277.html">
        has extent of embodied content
      </InLink>
    );

    const link = screen.getByText('has extent of embodied content');
    expect(link).toHaveAttribute('href', '/docs/attributes/1277.html');
  });

  it('applies only custom className when provided (no default styles)', () => {
    render(
      <InLink href="/docs/attributes/1277.html" className="custom-class">
        has extent of embodied content
      </InLink>
    );

    const link = screen.getByText('has extent of embodied content');
    expect(link).toHaveClass('custom-class');
    expect(link).not.toHaveClass('linkInline'); // linkInline should NOT be present with custom class
    expect(link?.className).not.toMatch(/inLink/); // CSS module class should not be applied
  });

  it('updates rendered class when className prop changes', () => {
    const TestComponent = ({ className }: { className: string }) => (
      <InLink href="/docs/test" className={className}>
        Test Link
      </InLink>
    );

    const { rerender } = render(<TestComponent className="initial-class" />);

    const link = screen.getByText('Test Link');
    expect(link).toHaveClass('initial-class');
    expect(link).not.toHaveClass('updated-class');

    // Change the className prop
    rerender(<TestComponent className="updated-class" />);

    // The component should re-render with the new class
    expect(link).toHaveClass('updated-class');
    expect(link).not.toHaveClass('initial-class');
  });

  it('updates className when multiple props change simultaneously', () => {
    const TestComponent = ({ className, href, children }: { className: string; href: string; children: string }) => (
      <InLink href={href} className={className}>
        {children}
      </InLink>
    );

    const { rerender } = render(
      <TestComponent className="class-one" href="/docs/test1" children="Link One" />
    );

    let link = screen.getByText('Link One');
    expect(link).toHaveClass('class-one');
    expect(link).toHaveAttribute('href', '/docs/test1');

    // Change multiple props including className
    rerender(
      <TestComponent className="class-two" href="/docs/test2" children="Link Two" />
    );

    link = screen.getByText('Link Two');
    expect(link).toHaveClass('class-two');
    expect(link).not.toHaveClass('class-one');
    expect(link).toHaveAttribute('href', '/docs/test2');
  });

  it('handles className changes with smartWrap enabled and disabled', () => {
    const TestComponent = ({ className, smartWrap }: { className: string; smartWrap: boolean }) => (
      <InLink href="/docs/test" className={className} smartWrap={smartWrap}>
        Text with (parentheses)
      </InLink>
    );

    const { rerender } = render(
      <TestComponent className="smart-wrap-class" smartWrap={true} />
    );

    const link = screen.getByText(/Text with.*parentheses/);
    expect(link).toHaveClass('smart-wrap-class');
    expect(link?.className).not.toMatch(/inLink/); // CSS module class not applied with custom className

    // Change className and smartWrap
    rerender(
      <TestComponent className="no-wrap-class" smartWrap={false} />
    );

    expect(link).toHaveClass('no-wrap-class');
    expect(link).not.toHaveClass('smart-wrap-class');
    expect(link?.className).not.toMatch(/inLink/); // CSS module class still not applied
  });

  it('properly manages default vs custom classes when className changes', () => {
    const TestComponent = ({ className }: { className?: string }) => (
      <InLink href="/docs/test" className={className}>
        Test Link
      </InLink>
    );

    const { rerender } = render(<TestComponent className="custom-class" />);

    const link = screen.getByText('Test Link');
    expect(link).not.toHaveClass('linkInline'); // NOT present with custom class
    expect(link).toHaveClass('custom-class');
    expect(link?.className).not.toMatch(/inLink/); // CSS module class not applied

    // Change to different className
    rerender(<TestComponent className="another-class" />);

    expect(link).not.toHaveClass('linkInline'); // Still not present
    expect(link).toHaveClass('another-class');
    expect(link).not.toHaveClass('custom-class');
    expect(link?.className).not.toMatch(/inLink/); // CSS module class still not applied

    // Remove custom className - default styles should now apply
    rerender(<TestComponent />);

    expect(link).toHaveClass('linkInline'); // Now present
    expect(link?.className).toMatch(/inLink/); // CSS module class should now be applied
    expect(link).not.toHaveClass('another-class');
  });

  it('renders with complex children', () => {
    render(
      <InLink href="/docs/attributes/1277.html">
        <span data-testid="child-element">Complex child</span>
      </InLink>
    );

    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();
    expect(childElement.textContent).toBe('Complex child');
  });

  it('preserves href with query parameters', () => {
    render(
      <InLink href="/docs/attributes/1277.html?param=value#section">
        Link with query and hash
      </InLink>
    );

    const link = screen.getByText('Link with query and hash');
    expect(link).toHaveAttribute('href', '/docs/attributes/1277.html?param=value#section');
  });

  describe('Smart wrapping functionality', () => {
    it('adds zero-width spaces before parentheses by default', () => {
      const { container } = render(
        <InLink href="/example">
          Catalogue of shipwrecked books (2018; William Collins; volume; case binding)
        </InLink>
      );

      const link = container.querySelector('a');
      // The text should contain zero-width spaces before parentheses
      expect(link?.textContent).toContain('\u200B(');
      // Visual text should remain the same
      expect(link?.textContent?.replace(/\u200B/g, '')).toBe(
        'Catalogue of shipwrecked books (2018; William Collins; volume; case binding)'
      );
    });

    it('handles multiple parentheses in text', () => {
      const { container } = render(
        <InLink href="/example">
          Example text (first) and more (second) content
        </InLink>
      );

      const link = container.querySelector('a');
      const textContent = link?.textContent || '';
      // Count zero-width spaces - should be 2 (one before each parenthesis)
      const zwsCount = (textContent.match(/\u200B/g) || []).length;
      expect(zwsCount).toBe(2);
    });

    it('processes text within nested elements', () => {
      const { container } = render(
        <InLink href="/example">
          <span>Text with (parentheses) inside</span>
        </InLink>
      );

      const span = container.querySelector('span');
      expect(span?.textContent).toContain('\u200B(');
    });

    it('does not add zero-width spaces when smartWrap is false', () => {
      const { container } = render(
        <InLink href="/example" smartWrap={false}>
          Text with (parentheses) inside
        </InLink>
      );

      const link = container.querySelector('a');
      expect(link?.textContent).not.toContain('\u200B');
      expect(link?.textContent).toBe('Text with (parentheses) inside');
    });

    it('preserves text with no parentheses unchanged', () => {
      const { container } = render(
        <InLink href="/example">
          Text without any parentheses
        </InLink>
      );

      const link = container.querySelector('a');
      expect(link?.textContent).toBe('Text without any parentheses');
      expect(link?.textContent).not.toContain('\u200B');
    });

    it('handles empty parentheses correctly', () => {
      const { container } = render(
        <InLink href="/example">
          Text with empty () parentheses
        </InLink>
      );

      const link = container.querySelector('a');
      expect(link?.textContent).toBe('Text with empty \u200B() parentheses');
    });

    it('works with mixed content including text and elements', () => {
      const { container } = render(
        <InLink href="/example">
          Start text (with parens) <em>emphasized (text)</em> end
        </InLink>
      );

      const link = container.querySelector('a');
      const textContent = link?.textContent || '';
      // Should have 2 zero-width spaces
      const zwsCount = (textContent.match(/\u200B/g) || []).length;
      expect(zwsCount).toBe(2);

      // Check that emphasized text is preserved
      const em = container.querySelector('em');
      expect(em).toBeInTheDocument();
      expect(em?.textContent).toContain('\u200B(');
    });
  });

  it('applies correct CSS module classes when no custom className provided', () => {
    const { container } = render(
      <InLink href="/test">Test Link</InLink>
    );

    const link = container.querySelector('a');
    expect(link?.className).toMatch(/inLink/);
    expect(link).toHaveClass('linkInline');
  });

  it('passes accessibility tests', async () => {
    const { container } = render(
      <InLink href="/docs/attributes/1277.html">
        Accessible Link
      </InLink>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes accessibility tests with smart wrapping', async () => {
    const { container } = render(
      <InLink href="/docs/example">
        Catalogue of shipwrecked books (2018; William Collins; volume; case binding)
      </InLink>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
