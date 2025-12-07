/**
 * FeaturedBoats Component - Using Regular Button
 * Save as: src/components/home/FeaturedBoats/index.jsx
 */

'use client';
import { useRef } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import styles from "./FeaturedBoats.module.css";

const FeaturedBoats = () => {
  const scrollRef = useRef(null);

  const boats = [
    {
      id: 1,
      name: "Sea Swift",
      type: "Speed Boat",
      price: "₹2,500/hr",
      rating: 5,
      image: "/images/boat-1.jpg",
      features: ["Fast", "6 Seats", "Life Jackets"],
    },
    {
      id: 2,
      name: "Party Pro",
      type: "Party Boat",
      price: "₹18,000",
      rating: 5,
      image: "/images/boat-2.jpg",
      features: ["Music System", "20 Guests", "Catering"],
    },
    {
      id: 3,
      name: "Ocean Express",
      type: "Ferry",
      price: "₹80/trip",
      rating: 4,
      image: "/images/boat-3.jpg",
      features: ["Vehicle Transport", "Daily", "Reliable"],
    },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.featured}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🔥 Featured Boats</h2>
            <p className={styles.subtitle}>Available now for booking</p>
          </div>
          <div className={styles.navButtons}>
            <button onClick={() => scroll("left")} className={styles.navBtn}>
              ←
            </button>
            <button onClick={() => scroll("right")} className={styles.navBtn}>
              →
            </button>
          </div>
        </div>

        <div className={styles.scrollContainer} ref={scrollRef}>
          {boats.map((boat) => (
            <div key={boat.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <div
                  className={styles.image}
                  style={{ backgroundImage: `url(${boat.image})` }}
                />
                <div className={styles.overlay} />
              </div>
              <div className={styles.content}>
                <div className={styles.type}>{boat.type}</div>
                <h3 className={styles.name}>{boat.name}</h3>
                <div className={styles.rating}>{"⭐".repeat(boat.rating)}</div>
                <div className={styles.features}>
                  {boat.features.map((f, i) => (
                    <span key={i} className={styles.feature}>
                      {f}
                    </span>
                  ))}
                </div>
                <div className={styles.footer}>
                  <div className={styles.price}>{boat.price}</div>
                  <Button size="sm" variant="primary">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBoats;
