// frontend/app/support/page.js  —  Server Component
import SupportContent from './SupportContent';

export const metadata = {
  title: 'Support Mani Reader - Help Keep Manga Reading Clean & Ad-Light',
  description:
    'Support Mani Reader and help maintain a cleaner manga reading experience with fewer advertisements. Learn how your support helps with servers, development, and future improvements.',
  alternates: {
    canonical: 'https://manireader.online/support',
  },
  keywords: [
    'Support Mani Reader',
    'Mani Reader donation',
    'Mani Reader support',
    'support manga website',
    'donate manga reader',
    'ad free manga reader',
    'manga website without ads',
    'support online manga platform',
    'help maintain manga website',
    'manga reader community',
  ],
  openGraph: {
    title: 'Support Mani Reader - Help Keep Manga Reading Clean & Ad-Light',
    description:
      'Support Mani Reader and help maintain a cleaner manga reading experience with fewer advertisements. Learn how your support helps with servers, development, and future improvements.',
    url: 'https://manireader.online/support',
    siteName: 'Mani Reader',
    type: 'website',
    images: [
      {
        url: 'https://manireader.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Support Mani Reader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support Mani Reader - Keep Reading Clean & Ad-Light',
    description:
      'Support Mani Reader to maintain a cleaner manga reading experience with fewer advertisements.',
    images: ['https://manireader.online/og-image.png'],
  },
};

const webpageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Support Mani Reader',
  description: 'Support Mani Reader and help maintain a cleaner manga reading experience.',
  url: 'https://manireader.online/support',
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
    { '@type': 'ListItem', position: 2, name: 'Support', item: 'https://manireader.online/support' },
  ],
};

export default function SupportPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <SupportContent />
    </>
  );
}
