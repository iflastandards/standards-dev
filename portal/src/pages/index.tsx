import type {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Hero from '../components/Hero';
import HomepageFeatures from '../components/HomepageFeatures';

export default function Home(): ReactNode {
  const {siteConfig: _siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`IFLA Standards Portal`}
      description="Access authoritative bibliographic standards developed by the International Federation of Library Associations and Institutions">
      <Hero />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
