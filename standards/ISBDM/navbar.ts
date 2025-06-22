// ISBDM navbar configuration
export default [
  {
    type: 'doc',
    docId: 'index',
    label: 'Introduction',
    position: 'left' as const,
  },
  {
    type: 'dropdown',
    label: 'Instructions',
    position: 'left' as const,
    items: [
      {
        type: 'doc',
        docId: 'intro/index',
        label: 'Introduction',
      },
      {
        type: 'doc',
        docId: 'assess/index',
        label: 'Assessment',
      },
      {
        type: 'doc',
        docId: 'glossary/index',
        label: 'Glossary',
      },
      {
        type: 'doc',
        docId: 'fullex/index',
        label: 'Examples',
      },
    ],
  },
  {
    type: 'dropdown',
    label: 'Elements',
    position: 'left' as const,
    items: [
      {
        type: 'doc',
        docId: 'statements/index',
        label: 'Statements',
      },
      {
        type: 'doc',
        docId: 'notes/index',
        label: 'Notes',
      },
      {
        type: 'doc',
        docId: 'attributes/index',
        label: 'Attributes',
      },
      {
        type: 'doc',
        docId: 'relationships/index',
        label: 'Relationships',
      },
    ],
  },
  {
    type: 'dropdown',
    position: 'left' as const,
    label: 'Values',
    items: [
      {
        type: 'doc',
        docId: 'ves/index',
        label: 'Value Vocabularies',
      },
      {
        type: 'doc',
        docId: 'ses/index',
        label: 'String Encodings Schemes',
      },
    ]
  },
  {
    type: 'doc',
    docId: 'manage',
    label: 'Management',
    position: 'left' as const,
    className: 'navbar__item--management',
  },
  {
    type: 'dropdown',
    label: 'About',
    position: 'right' as const,
    items: [
      {
        type: 'doc',
        docId: 'about/index',
        label: 'About ISBDM',
      },
      {
        type: 'doc',
        docId: 'about/docusaurus-for-ifla',
        label: 'Modern Documentation Platform',
      },
    ],
  },
];