// frontend/app/contact/page.js  —  Server Component
import ContactContent from './ContactContent';

export const metadata = {
  title: 'Contact Mani Reader - Support, Feedback & Manga Website Assistance',
  description:
    'Contact Mani Reader for support, feedback, suggestions, and website-related questions. Get help with manga reading issues, account features, and platform concerns.',
  alternates: {
    canonical: 'https://manireader.online/contact',
  },
  keywords: [
    'Mani Reader contact',
    'contact Mani Reader',
    'Mani Reader support',
    'manga reader support',
    'manga website contact',
    'manga website help',
    'report manga issue',
    'manga reader feedback',
    'copyright contact',
    'website support',
  ],
  openGraph: {
    title: 'Contact Mani Reader - Support, Feedback & Manga Website Assistance',
    description:
      'Contact Mani Reader for support, feedback, suggestions, and website-related questions. Get help with manga reading issues, account features, and platform concerns.',
    url: 'https://manireader.online/contact',
    siteName: 'Mani Reader',
    type: 'website',
    images: [
      {
        url: 'https://manireader.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact Mani Reader for support and feedback',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Mani Reader - Support, Feedback & Manga Assistance',
    description:
      'Reach the Mani Reader team for support, feature suggestions, bug reports, and copyright inquiries.',
    images: ['https://manireader.online/og-image.png'],
  },
};

const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Mani Reader',
  description: 'Contact Mani Reader for support, feedback, technical issues, and website-related questions.',
  url: 'https://manireader.online/contact',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mani Reader',
  url: 'https://manireader.online',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://manireader.online/contact',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://manireader.online/contact' },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ContactContent />
    </>
  );
}
