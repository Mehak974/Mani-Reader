// frontend/app/about/page.js  —  Server Component (no 'use client')
import AboutContent from './AboutContent';

export const metadata = {
  title: 'About Mani Reader - A Cleaner Manga Reading Experience With Minimal Ads',
  description:
    'Learn about Mani Reader, a manga reading platform created by a manga fan who wanted a cleaner way to read manga, manhwa, and manhua online without excessive advertisements.',
  alternates: {
    canonical: 'https://manireader.online/about',
  },
  keywords: [
    'Mani Reader',
    'about Mani Reader',
    'read manga online',
    'manga reader',
    'manhwa reader',
    'manhua reader',
    'manga reading platform',
    'read manga without ads',
    'best manga reader website',
    'clean manga website',
    'online manga reading experience',
    'manga fan website',
  ],
  openGraph: {
    title: 'About Mani Reader - A Cleaner Manga Reading Experience With Minimal Ads',
    description:
      'Learn about Mani Reader, a manga reading platform created by a manga fan who wanted a cleaner way to read manga, manhwa, and manhua online without excessive advertisements.',
    url: 'https://manireader.online/about',
    siteName: 'Mani Reader',
    type: 'website',
    images: [
      {
        url: 'https://manireader.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mani Reader - A cleaner manga reading platform with minimal ads',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Mani Reader - A Cleaner Manga Reading Experience',
    description:
      'A manga reading platform created by a manga fan for a cleaner way to read manga, manhwa, and manhua online.',
    images: ['https://manireader.online/og-image.png'],
  },
};

// ── Structured Data ──────────────────────────────────────────────────────────

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Mani Reader',
  description:
    'Mani Reader is an online manga reading platform created by a manga fan who wanted a cleaner reading experience with minimal advertisements.',
  url: 'https://manireader.online/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'Mani Reader',
    url: 'https://manireader.online',
    description:
      'Mani Reader is an online manga reading platform for discovering and reading manga, manhwa, and manhua online with a cleaner, reader-focused experience.',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mani Reader',
  url: 'https://manireader.online',
  description:
    'Mani Reader is an online manga reading platform where users can discover, browse, and read manga, manhwa, and manhua online with minimal advertisements.',
  foundingDate: '2024',
  knowsAbout: ['Manga', 'Manhwa', 'Manhua', 'Online Reading', 'Digital Entertainment'],
  sameAs: ['https://manireader.online'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mani Reader',
  url: 'https://manireader.online',
  description:
    'Mani Reader is an online manga reading platform for discovering and reading manga online.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://manireader.online/browse?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://manireader.online' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://manireader.online/about' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader is an online manga reading platform where users can discover, browse, and read manga, manhwa, and manhua online.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why was Mani Reader created?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader was created by a manga fan who wanted a cleaner reading experience without excessive advertisements and distractions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Mani Reader an ad-free manga website?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader focuses on keeping advertisements minimal to provide a cleaner reading experience compared to traditional manga websites.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can users support Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Users can support Mani Reader through the support option, helping maintain servers, improve features, and continue providing a better reading experience.',
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AboutContent />
    </>
  );
}
