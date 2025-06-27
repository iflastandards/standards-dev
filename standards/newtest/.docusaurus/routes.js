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
    component: ComponentCreator('/newtest/docs', '3fe'),
    routes: [
      {
        path: '/newtest/docs',
        component: ComponentCreator('/newtest/docs', '03a'),
        routes: [
          {
            path: '/newtest/docs',
            component: ComponentCreator('/newtest/docs', 'c15'),
            routes: [
              {
                path: '/newtest/docs/getting-started/overview',
                component: ComponentCreator('/newtest/docs/getting-started/overview', '6cc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/newtest/docs/intro',
                component: ComponentCreator('/newtest/docs/intro', 'a11'),
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
