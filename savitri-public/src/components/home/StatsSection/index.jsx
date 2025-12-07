'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './StatsSection.module.css';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    { value: 500, suffix: '+', label: 'Trips Completed', icon: '🚢' },
    { value: 50, suffix: '+', label: 'Vessels', icon: '⛵' },
    { value: 24, suffix: '/7', label: 'Support', icon: '🕐' },
    { value: 98, suffix: '%', label: 'Happy Customers', icon: '⭐' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.stats}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              isVisible={isVisible}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ value, suffix, label, icon, isVisible, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={styles.iconWrapper}>{icon}</div>
      <div className={styles.value}>
        {count}{suffix}
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

export default StatsSection;