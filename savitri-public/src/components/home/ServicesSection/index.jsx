/**
 * ServicesSection Component - Using Regular Button
 * Save as: src/components/home/ServicesSection/index.jsx
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import styles from './ServicesSection.module.css';

const ServicesSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const services = [
    {
      id: 1,
      icon: '⚡',
      title: 'Speed Boats',
      description: 'Lightning-fast travel across Mumbai waters. Perfect for quick trips and urgent commutes.',
      features: ['Hourly Rental', 'Quick Trips', 'Professional Crew', 'Life Jackets'],
      price: 'From ₹2,500/hr',
      link: '/speed-boats',
      gradient: 'linear-gradient(135deg, #0A7EA4 0%, #2D5F7F 100%)',
      color: '#0A7EA4',
    },
    {
      id: 2,
      icon: '🎉',
      title: 'Party Boats',
      description: 'Celebrate your special moments on water. Perfect for birthdays, anniversaries, and corporate events.',
      features: ['Event Hosting', 'Music System', 'Catering Available', 'Customizable'],
      price: 'From ₹15,000/event',
      link: '/party-boats',
      gradient: 'linear-gradient(135deg, #F97316 0%, #ea580c 100%)',
      color: '#F97316',
    },
    {
      id: 3,
      icon: '⛴️',
      title: 'Ferry Services',
      description: 'Regular ferry routes across Mumbai. Vehicle transport available. Affordable and eco-friendly.',
      features: ['Daily Routes', 'Vehicle Transport', 'Affordable', 'Reliable'],
      price: 'From ₹50/trip',
      link: '/ferry',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#10b981',
    },
  ];

  return (
    <section className={styles.services}>
      {/* Decorative Background Shapes */}
      <div className={styles.bgShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Our Water Transport Services</h2>
          <p className={styles.subtitle}>Choose your perfect journey across Mumbai waters</p>
        </div>

        {/* Service Cards */}
        <div className={styles.grid}>
          {services.map((service) => (
            <div
              key={service.id}
              className={styles.card}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Animated Background Glow */}
              <div 
                className={styles.cardGlow}
                style={{ 
                  background: service.gradient,
                  opacity: hoveredCard === service.id ? 0.15 : 0 
                }}
              />

              {/* Icon with Gradient Background */}
              <div 
                className={styles.iconWrapper}
                style={{ background: service.gradient }}
              >
                <span className={styles.icon}>{service.icon}</span>
              </div>

              {/* Content */}
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.description}>{service.description}</p>

              {/* Features */}
              <ul className={styles.features}>
                {service.features.map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <span className={styles.checkmark} style={{ color: service.color }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Price & CTA */}
              <div className={styles.footer}>
                <div className={styles.price}>{service.price}</div>
                <Link href={service.link}>
                  <Button variant="primary" size="sm">
                    Explore →
                  </Button>
                </Link>
              </div>

              {/* Hover Border Animation */}
              <div className={styles.borderAnimation}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;