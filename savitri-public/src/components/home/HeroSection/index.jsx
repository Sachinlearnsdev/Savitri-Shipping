/**
 * HeroSection Component
 * Main hero banner on homepage
 */

'use client';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      
      <div className={styles.content}>
        <div className="container">
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              Your Journey Across
              <span className={styles.highlight}> Mumbai Waters</span>
            </h1>
            
            <p className={styles.description}>
              Book ferry tickets, rent speed boats, and party boats. 
              Professional service, affordable prices, available 24/7.
            </p>

            <div className={styles.actions}>
              <Button
                size="lg"
                onClick={() => router.push('/speed-boats')}
                rightIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10H16M16 10L10 4M16 10L10 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                Book Now
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/about')}
              >
                Learn More
              </Button>
            </div>

            {/* Quick Stats */}
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>500+</div>
                <div className={styles.statLabel}>Happy Customers</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>50+</div>
                <div className={styles.statLabel}>Vessels</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>24/7</div>
                <div className={styles.statLabel}>Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated waves */}
      <div className={styles.waves}>
        <svg
          className={styles.wave}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--bg-primary)"
            fillOpacity="0.3"
            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,181.3C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className={`${styles.wave} ${styles.wave2}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--bg-primary)"
            fillOpacity="0.5"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,181.3C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className={`${styles.wave} ${styles.wave3}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--bg-primary)"
            d="M0,256L48,250.7C96,245,192,235,288,229.3C384,224,480,224,576,234.7C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;