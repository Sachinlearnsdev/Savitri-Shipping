import { useState, useEffect, useCallback } from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getReviews, approveReview, deleteReview } from '../../services/reviews.service';
import {
  REVIEW_TYPE,
  REVIEW_TYPE_LABELS,
  REVIEW_TYPE_COLORS,
  DEFAULT_PAGE_SIZE,
} from '../../utils/constants';
import styles from './Reviews.module.css';

const productTypeOptions = [
  { value: '', label: 'All Products' },
  { value: REVIEW_TYPE.SPEED_BOAT, label: 'Speed Boat' },
  { value: REVIEW_TYPE.PARTY_BOAT, label: 'Party Boat' },
];

const filterApprovedOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Approved' },
  { value: 'false', label: 'Rejected' },
];

/**
 * Render star icons for a given rating (1-5)
 */
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? styles.starFilled : styles.starEmpty}>
        &#9733;
      </span>
    );
  }
  return <div className={styles.rating}>{stars}</div>;
};

const Reviews = ({ category = 'company' }) => {
  const { showSuccess, showError } = useUIStore();
  const isCompany = category === 'company';

  // Product sub-filter (only for product category)
  const [productSubFilter, setProductSubFilter] = useState('');

  // List state
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');

  // Action state
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reset state when category changes
  useEffect(() => {
    setPage(1);
    setSearch('');
    setApprovedFilter('');
    setProductSubFilter('');
  }, [category]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (isCompany) {
        params.type = REVIEW_TYPE.COMPANY;
      } else if (productSubFilter) {
        params.type = productSubFilter;
      } else {
        params.type = `${REVIEW_TYPE.SPEED_BOAT},${REVIEW_TYPE.PARTY_BOAT}`;
      }
      if (approvedFilter) params.isApproved = approvedFilter;

      const response = await getReviews(params);
      if (response.success) {
        setReviews(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isCompany, productSubFilter, approvedFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleApproveToggle = async (review) => {
    const reviewId = review.id || review._id;
    const newApproved = !review.isApproved;
    try {
      setActionLoading(reviewId);
      await approveReview(reviewId, newApproved);
      showSuccess(newApproved ? 'Review approved' : 'Review rejected');
      fetchReviews();
    } catch (err) {
      showError(err.message || 'Failed to update review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDelete = (review) => {
    setDeletingReview(review);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    try {
      setDeleting(true);
      await deleteReview(deletingReview.id || deletingReview._id);
      showSuccess('Review deleted successfully');
      setShowDeleteDialog(false);
      setDeletingReview(null);
      fetchReviews();
    } catch (err) {
      showError(err.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{isCompany ? 'Company Reviews' : 'Product Reviews'}</h1>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by customer name or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!isCompany && (
          <select
            className={styles.filterSelect}
            value={productSubFilter}
            onChange={(e) => { setProductSubFilter(e.target.value); setPage(1); }}
          >
            {productTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        <select
          className={styles.filterSelect}
          value={approvedFilter}
          onChange={(e) => { setApprovedFilter(e.target.value); setPage(1); }}
        >
          {filterApprovedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchReviews}>Retry</Button>
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No reviews found.</p>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Type</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const reviewId = review.id || review._id;
                  return (
                    <tr key={reviewId}>
                      <td className={styles.customerName}>
                        {review.customerName || '-'}
                      </td>
                      <td>
                        <Badge variant={REVIEW_TYPE_COLORS[review.reviewType] || 'default'}>
                          {REVIEW_TYPE_LABELS[review.reviewType] || review.reviewType}
                        </Badge>
                      </td>
                      <td>
                        <StarRating rating={review.rating} />
                      </td>
                      <td>
                        <span className={styles.comment} title={review.comment || ''}>
                          {review.comment || '-'}
                        </span>
                      </td>
                      <td>
                        <Badge variant={review.isApproved ? 'success' : 'error'}>
                          {review.isApproved ? 'Approved' : 'Rejected'}
                        </Badge>
                      </td>
                      <td>{formatDate(review.createdAt)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${review.isApproved ? styles.rejectBtn : styles.approveBtn}`}
                            onClick={() => handleApproveToggle(review)}
                            disabled={actionLoading === reviewId}
                            title={review.isApproved ? 'Reject review' : 'Approve review'}
                          >
                            {actionLoading === reviewId
                              ? '...'
                              : review.isApproved
                                ? 'Reject'
                                : 'Approve'}
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleOpenDelete(review)}
                            title="Delete review"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingReview(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        message={`Are you sure you want to delete the review by "${deletingReview?.customerName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Reviews;
