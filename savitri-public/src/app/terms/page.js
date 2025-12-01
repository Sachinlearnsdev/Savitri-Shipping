/**
 * Terms & Conditions Page
 */

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import styles from './page.module.css';

export const metadata = {
  title: 'Terms & Conditions - Savitri Shipping',
  description: 'Terms and conditions for using Savitri Shipping services',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <main className={styles.staticPage}>
        <div className="container">
          <div className={styles.content}>
            <h1 className={styles.title}>Terms & Conditions</h1>
            <p className={styles.lastUpdated}>Last updated: November 2024</p>

            <section className={styles.section}>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Savitri Shipping services, you accept and agree to be bound
                by the terms and provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Service Description</h2>
              <p>
                Savitri Shipping provides water transport services including:
              </p>
              <ul>
                <li>Speed boat rentals by the hour</li>
                <li>Party boat bookings for events</li>
                <li>Regular ferry services across Mumbai routes</li>
              </ul>
              <p>
                All services are subject to availability and weather conditions.
              </p>
            </section>

            <section className={styles.section}>
              <h2>3. Booking and Payment</h2>
              <p>
                <strong>Booking Confirmation:</strong> All bookings must be confirmed through our
                official website or authorized channels. A booking is confirmed only after payment
                is received.
              </p>
              <p>
                <strong>Payment Methods:</strong> We accept various payment methods including
                credit/debit cards, UPI, and net banking. All payments are processed securely.
              </p>
              <p>
                <strong>Pricing:</strong> All prices are in Indian Rupees (INR) and include applicable
                taxes unless stated otherwise. Prices may vary based on season and demand.
              </p>
            </section>

            <section className={styles.section}>
              <h2>4. Cancellation and Refund Policy</h2>
              <p>
                <strong>Speed Boat Rentals:</strong>
              </p>
              <ul>
                <li>Free cancellation: Up to 24 hours before departure</li>
                <li>50% refund: 12-24 hours before departure</li>
                <li>No refund: Less than 12 hours before departure</li>
              </ul>
              <p>
                <strong>Party Boat Bookings:</strong>
              </p>
              <ul>
                <li>Free cancellation: Up to 7 days before event</li>
                <li>50% refund: 3-7 days before event</li>
                <li>No refund: Less than 3 days before event</li>
              </ul>
              <p>
                <strong>Ferry Services:</strong>
              </p>
              <ul>
                <li>Free cancellation: Up to 24 hours before departure</li>
                <li>50% refund: 6-24 hours before departure</li>
                <li>No refund: Less than 6 hours before departure</li>
              </ul>
              <p>
                Refunds will be processed within 7-10 business days to the original payment method.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Passenger Responsibilities</h2>
              <p>
                Passengers must:
              </p>
              <ul>
                <li>Arrive at the departure point at least 15 minutes before scheduled time</li>
                <li>Carry valid identification documents</li>
                <li>Follow all safety instructions provided by the crew</li>
                <li>Not carry prohibited items (weapons, explosives, illegal substances)</li>
                <li>Be responsible for their personal belongings</li>
                <li>Not be under the influence of alcohol or drugs</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>6. Safety and Liability</h2>
              <p>
                <strong>Safety Measures:</strong> We maintain all vessels according to maritime
                safety standards and provide life jackets for all passengers.
              </p>
              <p>
                <strong>Weather Conditions:</strong> Services may be suspended or delayed due to
                adverse weather conditions. In such cases, passengers will be offered alternative
                dates or full refunds.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> Savitri Shipping is not liable for any
                injuries, losses, or damages resulting from circumstances beyond our reasonable control.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. Vehicle Transport (Ferry Services)</h2>
              <p>
                For ferry services with vehicle transport:
              </p>
              <ul>
                <li>Vehicles must be in roadworthy condition</li>
                <li>Valid vehicle registration and insurance documents required</li>
                <li>Passengers are responsible for securing their vehicles</li>
                <li>Additional charges apply based on vehicle type</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>8. Children and Minors</h2>
              <p>
                Children under 12 must be accompanied by an adult. Infant passengers (under 2 years)
                travel free but must be properly supervised at all times.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Force Majeure</h2>
              <p>
                We shall not be liable for any failure to perform our obligations due to circumstances
                beyond our reasonable control, including but not limited to acts of God, natural
                disasters, strikes, wars, or government actions.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. Amendments</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective
                immediately upon posting on our website. Continued use of our services constitutes
                acceptance of modified terms.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India.
                Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai,
                Maharashtra.
              </p>
            </section>

            <section className={styles.section}>
              <h2>12. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> legal@savitrishipping.in<br />
                <strong>Phone:</strong> +91 98765 43210<br />
                <strong>Address:</strong> Mumbai, Maharashtra, India
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}