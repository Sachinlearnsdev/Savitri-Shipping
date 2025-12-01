/**
 * Privacy Policy Page
 */

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import styles from '../terms/page.module.css';

export const metadata = {
  title: 'Privacy Policy - Savitri Shipping',
  description: 'Privacy policy and data protection information for Savitri Shipping',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <main className={styles.staticPage}>
        <div className="container">
          <div className={styles.content}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last updated: November 2024</p>

            <section className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                Savitri Shipping ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our services and website.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of
                this privacy policy, please do not access our services.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>
                We collect personal information that you voluntarily provide when you:
              </p>
              <ul>
                <li>Register for an account</li>
                <li>Make a booking</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact customer support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p>
                This information may include:
              </p>
              <ul>
                <li>Name and contact information (email, phone number)</li>
                <li>Payment information (processed securely through payment gateways)</li>
                <li>Government-issued identification (for verification purposes)</li>
                <li>Vehicle registration details (for ferry services)</li>
                <li>Booking history and preferences</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <p>
                When you access our services, we automatically collect:
              </p>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, click patterns)</li>
                <li>Location data (with your permission)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. How We Use Your Information</h2>
              <p>
                We use the collected information for:
              </p>
              <ul>
                <li><strong>Service Delivery:</strong> Processing bookings, managing reservations, and providing customer support</li>
                <li><strong>Communication:</strong> Sending booking confirmations, updates, and service notifications</li>
                <li><strong>Payment Processing:</strong> Facilitating secure transactions and preventing fraud</li>
                <li><strong>Personalization:</strong> Customizing your experience and providing relevant recommendations</li>
                <li><strong>Marketing:</strong> Sending promotional offers and newsletters (with your consent)</li>
                <li><strong>Analytics:</strong> Analyzing usage patterns to improve our services</li>
                <li><strong>Legal Compliance:</strong> Meeting regulatory requirements and responding to legal requests</li>
                <li><strong>Safety:</strong> Ensuring passenger safety and security</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>4. Information Sharing and Disclosure</h2>
              <p>
                We may share your information with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Payment processors, SMS/email service providers, and hosting services</li>
                <li><strong>Business Partners:</strong> Vessel operators and port authorities (only necessary information)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
              <p>
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul>
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through PCI-DSS compliant gateways</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure. While we strive
                to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul>
                <li>Remember your preferences and settings</li>
                <li>Authenticate your login sessions</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Deliver targeted advertisements</li>
              </ul>
              <p>
                You can control cookies through your browser settings. However, disabling cookies
                may affect your ability to use certain features of our services.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. Your Privacy Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@savitrishipping.in
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul>
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>
                Booking records are retained for 7 years as required by Indian maritime regulations.
                Account information is retained until you request deletion.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13 years of age. We do not knowingly
                collect personal information from children. If you are a parent or guardian and believe
                your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your
                country of residence. We ensure appropriate safeguards are in place to protect your
                information in accordance with this privacy policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any
                significant changes by posting the new policy on our website and updating the
                "Last updated" date. Your continued use of our services after changes indicates
                acceptance of the updated policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2>12. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our data practices, please contact:
              </p>
              <p>
                <strong>Data Protection Officer</strong><br />
                Email: privacy@savitrishipping.in<br />
                Phone: +91 98765 43210<br />
                Address: Mumbai, Maharashtra, India
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}