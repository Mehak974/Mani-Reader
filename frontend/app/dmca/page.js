// frontend/app/dmca/page.js  —  Server Component
import DMCAContent from './DMCAContent';

export const metadata = {
  title: 'DMCA Copyright Policy - Report Infringement | Mani Reader',
  description:
    'Review the DMCA and copyright infringement reporting policy for Mani Reader. Learn how copyright owners can request content removals and report violations.',
  alternates: {
    canonical: 'https://manireader.online/dmca',
  },
  keywords: [
    'Mani Reader DMCA',
    'DMCA policy',
    'copyright infringement',
    'report copyright',
    'manga removal request',
    'intellectual property',
  ],
};

const dmcaSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'DMCA Copyright Policy',
  description: 'Mani Reader DMCA policy and copyright infringement notification process.',
  url: 'https://manireader.online/dmca',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'DMCA Policy', item: 'https://manireader.online/dmca' },
  ],
};

export default function DMCAPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dmcaSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DMCAContent />
    </>
  );
}
