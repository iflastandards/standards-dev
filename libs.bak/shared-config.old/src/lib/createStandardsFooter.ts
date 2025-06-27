export interface StandardsFooterOptions {
  githubUrl: string;
  includeRdfDownloads?: boolean;
  includeSitemap?: boolean;
  customCopyright?: string;
  includeBlog?: boolean;
}

/**
 * Factory function to create standardized footer for IFLA standards sites
 * This is a pure function that returns consistent footer configuration
 */
export function createStandardsFooter(options: StandardsFooterOptions) {
  const {
    githubUrl,
    includeRdfDownloads = true,
    includeSitemap = true,
    includeBlog = true,
    customCopyright,
  } = options;

  const resourcesItems = [];
  if (includeRdfDownloads) {
    resourcesItems.push({
      label: 'RDF Downloads',
      to: '/rdf/',
    });
  }
  if (includeSitemap) {
    resourcesItems.push({
      label: 'Sitemap',
      to: '/sitemap',
    });
  }

  const moreItems = [];
  if (includeBlog) {
    moreItems.push({
      label: 'Blog',
      to: '/blog',
    });
  }
  moreItems.push({
    label: 'GitHub',
    href: githubUrl,
  });

  const footerLinks = [];

  if (resourcesItems.length > 0) {
    footerLinks.push({
      title: 'Resources',
      items: resourcesItems,
    });
  }

  footerLinks.push(
    {
      title: 'Community',
      items: [
        {
          label: 'IFLA Website',
          href: 'https://www.ifla.org/',
        },
        {
          label: 'IFLA Standards',
          href: 'https://www.ifla.org/programmes/ifla-standards/',
        },
      ],
    },
    {
      title: 'More',
      items: moreItems,
    }
  );

  const footer = {
    style: 'dark' as const,
    links: footerLinks,
    copyright:
      customCopyright ??
      `
      Copyright © ${new Date().getFullYear()} International Federation of Library Associations and Institutions (IFLA)<br />
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
        <img src="img/cc0_by.png" alt="CC BY 4.0" style="vertical-align:middle; height:24px;" />
      </a>
      Gordon Dunsire and Mirna Willer (Main design and content editors).
    `,
  } as const;

  return Object.freeze(footer);
}
