/**
 * 404 Not Found Page
 */

import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.code}>404</h1>
          <h2 className={styles.title}>Page Not Found</h2>
          <p className={styles.description}>
            Sorry, we couldn't find the page you're looking for.
            <br />
            The page might have been moved or deleted.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.buttonPrimary}>
              Go to Home
            </Link>
            <Link href="/contact" className={styles.buttonSecondary}>
              Contact Support
            </Link>
          </div>
        </div>
        
        <div className={styles.illustration}>
          <svg
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svg}
          >
            {/* Boat illustration */}
            <path
              d="M100 150 L150 120 L250 120 L300 150 L280 180 L120 180 Z"
              fill="var(--color-primary)"
              opacity="0.2"
            />
            <path
              d="M150 120 L200 80 L250 120"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Waves */}
            <path
              d="M50 200 Q70 190 90 200 T130 200 T170 200 T210 200 T250 200 T290 200 T330 200 T370 200"
              stroke="var(--color-primary)"
              strokeWidth="2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M30 220 Q50 210 70 220 T110 220 T150 220 T190 220 T230 220 T270 220 T310 220 T350 220"
              stroke="var(--color-primary)"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}