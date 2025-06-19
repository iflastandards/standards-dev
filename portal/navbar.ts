// Portal navbar configuration
export default [
  {
    type: 'docSidebar',
    sidebarId: 'tutorialSidebar',
    position: 'left',
    label: 'Documentation',
  },
  {
    to: '/blog', 
    label: 'Blog', 
    position: 'left'
  },
  {
    to: '/manage',
    label: 'Management',
    position: 'left',
    className: 'navbar__item--management',
  },
];