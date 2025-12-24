import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>About Savitri Shipping</h1>
        
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Welcome to Savitri Shipping</h2>
            <p>
              Savitri Shipping is your trusted partner for ferry and boat rental services in Mumbai.
              With years of experience in water transportation, we provide safe, reliable, and
              affordable solutions for all your travel needs.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Our Services</h2>
            <p>
              We offer three main services to cater to different customer needs:
            </p>
            <ul>
              <li><strong>Speed Boat Rentals:</strong> Hourly rentals for quick and comfortable water transport</li>
              <li><strong>Party Boat Rentals:</strong> Host memorable events on our spacious barges with custom packages</li>
              <li><strong>Ferry Services:</strong> Regular scheduled services between Mumbai and Mandwa with vehicle transport</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Our Commitment</h2>
            <p>
              Safety is our top priority. All our vessels are regularly inspected and maintained to
              the highest standards. Our experienced crew members are dedicated to ensuring your
              comfort and safety throughout your journey.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Contact Us</h2>
            <p>
              Have questions? We're here to help! Reach out to us at:
            </p>
            <p>
              <strong>Email:</strong> info@savitrishipping.in<br />
              <strong>Phone:</strong> +91 98765 43210<br />
              <strong>Address:</strong> Mumbai, Maharashtra, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}