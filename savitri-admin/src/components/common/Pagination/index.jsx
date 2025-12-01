import styles from './Pagination.module.css';

/**
 * Pagination Component
 * 
 * @param {object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler
 * @param {number} props.pageSize - Items per page
 * @param {Function} props.onPageSizeChange - Page size change handler
 * @param {Array<number>} props.pageSizeOptions - Page size options
 * @param {number} props.totalItems - Total number of items
 * @param {boolean} props.showPageSize - Show page size selector
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  totalItems,
  showPageSize = true,
  className = '',
}) => {
  if (totalPages <= 1) return null;
  
  const wrapperClasses = [
    styles.wrapper,
    className,
  ].filter(Boolean).join(' ');
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };
  
  const handlePageSizeChange = (e) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
    }
  };
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);
  
  return (
    <div className={wrapperClasses}>
      {/* Page Info */}
      {totalItems && (
        <div className={styles.info}>
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}
      
      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange && (
        <div className={styles.pageSize}>
          <span>Show</span>
          <select
            className={styles.select}
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>
      )}
      
      {/* Page Numbers */}
      <div className={styles.pages}>
        {/* Previous Button */}
        <button
          className={styles.button}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        
        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                ...
              </span>
            );
          }
          
          return (
            <button
              key={page}
              className={`${styles.button} ${page === currentPage ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
        
        {/* Next Button */}
        <button
          className={styles.button}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;