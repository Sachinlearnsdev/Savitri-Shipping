import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getPartyBoatById, updatePartyBoat, uploadPartyBoatImages, deletePartyBoatImage } from '../../services/partyBoats.service';
import {
  BOAT_STATUS_LABELS,
  BOAT_STATUS_COLORS,
  LOCATION_TYPE_LABELS,
  TIME_SLOT_LABELS,
  EVENT_TYPE_LABELS,
  ADD_ON_TYPE_LABELS,
  PRICE_TYPE_LABELS,
  CURRENCY,
} from '../../utils/constants';
import styles from './PartyBoatDetail.module.css';

const PartyBoatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();
  const fileInputRef = useRef(null);

  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPartyBoatById(id);
        if (response.success) {
          setBoat(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load party boat details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBoat();
    }
  }, [id]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await uploadPartyBoatImages(id, formData);
      if (response.success) {
        setBoat(response.data);
        showSuccess('Images uploaded successfully');
      }
    } catch (err) {
      showError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleDeleteImageClick = (index) => {
    setDeletingImageIndex(index);
    setShowDeleteImageDialog(true);
  };

  const handleConfirmDeleteImage = async () => {
    if (deletingImageIndex === null) return;
    try {
      setDeletingImage(true);
      const response = await deletePartyBoatImage(id, deletingImageIndex);
      if (response.success) {
        const updatedImages = response.data?.images || (boat.images || []).filter((_, i) => i !== deletingImageIndex);
        setBoat((prev) => ({ ...prev, images: updatedImages }));
        showSuccess('Image deleted successfully');
      }
    } catch (err) {
      showError(err.message || 'Failed to delete image');
    } finally {
      setDeletingImage(false);
      setShowDeleteImageDialog(false);
      setDeletingImageIndex(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => navigate('/party-boats')}>
            Back to Party Boats
          </Button>
        </div>
      </div>
    );
  }

  if (!boat) return null;

  const images = boat.images || [];

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/party-boats')}>
        Back to Party Boats
      </button>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{boat.name || 'Party Boat Detail'}</h1>
        <Badge variant={BOAT_STATUS_COLORS[boat.status] || 'default'}>
          {BOAT_STATUS_LABELS[boat.status] || boat.status}
        </Badge>
      </div>

      {/* Boat Info Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Boat Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Capacity</span>
            <span className={styles.infoValue}>{boat.capacityMin} - {boat.capacityMax} guests</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Base Price</span>
            <span className={styles.infoValue}>{formatCurrency(boat.basePrice)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Location Options</span>
            <div className={styles.badges}>
              {(boat.locationOptions || []).map((loc) => (
                <Badge key={loc} variant="default">{LOCATION_TYPE_LABELS[loc] || loc}</Badge>
              ))}
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>DJ Included</span>
            <span className={styles.infoValue}>{boat.djIncluded ? 'Yes' : 'No'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Operating Hours</span>
            <span className={styles.infoValue}>
              {boat.operatingStartTime || '06:00'} - {boat.operatingEndTime || '00:00'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Time Slots</span>
            <div className={styles.badges}>
              {(boat.timeSlots || []).map((slot) => (
                <Badge key={slot} variant="info">{TIME_SLOT_LABELS[slot] || slot}</Badge>
              ))}
              {(!boat.timeSlots || boat.timeSlots.length === 0) && (
                <span className={styles.infoValue}>None configured</span>
              )}
            </div>
          </div>
          <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
            <span className={styles.infoLabel}>Event Types</span>
            <div className={styles.badges}>
              {(boat.eventTypes || []).map((et) => (
                <Badge key={et} variant="info">{EVENT_TYPE_LABELS[et] || et}</Badge>
              ))}
              {(!boat.eventTypes || boat.eventTypes.length === 0) && (
                <span className={styles.infoValue}>None configured</span>
              )}
            </div>
          </div>
          {boat.description && (
            <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.infoLabel}>Description</span>
              <span className={styles.infoValue}>{boat.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Add-ons Card */}
      {(boat.addOns || []).length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Add-ons</h2>
          <table className={styles.addOnsTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Label</th>
                <th>Price</th>
                <th>Price Type</th>
              </tr>
            </thead>
            <tbody>
              {boat.addOns.map((addon, index) => (
                <tr key={index}>
                  <td>{ADD_ON_TYPE_LABELS[addon.type] || addon.type}</td>
                  <td>{addon.label}</td>
                  <td>{formatCurrency(addon.price)}</td>
                  <td>{PRICE_TYPE_LABELS[addon.priceType] || addon.priceType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Gallery */}
      <div className={styles.card}>
        <div className={styles.gallery}>
          <div className={styles.galleryHeader}>
            <h2 className={styles.cardTitle} style={{ margin: 0, border: 'none', paddingBottom: 0 }}>
              Boat Images
            </h2>
            <Button variant="outline" size="sm" onClick={handleUploadClick} loading={uploading}>
              Upload Images
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.uploadInput}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
          />
          {images.length === 0 ? (
            <div className={styles.emptyGallery}>
              <p>No images uploaded yet</p>
              <Button variant="outline" size="sm" onClick={handleUploadClick}>
                Upload First Image
              </Button>
            </div>
          ) : (
            <div className={styles.galleryGrid}>
              {images.map((image, index) => (
                <div key={index} className={styles.imageWrapper} style={{ position: 'relative' }}>
                  <img
                    src={typeof image === 'string' ? image : image.url}
                    alt={`Boat image ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImageClick(index)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      padding: 0,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'; }}
                    title="Delete image"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Delete Image Confirm */}
      <ConfirmDialog
        isOpen={showDeleteImageDialog}
        onClose={() => { setShowDeleteImageDialog(false); setDeletingImageIndex(null); }}
        onConfirm={handleConfirmDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deletingImage}
      />
    </div>
  );
};

export default PartyBoatDetail;
