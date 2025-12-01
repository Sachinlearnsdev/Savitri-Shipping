import useUIStore from '../store/uiStore';

/**
 * Custom hook for modal management
 * @param {string} modalId - Unique modal identifier
 * @returns {object} Modal state and methods
 */
const useModal = (modalId) => {
  const {
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
  } = useUIStore();
  
  return {
    /**
     * Check if modal is open
     * @returns {boolean} True if modal is open
     */
    isOpen: isModalOpen(modalId),
    
    /**
     * Get modal data
     * @returns {object|null} Modal data
     */
    data: getModalData(modalId),
    
    /**
     * Open modal
     * @param {object} data - Modal data (optional)
     */
    open: (data = null) => openModal(modalId, data),
    
    /**
     * Close modal
     */
    close: () => closeModal(modalId),
    
    /**
     * Toggle modal
     * @param {object} data - Modal data (optional)
     */
    toggle: (data = null) => {
      if (isModalOpen(modalId)) {
        closeModal(modalId);
      } else {
        openModal(modalId, data);
      }
    },
  };
};

export default useModal;