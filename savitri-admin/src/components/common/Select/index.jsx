import { forwardRef, useState, useRef, useEffect } from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import styles from './Select.module.css';

/**
 * Select Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Select label
 * @param {Array} props.options - Options array [{value, label}]
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {boolean} props.required - Whether select is required
 * @param {boolean} props.searchable - Whether select is searchable
 * @param {string} props.size - Select size ('sm', 'md', 'lg')
 */
const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  searchable = false,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useClickOutside(() => setIsOpen(false));
  const searchInputRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;
  
  const wrapperClasses = [
    styles.wrapper,
    error && styles.hasError,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');
  
  const selectClasses = [
    styles.select,
    styles[size],
    isOpen && styles.open,
  ].filter(Boolean).join(' ');
  
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);
  
  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.selectContainer} ref={dropdownRef}>
        <button
          ref={ref}
          type="button"
          className={selectClasses}
          onClick={handleToggle}
          disabled={disabled}
          {...props}
        >
          <span className={styles.selectedText}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
            ▼
          </span>
        </button>
        
        {isOpen && (
          <div className={styles.dropdown}>
            {searchable && (
              <div className={styles.searchWrapper}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            <ul className={styles.optionsList}>
              {filteredOptions.length === 0 ? (
                <li className={styles.noOptions}>No options found</li>
              ) : (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`${styles.option} ${
                      option.value === value ? styles.selected : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option.label}
                    {option.value === value && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;