/**
 * HeroCarousel Component - Updated to use regular Button
 * Save as: src/components/home/HeroCarousel/index.jsx
 */

'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/common/Button"; // UPDATED
import styles from "./HeroCarousel.module.css";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Speed Boats",
      subtitle: "Fastest Way Across Mumbai Waters",
      description:
        "Experience lightning-fast travel with our premium speed boats. Perfect for quick trips and urgent commutes.",
      price: "₹2,500",
      priceUnit: "/hour",
      discount: "20% OFF",
      cta: "Book Speed Boat",
      link: "/speed-boats",
      image: "/images/speed-boat.jpg",
      icon: "⚡",
      gradient: "linear-gradient(135deg, #0A7EA4 0%, #2D5F7F 100%)",
    },
    {
      id: 2,
      title: "Party Boats",
      subtitle: "Create Memories on Water",
      description:
        "Celebrate your special moments with our luxurious party boats. Perfect for birthdays, anniversaries, and corporate events.",
      price: "₹15,000",
      priceUnit: "/event",
      discount: "Weekend Special",
      cta: "Book Party Boat",
      link: "/party-boats",
      image: "/images/party-boat.jpg",
      icon: "🎉",
      gradient: "linear-gradient(135deg, #F97316 0%, #ea580c 100%)",
    },
    {
      id: 3,
      title: "Ferry Services",
      subtitle: "Daily Commute Made Easy",
      description:
        "Reliable ferry routes across Mumbai. Vehicle transport available. Affordable and eco-friendly travel solution.",
      price: "₹50",
      priceUnit: "/trip",
      discount: "Vehicle Transport Available",
      cta: "Book Ferry",
      link: "/ferry",
      image: "/images/ferry.jpg",
      icon: "⛴️",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
  ];

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (i) => {
    setCurrentSlide(i);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const current = slides[currentSlide];

  return (
    <section className={styles.hero}>
      {/* Background Images */}
      <div className={styles.backgroundWrapper}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.backgroundImage} ${
              index === currentSlide ? styles.active : ""
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left Glass Card */}
          <div className={styles.leftCard}>
            <div
              className={styles.iconBadge}
              style={{ background: current.gradient }}
            >
              <span className={styles.icon}>{current.icon}</span>
            </div>

            <h1 className={styles.title}>{current.title}</h1>
            <h2 className={styles.subtitle}>{current.subtitle}</h2>
            <p className={styles.description}>{current.description}</p>

            {/* Pricing */}
            <div className={styles.pricing}>
              <div className={styles.priceTag}>
                <span className={styles.priceLabel}>Starting at</span>
                <span className={styles.price}>
                  {current.price}
                  <span className={styles.priceUnit}>{current.priceUnit}</span>
                </span>
              </div>
              <div className={styles.discountBadge}>{current.discount}</div>
            </div>

            {/* CTA - Updated to regular Button */}
            <Link href={current.link}>
              <Button variant="primary" size="lg" className={styles.ctaButton}>
                {current.icon} {current.cta}
              </Button>
            </Link>
          </div>

          {/* Right Side (empty space for background) */}
          <div className={styles.rightSpace}></div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.controls}>
        <button className={styles.navButton} onClick={prevSlide}>
          ←
        </button>

        <div className={styles.dots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${
                index === currentSlide ? styles.activeDot : ""
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        <button className={styles.navButton} onClick={nextSlide}>
          →
        </button>
      </div>

      {/* Auto-play toggle */}
      <button
        className={styles.autoPlayToggle}
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
      >
        {isAutoPlaying ? "⏸" : "▶"}
      </button>
    </section>
  );
};

export default HeroCarousel;
