import { useState, useEffect, useCallback } from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import {
  getReviews,
  approveReview,
  deleteReview,
  getReviewStats,
  getBoatReviewsAggregation,
} from '../../services/reviews.service';
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
  { value: 'false', label: 'Hidden' },
];

/**
 * Render star icons for a given rating (1-5)
 */
const StarRating = ({ rating, size = 'default' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${i <= rating ? styles.starFilled : styles.starEmpty} ${size === 'large' ? styles.starLarge : ''}`}
      >
        &#9733;
      </span>
    );
  }
  return <div className={styles.rating}>{stars}</div>;
};

/**
 * Rating distribution bar
 */
const RatingBar = ({ star, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className={styles.ratingBarRow}>
      <span className={styles.ratingBarLabel}>{star}</span>
      <span className={styles.ratingBarStar}>&#9733;</span>
      <div className={styles.ratingBarTrack}>
        <div className={styles.ratingBarFill} style={{ width: `${percentage}%` }} />
      </div>
      <span className={styles.ratingBarCount}>{count}</span>
    </div>
  );
};

/**
 * Stats summary card for company reviews
 */
const ReviewStatsSummary = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.total}</span>
        <span className={styles.statLabel}>Total Reviews</span>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statRatingDisplay}>
          <span className={styles.statValue}>{stats.avgRating || '0.0'}</span>
          <StarRating rating={Math.round(stats.avgRating)} size="large" />
        </div>
        <span className={styles.statLabel}>Average Rating</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.approvedCount}</span>
        <span className={styles.statLabel}>Approved</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.hiddenCount}</span>
        <span className={styles.statLabel}>Hidden</span>
      </div>
      <div className={styles.statCardWide}>
        <span className={styles.statSectionTitle}>Rating Distribution</span>
        <div className={styles.ratingDistribution}>
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              star={star}
              count={stats.distribution?.[star] || 0}
              total={stats.total}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual review card (used in both company and boat detail views)
 */
const ReviewCard = ({ review, onToggleApproval, onDelete, actionLoading }) => {
  const reviewId = review.id || review._id;
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewCardHeader}>
        <div className={styles.reviewCardCustomer}>
          <div className={styles.reviewCardAvatar}>
            {(review.customerName || '?')[0].toUpperCase()}
          </div>
          <div>
            <span className={styles.reviewCardName}>{review.customerName || 'Anonymous'}</span>
            <span className={styles.reviewCardDate}>{formatDate(review.createdAt)}</span>
          </div>
        </div>
        <Badge variant={review.isApproved ? 'success' : 'warning'}>
          {review.isApproved ? 'Approved' : 'Hidden'}
        </Badge>
      </div>
      <div className={styles.reviewCardRating}>
        <StarRating rating={review.rating} />
      </div>
      {review.comment && (
        <p className={styles.reviewCardComment}>{review.comment}</p>
      )}
      <div className={styles.reviewCardActions}>
        <button
          className={`${styles.actionBtn} ${review.isApproved ? styles.hideBtn : styles.approveBtn}`}
          onClick={() => onToggleApproval(review)}
          disabled={actionLoading === reviewId}
          title={review.isApproved ? 'Hide review from public' : 'Approve review'}
        >
          {actionLoading === reviewId ? '...' : review.isApproved ? 'Hide' : 'Approve'}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(review)}
          title="Delete review"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

/**
 * Boat product card for the aggregation view
 */
const BoatProductCard = ({ boat, onClick }) => {
  return (
    <div className={styles.boatCard} onClick={onClick}>
      <div className={styles.boatCardImage}>
        {boat.boatImage ? (
          <img src={boat.boatImage} alt={boat.boatName} />
        ) : (
          <div className={styles.boatCardPlaceholder}>
            <span>&#9973;</span>
          </div>
        )}
      </div>
      <div className={styles.boatCardBody}>
        <h3 className={styles.boatCardName}>{boat.boatName}</h3>
        <Badge variant={REVIEW_TYPE_COLORS[boat.boatType] || 'default'}>
          {REVIEW_TYPE_LABELS[boat.boatType] || boat.boatType}
        </Badge>
        <div className={styles.boatCardStats}>
          <div className={styles.boatCardStat}>
            <span className={styles.boatCardStatValue}>{boat.avgRating}</span>
            <StarRating rating={Math.round(boat.avgRating)} />
          </div>
          <div className={styles.boatCardStat}>
            <span className={styles.boatCardStatValue}>{boat.reviewCount}</span>
            <span className={styles.boatCardStatLabel}>
              {boat.reviewCount === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>
        <div className={styles.boatCardMeta}>
          <span className={styles.boatCardApproved}>{boat.approvedCount} approved</span>
          {boat.hiddenCount > 0 && (
            <span className={styles.boatCardHidden}>{boat.hiddenCount} hidden</span>
          )}
        </div>
      </div>
    </div>
  );
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

  // Stats state (company)
  const [stats, setStats] = useState(null);

  // Boat aggregation state (product)
  const [boatAggregation, setBoatAggregation] = useState([]);
  const [boatAggLoading, setBoatAggLoading] = useState(true);

  // Boat detail modal state (product)
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [showBoatDetail, setShowBoatDetail] = useState(false);
  const [boatReviews, setBoatReviews] = useState([]);
  const [boatReviewsLoading, setBoatReviewsLoading] = useState(false);
  const [boatReviewPage, setBoatReviewPage] = useState(1);
  const [boatReviewTotalPages, setBoatReviewTotalPages] = useState(1);
  const [boatReviewTotal, setBoatReviewTotal] = useState(0);

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
    setStats(null);
    setBoatAggregation([]);
    setSelectedBoat(null);
    setShowBoatDetail(false);
  }, [category]);

  // Fetch company review stats
  const fetchStats = useCallback(async () => {
    if (!isCompany) return;
    try {
      const type = REVIEW_TYPE.COMPANY;
      const response = await getReviewStats({ type });
      if (response.success) {
        setStats(response.data);
      }
    } catch {
      // Stats failure is non-critical
    }
  }, [isCompany]);

  // Fetch boat aggregation
  const fetchBoatAggregation = useCallback(async () => {
    if (isCompany) return;
    try {
      setBoatAggLoading(true);
      const params = {};
      if (productSubFilter) {
        params.type = productSubFilter;
      }
      const response = await getBoatReviewsAggregation(params);
      if (response.success) {
        setBoatAggregation(response.data || []);
      }
    } catch {
      // Aggregation failure - show empty
      setBoatAggregation([]);
    } finally {
      setBoatAggLoading(false);
    }
  }, [isCompany, productSubFilter]);

  // Fetch reviews list (company reviews only - for card display)
  const fetchReviews = useCallback(async () => {
    if (!isCompany) return;
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      params.type = REVIEW_TYPE.COMPANY;
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
  }, [page, pageSize, search, isCompany, approvedFilter]);

  // Fetch reviews for a specific boat (in modal)
  const fetchBoatReviews = useCallback(async () => {
    if (!selectedBoat) return;
    try {
      setBoatReviewsLoading(true);
      const response = await getReviews({
        type: selectedBoat.boatType,
        boatId: selectedBoat.boatId,
        page: boatReviewPage,
        limit: 10,
      });

      if (response.success) {
        const items = response.data?.items || response.data || [];
        setBoatReviews(items);
        const pagination = response.data?.pagination || response.pagination || {};
        setBoatReviewTotalPages(pagination.totalPages || 1);
        setBoatReviewTotal(pagination.total || 0);
      }
    } catch {
      setBoatReviews([]);
    } finally {
      setBoatReviewsLoading(false);
    }
  }, [selectedBoat, boatReviewPage]);

  useEffect(() => {
    if (isCompany) {
      fetchReviews();
      fetchStats();
    } else {
      fetchBoatAggregation();
      setLoading(false);
    }
  }, [fetchReviews, fetchStats, fetchBoatAggregation, isCompany]);

  useEffect(() => {
    if (showBoatDetail && selectedBoat) {
      fetchBoatReviews();
    }
  }, [showBoatDetail, selectedBoat, fetchBoatReviews]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleApproveToggle = async (review) => {
    const reviewId = review.id || review._id;
    const newApproved = !review.isApproved;
    try {
      setActionLoading(reviewId);
      await approveReview(reviewId, newApproved);
      showSuccess(newApproved ? 'Review approved' : 'Review hidden');
      if (isCompany) {
        fetchReviews();
        fetchStats();
      } else {
        fetchBoatReviews();
        fetchBoatAggregation();
      }
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
      if (isCompany) {
        fetchReviews();
        fetchStats();
      } else {
        fetchBoatReviews();
        fetchBoatAggregation();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  const handleBoatClick = (boat) => {
    setSelectedBoat(boat);
    setBoatReviewPage(1);
    setShowBoatDetail(true);
  };

  // ==================== COMPANY REVIEWS VIEW ====================
  if (isCompany) {
    return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Company Reviews</h1>
        </div>

        {/* Stats Summary */}
        <ReviewStatsSummary stats={stats} />

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by customer name or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

        {/* Reviews Grid */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <Button variant="outline" onClick={fetchReviews}>Retry</Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reviews found.</p>
          </div>
        ) : (
          <>
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id || review._id}
                  review={review}
                  onToggleApproval={handleApproveToggle}
                  onDelete={handleOpenDelete}
                  actionLoading={actionLoading}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            )}
          </>
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
  }

  // ==================== BOAT REVIEWS VIEW ====================
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Boat Reviews</h1>
      </div>

      {/* Filter */}
      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={productSubFilter}
          onChange={(e) => { setProductSubFilter(e.target.value); }}
        >
          {productTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Boat Product Cards Grid */}
      {boatAggLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : boatAggregation.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No boat reviews found.</p>
        </div>
      ) : (
        <div className={styles.boatGrid}>
          {boatAggregation.map((boat) => (
            <BoatProductCard
              key={boat.boatId}
              boat={boat}
              onClick={() => handleBoatClick(boat)}
            />
          ))}
        </div>
      )}

      {/* Boat Detail Modal */}
      <Modal
        isOpen={showBoatDetail}
        onClose={() => { setShowBoatDetail(false); setSelectedBoat(null); }}
        title={selectedBoat ? `Reviews - ${selectedBoat.boatName}` : 'Boat Reviews'}
        size="lg"
      >
        {selectedBoat && (
          <div className={styles.boatDetailModal}>
            {/* Boat summary in modal header */}
            <div className={styles.boatDetailSummary}>
              <div className={styles.boatDetailStat}>
                <span className={styles.boatDetailStatValue}>{selectedBoat.avgRating}</span>
                <StarRating rating={Math.round(selectedBoat.avgRating)} />
              </div>
              <div className={styles.boatDetailStat}>
                <span className={styles.boatDetailStatValue}>{selectedBoat.reviewCount}</span>
                <span className={styles.boatDetailStatLabel}>
                  {selectedBoat.reviewCount === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
              <div className={styles.boatDetailStat}>
                <span className={styles.boatDetailStatValue}>{selectedBoat.approvedCount}</span>
                <span className={styles.boatDetailStatLabel}>Approved</span>
              </div>
              {selectedBoat.hiddenCount > 0 && (
                <div className={styles.boatDetailStat}>
                  <span className={styles.boatDetailStatValue}>{selectedBoat.hiddenCount}</span>
                  <span className={styles.boatDetailStatLabel}>Hidden</span>
                </div>
              )}
            </div>

            {/* Reviews list */}
            {boatReviewsLoading ? (
              <div className={styles.loading}>Loading reviews...</div>
            ) : boatReviews.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No reviews found for this boat.</p>
              </div>
            ) : (
              <div className={styles.boatReviewsList}>
                {boatReviews.map((review) => (
                  <ReviewCard
                    key={review.id || review._id}
                    review={review}
                    onToggleApproval={handleApproveToggle}
                    onDelete={handleOpenDelete}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}

            {boatReviewTotalPages > 1 && (
              <div className={styles.modalPagination}>
                <Pagination
                  currentPage={boatReviewPage}
                  totalPages={boatReviewTotalPages}
                  totalItems={boatReviewTotal}
                  pageSize={10}
                  onPageChange={setBoatReviewPage}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

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
