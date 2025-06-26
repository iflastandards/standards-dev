import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/newtest/search',
    component: ComponentCreator('/newtest/search', '748'),
    exact: true
  },
  {
    path: '/newtest/docs',
    component: ComponentCreator('/newtest/docs', '655'),
    routes: [
      {
        path: '/newtest/docs',
        component: ComponentCreator('/newtest/docs', '786'),
        routes: [
          {
            path: '/newtest/docs',
            component: ComponentCreator('/newtest/docs', '6de'),
            routes: [
              {
                path: '/newtest/docs/getting-started/overview',
                component: ComponentCreator('/newtest/docs/getting-started/overview', '32c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/newtest/docs/intro',
                component: ComponentCreator('/newtest/docs/intro', '104'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
