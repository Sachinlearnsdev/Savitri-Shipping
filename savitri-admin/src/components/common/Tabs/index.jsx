import { useState } from 'react';
import styles from './Tabs.module.css';

/**
 * Tabs Component
 * 
 * @param {object} props - Component props
 * @param {Array} props.tabs - Array of tab objects [{id, label, content}]
 * @param {string} props.defaultTab - Default active tab ID
 * @param {Function} props.onChange - Tab change handler
 * @param {string} props.variant - Tabs variant ('line' | 'pills')
 */
const Tabs = ({
  tabs = [],
  defaultTab,
  onChange,
  variant = 'line',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  const wrapperClasses = [
    styles.wrapper,
    className,
  ].filter(Boolean).join(' ');
  
  const tabListClasses = [
    styles.tabList,
    styles[variant],
  ].filter(Boolean).join(' ');
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };
  
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  if (tabs.length === 0) return null;
  
  return (
    <div className={wrapperClasses}>
      {/* Tab List */}
      <div className={tabListClasses} role="tablist">
        {tabs.map((tab) => {
          const tabClasses = [
            styles.tab,
            tab.id === activeTab && styles.active,
            tab.disabled && styles.disabled,
          ].filter(Boolean).join(' ');
          
          return (
            <button
              key={tab.id}
              className={tabClasses}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`tabpanel-${tab.id}`}
              disabled={tab.disabled}
            >
              {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
              {tab.label}
              {tab.badge && (
                <span className={styles.badge}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Tab Panel */}
      <div
        className={styles.tabPanel}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTabData?.content}
      </div>
    </div>
  );
};

export default Tabs;