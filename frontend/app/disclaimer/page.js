// frontend/app/disclaimer/page.js  —  Server Component
import DisclaimerContent from './DisclaimerContent';

export const metadata = {
  title: 'Mani Reader Disclaimer - Legal Information & Content Notice',
  description:
    'Read the Mani Reader legal disclaimer to understand content ownership, third-party sources, copyright information, and platform responsibilities.',
  alternates: {
    canonical: 'https://manireader.online/disclaimer',
  },
  keywords: [
    'Mani Reader disclaimer',
    'manga website disclaimer',
    'manga copyright information',
    'manga reader legal notice',
    'online manga platform disclaimer',
    'manga content ownership',
    'copyright notice',
    'DMCA manga website',
    'third party content',
  ],
};

const webpageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Mani Reader Legal Disclaimer',
  description: 'Legal disclaimer explaining content ownership, copyright information, and platform responsibilities.',
  url: 'https://manireader.online/disclaimer',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mani Reader',
  url: 'https://manireader.online',
  description: 'Community supported online manga reading platform.',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'Legal Disclaimer', item: 'https://manireader.online/disclaimer' },
  ],
};

export default function DisclaimerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <DisclaimerContent />
    </>
  );
}
