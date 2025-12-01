import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a component
 * Useful for dropdowns, modals, and other overlay components
 * 
 * @param {Function} handler - Callback function to execute when clicking outside
 * @returns {React.RefObject} Ref to attach to the component
 */
const useClickOutside = (handler) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the ref element, call the handler
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler]);
  
  return ref;
};

export default useClickOutside;