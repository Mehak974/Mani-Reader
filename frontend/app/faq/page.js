// frontend/app/faq/page.js  —  Server Component (no 'use client')
import FAQContent from './FAQContent';

export const metadata = {
  title: 'Mani Reader FAQ - Read Manga Online, Features, Updates & Help',
  description:
    'Find answers about Mani Reader, a manga reading platform for discovering and reading manga online. Learn about manga search, genres, updates, mobile reading, accounts, and features.',
  alternates: {
    canonical: 'https://manireader.online/faq',
  },
  keywords: [
    'Mani Reader',
    'Mani Reader FAQ',
    'read manga online',
    'manga reader online',
    'free manga website',
    'online manga reader',
    'latest manga updates',
    'manga reading website',
    'best manga reader',
    'action manga online',
    'fantasy manga online',
    'romance manga online',
    'manga chapters',
    'manga collection',
    'read manga on mobile',
  ],
  openGraph: {
    title: 'Mani Reader FAQ - Read Manga Online, Features, Updates & Help',
    description:
      'Find answers about Mani Reader, a manga reading platform for discovering and reading manga online. Learn about manga search, genres, updates, mobile reading, accounts, and features.',
    url: 'https://manireader.online/faq',
    siteName: 'Mani Reader',
    type: 'website',
    images: [
      {
        url: 'https://manireader.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mani Reader - Online Manga Reading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mani Reader FAQ - Read Manga Online, Features, Updates & Help',
    description:
      'Find answers about Mani Reader, a manga reading platform for discovering and reading manga online.',
    images: ['https://manireader.online/og-image.png'],
  },
};

// ── Structured Data (JSON-LD) ────────────────────────────────────────────────

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // About Mani Reader
    {
      '@type': 'Question',
      name: 'What is Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader is an online manga reading platform where users can discover, browse, and read manga from multiple genres through a web browser. It provides an organized manga library with features including manga search, popular manga collections, recently added manga, genre browsing, and chapter-based reading.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the purpose of Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The purpose of Mani Reader is to make manga discovery and reading easier by providing a simple platform where users can find manga titles, explore categories, and continue reading their favorite series.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is Mani Reader made for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader is designed for manga readers who want easy manga discovery, organized manga categories, quick chapter access, mobile-friendly reading, and a simple browsing experience.',
      },
    },
    // Reading
    {
      '@type': 'Question',
      name: 'How do I read manga on Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To read manga on Mani Reader: (1) Search for a manga title. (2) Open the manga details page. (3) Select a chapter. (4) Start reading through the manga reader. No additional software installation is required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I read manga online for free on Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Mani Reader provides free access to manga browsing and available reading features. Users can explore manga collections, search titles, and read available chapters through the website.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I read manga on my phone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Mani Reader supports mobile manga reading and is designed to work on Android devices, iPhones, tablets, and desktop computers. The interface automatically adjusts for different screen sizes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Mani Reader require an app?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Mani Reader can be accessed directly through a web browser without downloading an application.',
      },
    },
    // Library
    {
      '@type': 'Question',
      name: 'What types of manga are available on Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader includes manga from multiple genres: Action, Adventure, Fantasy, Romance, Comedy, Drama, Horror, Mystery, Thriller, Supernatural, Sports, Historical, and Science Fiction.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I find manga on Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Users can find manga using the search bar, genre categories, popular manga section, recently added section, and manga recommendations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Mani Reader have popular manga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Mani Reader includes popular manga collections that help users discover trending and widely read manga titles including trending series, reader favorites, and highly searched manga.',
      },
    },
    // Updates
    {
      '@type': 'Question',
      name: 'How often does Mani Reader update manga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Manga updates depend on available releases and source availability. When new manga information or chapters become available, updates may appear in the relevant manga sections.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is my favorite manga missing new chapters?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Possible reasons include: the chapter has not been released yet, the manga has an irregular release schedule, or updated information is not available yet.',
      },
    },
    // Account
    {
      '@type': 'Question',
      name: 'Do I need an account to use Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No account is required for basic browsing and reading. An account may provide additional features such as favorites, reading history, manga tracking, and personal lists.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I save my favorite manga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If bookmarking features are enabled, users can save manga titles for easier access later.',
      },
    },
    // Technical
    {
      '@type': 'Question',
      name: 'Why is Mani Reader not loading?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Common causes include internet connection problems, browser cache issues, or temporary service problems. Solutions: refresh the page, clear browser cache, update the browser, or try another network.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which browsers support Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mani Reader works with modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.',
      },
    },
    // Copyright
    {
      '@type': 'Question',
      name: 'Does Mani Reader create manga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Manga is created and owned by original authors, artists, publishers, and copyright holders. Mani Reader functions as a manga discovery and reading platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who owns manga content?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Manga ownership belongs to the respective creators, publishers, and copyright owners.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can copyright owners contact Mani Reader?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Copyright-related requests can be submitted through the official contact channels available on Mani Reader.',
      },
    },
  ],
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mani Reader',
  url: 'https://manireader.online',
  description:
    'Mani Reader is an online manga reading platform where users can discover, browse, and read manga from different genres.',
  sameAs: ['https://manireader.online'],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://manireader.online',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'FAQ',
      item: 'https://manireader.online/faq',
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Client UI */}
      <FAQContent />
    </>
  );
}
