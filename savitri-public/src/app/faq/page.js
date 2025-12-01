/**
 * FAQ Page
 */

'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import styles from './page.module.css';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What services does Savitri Shipping offer?',
          answer: 'We offer three main services: Speed boat rentals by the hour, Party boat bookings for events and celebrations, and Regular ferry services across Mumbai routes.',
        },
        {
          question: 'How do I book a service?',
          answer: 'You can book through our website by creating an account, selecting your service, choosing date and time, and completing the payment. Bookings are confirmed immediately after payment.',
        },
        {
          question: 'What are your operating hours?',
          answer: 'Speed boats and ferries operate from 6:00 AM to 6:00 PM. Party boats are available from 6:00 AM to 12:00 AM. We provide 24/7 customer support.',
        },
      ],
    },
    {
      category: 'Booking & Payment',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment gateway partners.',
        },
        {
          question: 'Can I modify my booking?',
          answer: 'Yes, you can modify your booking up to 24 hours before departure time. Log in to your account and go to "My Bookings" to make changes. Some modifications may incur additional charges.',
        },
        {
          question: 'Do you offer group discounts?',
          answer: 'Yes, we offer special rates for group bookings of 10 or more passengers. Please contact our sales team for custom quotes.',
        },
      ],
    },
    {
      category: 'Cancellation & Refunds',
      questions: [
        {
          question: 'What is your cancellation policy?',
          answer: 'Cancellation policies vary by service type. Speed boats and ferries: Free cancellation up to 24 hours before departure. Party boats: Free cancellation up to 7 days before the event. See our Terms & Conditions for detailed information.',
        },
        {
          question: 'How long does it take to process refunds?',
          answer: 'Refunds are processed within 7-10 business days to your original payment method. You will receive a confirmation email once the refund is initiated.',
        },
        {
          question: 'What happens if the service is cancelled due to weather?',
          answer: 'In case of cancellation due to adverse weather conditions, you will be offered a full refund or the option to reschedule to another date at no extra charge.',
        },
      ],
    },
    {
      category: 'Safety & Requirements',
      questions: [
        {
          question: 'Are life jackets provided?',
          answer: 'Yes, life jackets are provided to all passengers free of charge. Wearing them is mandatory for children under 12 and recommended for all passengers.',
        },
        {
          question: 'What documents do I need to bring?',
          answer: 'You need to bring a valid government-issued ID (Aadhar card, passport, driving license). For ferry services with vehicles, bring your vehicle registration and insurance documents.',
        },
        {
          question: 'Can I bring luggage?',
          answer: 'Yes, you can bring personal luggage. However, large items may incur additional charges. Please check weight and size limits when booking.',
        },
        {
          question: 'Are your vessels safe?',
          answer: 'All our vessels are regularly maintained and certified by maritime authorities. Our crew is trained in safety procedures and emergency response.',
        },
      ],
    },
    {
      category: 'Speed Boat Rentals',
      questions: [
        {
          question: 'How long can I rent a speed boat?',
          answer: 'Speed boats can be rented by the hour with a minimum of 1 hour. You can extend your rental time based on availability.',
        },
        {
          question: 'Do I need a license to rent a speed boat?',
          answer: 'No, all speed boats come with an experienced captain. Passengers are not allowed to operate the vessel.',
        },
        {
          question: 'How many people can a speed boat accommodate?',
          answer: 'Our speed boats typically accommodate 4-8 passengers depending on the model. Exact capacity is mentioned during booking.',
        },
      ],
    },
    {
      category: 'Party Boats',
      questions: [
        {
          question: 'Can I bring my own food and drinks?',
          answer: 'Yes, you can bring your own food and non-alcoholic beverages. Alcohol is permitted with prior approval. We also offer catering packages.',
        },
        {
          question: 'Is there music and entertainment?',
          answer: 'Yes, our party boats are equipped with sound systems. You can bring your own music or hire our DJ services for an additional fee.',
        },
        {
          question: 'What is the minimum booking duration?',
          answer: 'Party boats have a minimum booking duration of 4 hours. Extensions can be arranged based on availability.',
        },
      ],
    },
    {
      category: 'Ferry Services',
      questions: [
        {
          question: 'Can I take my vehicle on the ferry?',
          answer: 'Yes, our ferries accommodate cars, bikes, and cycles. Additional charges apply based on vehicle type. Advance booking recommended.',
        },
        {
          question: 'How early should I arrive?',
          answer: 'Please arrive at least 15 minutes before departure time for passenger check-in. For vehicle transport, arrive 30 minutes early.',
        },
        {
          question: 'Are there facilities on board?',
          answer: 'Our ferries have restrooms, seating areas, and snack counters. Larger vessels also have air-conditioned sections.',
        },
      ],
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <main className={styles.faqPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
            <p className={styles.heroDescription}>
              Find answers to common questions about our services
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.faqContent}>
              {faqs.map((category, catIndex) => (
                <div key={catIndex} className={styles.category}>
                  <h2 className={styles.categoryTitle}>{category.category}</h2>
                  <div className={styles.questions}>
                    {category.questions.map((faq, qIndex) => {
                      const index = `${catIndex}-${qIndex}`;
                      const isOpen = openIndex === index;

                      return (
                        <div key={qIndex} className={styles.faqItem}>
                          <button
                            className={styles.question}
                            onClick={() => toggleFAQ(index)}
                          >
                            <span>{faq.question}</span>
                            <svg
                              className={isOpen ? styles.iconOpen : styles.icon}
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className={styles.answer}>
                              <p>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div className={styles.contact}>
              <h2>Still have questions?</h2>
              <p>
                Can't find the answer you're looking for? Please reach out to our
                customer support team.
              </p>
              <div className={styles.contactButtons}>
                <a href="/contact" className={styles.contactButton}>
                  Contact Us
                </a>
                <a href="tel:+919876543210" className={styles.contactButton}>
                  Call: +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}