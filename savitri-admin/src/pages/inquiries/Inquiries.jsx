import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import useUIStore from '../../store/uiStore';
import {
  getInquiries,
  getInquiryById,
  sendQuote,
  convertToBooking,
  deleteInquiry,
} from '../../services/inquiries.service';
import {
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUS_COLORS,
  EVENT_TYPE_LABELS,
  TIME_SLOT_LABELS,
  LOCATION_TYPE_LABELS,
  CURRENCY,
  DEFAULT_PAGE_SIZE,
} from '../../utils/constants';
import styles from './Inquiries.module.css';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString(CURRENCY.LOCALE)}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Inquiries = () => {
  const { showSuccess, showError } = useUIStore();

  // List state
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Quote form
  const [quotedAmount, setQuotedAmount] = useState('');
  const [quotedDetails, setQuotedDetails] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Actions
  const [convertLoading, setConvertLoading] = useState(false);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await getInquiries(params);
      if (response.success) {
        setInquiries(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.total || 0);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRowClick = async (inquiry) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      const response = await getInquiryById(inquiry.id);
      if (response.success) {
        setSelectedInquiry(response.data);
        // Pre-fill quote form if already quoted
        if (response.data.quotedAmount) {
          setQuotedAmount(String(response.data.quotedAmount));
          setQuotedDetails(response.data.quotedDetails || '');
        } else {
          setQuotedAmount('');
          setQuotedDetails('');
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to load inquiry details');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedInquiry(null);
    setQuotedAmount('');
    setQuotedDetails('');
  };

  const handleSendQuote = async () => {
    if (!quotedAmount || !quotedDetails.trim()) {
      showError('Please enter quoted amount and details');
      return;
    }

    try {
      setQuoteLoading(true);
      const response = await sendQuote(selectedInquiry.id, {
        quotedAmount: Number(quotedAmount),
        quotedDetails: quotedDetails.trim(),
      });
      if (response.success) {
        showSuccess('Quote sent successfully');
        setSelectedInquiry(response.data);
        fetchInquiries();
      }
    } catch (err) {
      showError(err.message || 'Failed to send quote');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!window.confirm('Convert this inquiry to a party boat booking?')) return;

    try {
      setConvertLoading(true);
      const response = await convertToBooking(selectedInquiry.id);
      if (response.success) {
        showSuccess('Inquiry converted to booking successfully');
        handleCloseDetail();
        fetchInquiries();
      }
    } catch (err) {
      showError(err.message || 'Failed to convert inquiry');
    } finally {
      setConvertLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const response = await deleteInquiry(id);
      if (response.success) {
        showSuccess('Inquiry deleted');
        fetchInquiries();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete inquiry');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Inquiries</h1>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by inquiry #, name, email, phone..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button onClick={fetchInquiries}>Retry</Button>
        </div>
      )}

      {/* Loading */}
      {loading && <div className={styles.loading}>Loading inquiries...</div>}

      {/* Table */}
      {!loading && !error && (
        <div className={styles.tableCard}>
          {inquiries.length === 0 ? (
            <div className={styles.empty}>
              <p>No inquiries found</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Inquiry #</th>
                      <th>Customer</th>
                      <th>Boat</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Guests</th>
                      <th>Status</th>
                      <th>Quoted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id} onClick={() => handleRowClick(inquiry)}>
                        <td className={styles.inquiryNumber}>{inquiry.inquiryNumber}</td>
                        <td className={styles.customerName}>{inquiry.customerName}</td>
                        <td>{inquiry.boatId?.name || '-'}</td>
                        <td>{EVENT_TYPE_LABELS[inquiry.eventType] || inquiry.eventType}</td>
                        <td>{formatDate(inquiry.preferredDate)}</td>
                        <td>{inquiry.numberOfGuests || '-'}</td>
                        <td>
                          <Badge variant={INQUIRY_STATUS_COLORS[inquiry.status] || 'secondary'}>
                            {INQUIRY_STATUS_LABELS[inquiry.status] || inquiry.status}
                          </Badge>
                        </td>
                        <td className={styles.amount}>{inquiry.quotedAmount ? formatCurrency(inquiry.quotedAmount) : '-'}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(inquiry.id, e)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail / Quote Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        title={selectedInquiry ? `Inquiry: ${selectedInquiry.inquiryNumber}` : 'Inquiry Details'}
        size="lg"
      >
        {detailLoading && <div className={styles.loading}>Loading...</div>}

        {!detailLoading && selectedInquiry && (
          <>
            {/* Inquiry Details */}
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <Badge variant={INQUIRY_STATUS_COLORS[selectedInquiry.status] || 'secondary'}>
                  {INQUIRY_STATUS_LABELS[selectedInquiry.status] || selectedInquiry.status}
                </Badge>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Submitted</span>
                <span className={styles.detailValue}>{formatDate(selectedInquiry.createdAt)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Customer Name</span>
                <span className={styles.detailValue}>{selectedInquiry.customerName}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{selectedInquiry.customerEmail}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>{selectedInquiry.customerPhone}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Boat</span>
                <span className={styles.detailValue}>{selectedInquiry.boatId?.name || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Event Type</span>
                <span className={styles.detailValue}>
                  {EVENT_TYPE_LABELS[selectedInquiry.eventType] || selectedInquiry.eventType}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Number of Guests</span>
                <span className={styles.detailValue}>{selectedInquiry.numberOfGuests || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Preferred Date</span>
                <span className={styles.detailValue}>{formatDate(selectedInquiry.preferredDate)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time Slot</span>
                <span className={styles.detailValue}>
                  {TIME_SLOT_LABELS[selectedInquiry.preferredTimeSlot] || selectedInquiry.preferredTimeSlot || '-'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>
                  {LOCATION_TYPE_LABELS[selectedInquiry.locationType] || selectedInquiry.locationType || '-'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Budget</span>
                <span className={styles.detailValue}>
                  {selectedInquiry.budget ? formatCurrency(selectedInquiry.budget) : '-'}
                </span>
              </div>
              {selectedInquiry.specialRequests && (
                <div className={`${styles.detailItem} ${styles.detailFull}`}>
                  <span className={styles.detailLabel}>Special Requests</span>
                  <span className={styles.detailValue}>{selectedInquiry.specialRequests}</span>
                </div>
              )}
              {selectedInquiry.selectedAddOns && selectedInquiry.selectedAddOns.length > 0 && (
                <div className={`${styles.detailItem} ${styles.detailFull}`}>
                  <span className={styles.detailLabel}>Selected Add-ons</span>
                  <span className={styles.detailValue}>
                    {selectedInquiry.selectedAddOns.map(a => a.type).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Quote Info (if already quoted) */}
            {selectedInquiry.quotedAmount && (
              <div className={styles.statusSection}>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Quoted Amount</span>
                    <span className={styles.detailValue}>{formatCurrency(selectedInquiry.quotedAmount)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Quoted At</span>
                    <span className={styles.detailValue}>{formatDate(selectedInquiry.quotedAt)}</span>
                  </div>
                  {selectedInquiry.quotedDetails && (
                    <div className={`${styles.detailItem} ${styles.detailFull}`}>
                      <span className={styles.detailLabel}>Quote Details</span>
                      <span className={styles.detailValue}>{selectedInquiry.quotedDetails}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Converted Booking Info */}
            {selectedInquiry.status === 'CONVERTED' && selectedInquiry.convertedBookingId && (
              <div className={styles.statusSection}>
                <div className={styles.convertedInfo}>
                  Converted to Booking: {selectedInquiry.convertedBookingId.bookingNumber || selectedInquiry.convertedBookingId}
                </div>
              </div>
            )}

            {/* Send Quote Form (for PENDING or QUOTED inquiries) */}
            {(selectedInquiry.status === 'PENDING' || selectedInquiry.status === 'QUOTED') && (
              <div className={styles.quoteForm}>
                <h3 className={styles.quoteFormTitle}>
                  {selectedInquiry.status === 'QUOTED' ? 'Update Quote' : 'Send Quote'}
                </h3>
                <div>
                  <label className={styles.detailLabel}>Quoted Amount (INR)</label>
                  <input
                    type="number"
                    className={styles.quoteInput}
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                  />
                </div>
                <div>
                  <label className={styles.detailLabel}>Quote Details</label>
                  <textarea
                    className={styles.quoteTextarea}
                    value={quotedDetails}
                    onChange={(e) => setQuotedDetails(e.target.value)}
                    placeholder="Describe what's included in this quote..."
                    rows={3}
                  />
                </div>
                <div className={styles.quoteActions}>
                  <Button
                    variant="primary"
                    onClick={handleSendQuote}
                    disabled={quoteLoading || !quotedAmount || !quotedDetails.trim()}
                  >
                    {quoteLoading ? 'Sending...' : 'Send Quote'}
                  </Button>
                </div>
              </div>
            )}

            {/* Convert to Booking Button (for ACCEPTED inquiries) */}
            {selectedInquiry.status === 'ACCEPTED' && !selectedInquiry.convertedBookingId && (
              <div className={styles.quoteForm}>
                <div className={styles.quoteActions}>
                  <Button
                    variant="primary"
                    onClick={handleConvert}
                    disabled={convertLoading}
                  >
                    {convertLoading ? 'Converting...' : 'Convert to Booking'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default Inquiries;
