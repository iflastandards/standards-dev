// Portal navbar configuration
export default [
  {
    type: 'docSidebar',
    sidebarId: 'tutorialSidebar',
    position: 'left' as const,
    label: 'Documentation',
  },
  {
    to: '/blog', 
    label: 'Blog', 
    position: 'left' as const,
  },
  {
    to: '/manage',
    label: 'Management',
    position: 'left' as const,
    className: 'navbar__item--management',
  },
];