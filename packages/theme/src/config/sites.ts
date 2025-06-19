// packages/theme/src/config/sites.ts
export type Site = {
  id:         'portal' | 'isbdm' | 'lrm' | 'fr' | 'isbd' | 'muldicat' | 'unimarc';
  dir:        string;          // folder that contains docusaurus.config.ts
  port:       number;          // dev-server port
  ghPath:     string;          // **must** start & end with "/"
};

export const SITES: Site[] = [
  {id: 'portal',   dir: 'portal',            port: 3000, ghPath: '/standards-dev/'},
  {id: 'isbdm',    dir: 'standards/ISBDM',   port: 3001, ghPath: '/standards-dev/isbdm/'},
  {id: 'lrm',      dir: 'standards/LRM',     port: 3002, ghPath: '/standards-dev/lrm/'},
  {id: 'fr',       dir: 'standards/fr',      port: 3003, ghPath: '/standards-dev/fr/'},
  {id: 'isbd',     dir: 'standards/isbd',    port: 3004, ghPath: '/standards-dev/isbd/'},
  {id: 'muldicat', dir: 'standards/muldicat',port: 3005, ghPath: '/standards-dev/muldicat/'},
  {id: 'unimarc',  dir: 'standards/unimarc', port: 3006, ghPath: '/standards-dev/unimarc/'},
];