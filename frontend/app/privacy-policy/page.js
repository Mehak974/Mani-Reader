// frontend/app/privacy-policy/page.js  —  Server Component
import PrivacyPolicyContent from './PrivacyPolicyContent';

export const metadata = {
  title: 'Mani Reader Privacy Policy - How We Protect Your Information',
  description:
    'Read the Mani Reader Privacy Policy to understand how we collect, use, protect, and manage user information while providing a better manga reading experience.',
  alternates: {
    canonical: 'https://manireader.online/privacy-policy',
  },
  keywords: [
    'Mani Reader privacy policy',
    'manga website privacy policy',
    'manga reader privacy',
    'online manga privacy',
    'website data protection',
    'cookies policy',
    'user information privacy',
    'online reading platform privacy',
  ],
};

const webpageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Mani Reader Privacy Policy',
  description:
    'Privacy policy explaining how Mani Reader collects, uses, and protects user information.',
  url: 'https://manireader.online/privacy-policy',
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
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Privacy Policy',
      item: 'https://manireader.online/privacy-policy',
    },
  ],
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PrivacyPolicyContent />
    </>
  );
}
