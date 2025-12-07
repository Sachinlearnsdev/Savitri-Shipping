/**
 * HowItWorks Component - FIXED
 * Save as: src/components/home/HowItWorks/index.jsx
 */
'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './HowItWorks.module.css';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const steps = [
    {
      id: 1,
      icon: '🔍',
      title: 'Choose Your Service',
      description: 'Browse our speed boats, party boats, or ferry services. Select the perfect option for your journey.',
      color: '#0A7EA4',
    },
    {
      id: 2,
      icon: '📅',
      title: 'Book & Pay',
      description: 'Pick your date, time, and destination. Secure payment through our trusted gateway.',
      color: '#F97316',
    },
    {
      id: 3,
      icon: '✨',
      title: 'Enjoy Your Journey',
      description: 'Arrive at the dock, meet our professional crew, and enjoy a comfortable ride across Mumbai waters.',
      color: '#10b981',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Auto-cycle through steps
          const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
          }, 3000);
          return () => clearInterval(interval);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <section ref={sectionRef} className={styles.howItWorks}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>How It Works</h2>
          <p className={styles.subtitle}>Book your water journey in 3 simple steps</p>
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.step} ${index <= activeStep && isVisible ? styles.active : ''}`}
              onClick={() => setActiveStep(index)}
            >
              {/* Step Number */}
              <div 
                className={styles.stepNumber}
                style={{ 
                  background: index <= activeStep ? step.color : 'var(--color-gray-300)',
                }}
              >
                {index + 1}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={styles.connector}>
                  <div 
                    className={styles.connectorProgress}
                    style={{
                      width: index < activeStep ? '100%' : '0%',
                      background: step.color,
                    }}
                  />
                </div>
              )}

              {/* Step Card */}
              <div className={styles.card}>
                <div 
                  className={styles.iconWrapper}
                  style={{ background: `${step.color}15` }}
                >
                  <span className={styles.icon}>{step.icon}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className={styles.progressIndicator}>
          {steps.map((_, index) => (
            <button
              key={index}
              className={`${styles.progressDot} ${index === activeStep ? styles.activeDot : ''}`}
              onClick={() => setActiveStep(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;