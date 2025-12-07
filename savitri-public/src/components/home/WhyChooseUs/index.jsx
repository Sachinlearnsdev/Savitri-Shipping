/**
 * WhyChooseUs Component - NEW
 * Save as: src/components/home/WhyChooseUs/index.jsx
 */
'use client';
import styles from './WhyChooseUs.module.css';

const WhyChooseUs = () => {
  const reasons = [
    {
      id: 1,
      icon: '✓',
      title: 'Safe & Secure',
      description: 'All vessels certified and equipped with safety equipment',
      color: '#0A7EA4',
    },
    {
      id: 2,
      icon: '⭐',
      title: 'Affordable Prices',
      description: 'Competitive rates with no hidden charges',
      color: '#F97316',
    },
    {
      id: 3,
      icon: '🕐',
      title: '24/7 Available',
      description: 'Round-the-clock service for your convenience',
      color: '#10b981',
    },
    {
      id: 4,
      icon: '👨‍✈️',
      title: 'Expert Crew',
      description: 'Professional and experienced captains',
      color: '#8b5cf6',
    },
    {
      id: 5,
      icon: '📱',
      title: 'Easy Booking',
      description: 'Simple online booking process',
      color: '#ec4899',
    },
  ];

  return (
    <section className={styles.whyChooseUs}>
      {/* Background Decorations */}
      <div className={styles.bgShapes}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Why Sail With Savitri?</h2>
          <p className={styles.subtitle}>Experience the difference with Mumbai's trusted water transport service</p>
        </div>

        {/* Reasons Grid */}
        <div className={styles.grid}>
          {reasons.map((reason, index) => (
            <div 
              key={reason.id} 
              className={styles.card}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className={styles.iconWrapper}
                style={{ background: `${reason.color}15`, color: reason.color }}
              >
                <span className={styles.icon}>{reason.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{reason.title}</h3>
              <p className={styles.description}>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;