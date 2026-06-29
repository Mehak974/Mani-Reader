// frontend/app/terms/page.js  —  Server Component
import TermsContent from './TermsContent';

export const metadata = {
  title: 'Terms of Service - Platform Usage Rules | Mani Reader',
  description:
    'Read the Mani Reader terms of service. Learn about our user agreement, acceptance policies, account security, intellectual property rules, and limitation of liability.',
  alternates: {
    canonical: 'https://manireader.online/terms',
  },
  keywords: [
    'Mani Reader terms of service',
    'terms of use',
    'user agreement',
    'platform usage rules',
    'manga website terms',
  ],
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service',
  description: 'User agreement, acceptance terms, and usage guidelines for Mani Reader.',
  url: 'https://manireader.online/terms',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: 'https://manireader.online/terms' },
  ],
};

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <TermsContent />
    </>
  );
}
