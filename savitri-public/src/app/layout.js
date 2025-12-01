/**
 * Root Layout
 * Main layout for the entire application
 */

import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'Savitri Shipping - Ferry & Boat Rental Services in Mumbai',
  description: 'Book ferry tickets, rent speed boats and party boats in Mumbai. Affordable and professional water transport services.',
  keywords: 'ferry, boat rental, speed boat, party boat, Mumbai, water transport, Savitri Shipping',
  authors: [{ name: 'Savitri Shipping' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0891b2',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://savitrishipping.in',
    siteName: 'Savitri Shipping',
    title: 'Savitri Shipping - Ferry & Boat Rental Services',
    description: 'Book ferry tickets, rent speed boats and party boats in Mumbai',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Savitri Shipping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Savitri Shipping - Ferry & Boat Rental Services',
    description: 'Book ferry tickets, rent speed boats and party boats in Mumbai',
    images: ['/images/twitter-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>

        {/* Main content */}
        <div id="root">
          {children}
        </div>

        {/* Toast container will be rendered by Toast component */}
        <div id="toast-container" />

        {/* Modal container will be rendered by Modal components */}
        <div id="modal-container" />
      </body>
    </html>
  );
}