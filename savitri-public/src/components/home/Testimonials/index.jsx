/**
 * Testimonials Component - FIXED
 * Save as: src/components/home/Testimonials/index.jsx
 */
'use client';
import { useState, useEffect } from 'react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      avatar: '👨‍💼',
      rating: 5,
      text: 'Excellent service! The speed boat was perfect for my urgent meeting in Navi Mumbai. Professional crew and very punctual.',
      location: 'Mumbai',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Event Organizer',
      avatar: '👩‍💼',
      rating: 5,
      text: 'Organized my daughter\'s birthday party on their party boat. Amazing experience! The crew was friendly and very accommodating.',
      location: 'Thane',
    },
    {
      id: 3,
      name: 'Amit Patel',
      role: 'Daily Commuter',
      avatar: '👨',
      rating: 5,
      text: 'Use their ferry service daily for my commute. Much faster than road traffic. Affordable and reliable. Highly recommended!',
      location: 'Navi Mumbai',
    },
    {
      id: 4,
      name: 'Sneha Desai',
      role: 'Tourist',
      avatar: '👩',
      rating: 4,
      text: 'Great way to explore Mumbai from the water. The speed boat tour was thrilling! Will definitely use again on my next visit.',
      location: 'Pune',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>What Our Customers Say</h2>
          <p className={styles.subtitle}>Real experiences from our happy travelers</p>
        </div>

        {/* Testimonial Cards */}
        <div className={styles.slider}>
          <div 
            className={styles.track}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className={styles.card}>
                <div className={styles.quoteIcon}>"</div>
                
                <div className={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={i < testimonial.rating ? styles.starFilled : styles.star}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                <p className={styles.text}>{testimonial.text}</p>

                <div className={styles.author}>
                  <div className={styles.avatar}>{testimonial.avatar}</div>
                  <div className={styles.authorInfo}>
                    <div className={styles.name}>{testimonial.name}</div>
                    <div className={styles.role}>{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;