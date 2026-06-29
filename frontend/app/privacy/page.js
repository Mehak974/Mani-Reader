// frontend/app/privacy/page.js
// Redirect the old /privacy URL to the canonical /privacy-policy page
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mani Reader Privacy Policy - How We Protect Your Information',
  alternates: {
    canonical: 'https://manireader.online/privacy-policy',
  },
};

export default function PrivacyRedirectPage() {
  redirect('/privacy-policy');
}
