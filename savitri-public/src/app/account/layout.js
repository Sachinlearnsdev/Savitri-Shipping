'use client';

import React from 'react';
import styles from './layout.module.css';

export default function AccountLayout({ children }) {
  return (
    <div className={styles.accountLayout}>
      <div className={styles.container}>
        {/* Main Content - No sidebar needed for single profile page */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}