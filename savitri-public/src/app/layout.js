import { Inter, Poppins } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'Savitri Shipping - Ferry & Boat Rental Services',
  description: 'Book ferry tickets, rent speed boats and party boats in Mumbai. Safe, reliable, and affordable transportation solutions.',
  keywords: 'ferry booking, boat rental, Mumbai ferry, speed boat, party boat, water transport',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Header />
        <MobileMenu />
        <main>{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}