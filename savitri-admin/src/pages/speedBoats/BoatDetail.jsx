import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getBoatById, updateBoat, uploadBoatImages, deleteBoatImage } from '../../services/speedBoats.service';
import {
  BOAT_STATUS,
  BOAT_STATUS_LABELS,
  CURRENCY,
} from '../../utils/constants';
import styles from './BoatDetail.module.css';

const statusOptions = Object.entries(BOAT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

const BoatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    capacity: '',
    description: '',
    features: '',
    baseRate: '',
    status: BOAT_STATUS.ACTIVE,
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBoatById(id);
        if (response.success) {
          const boat = response.data;
          setFormData({
            name: boat.name || '',
            registrationNumber: boat.registrationNumber || '',
            capacity: boat.capacity || '',
            description: boat.description || '',
            features: (boat.features || []).join(', '),
            baseRate: boat.baseRate || '',
            status: boat.status || BOAT_STATUS.ACTIVE,
          });
          setImages(boat.images || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load boat details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBoat();
    }
  }, [id]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.registrationNumber || !formData.capacity || !formData.baseRate) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        baseRate: Number(formData.baseRate),
        features: formData.features
          ? formData.features.split(',').map(f => f.trim()).filter(Boolean)
          : [],
      };

      await updateBoat(id, payload);
      showSuccess('Boat updated successfully');
    } catch (err) {
      showError(err.message || 'Failed to update boat');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('files', files[i]);
      }

      const response = await uploadBoatImages(id, formDataUpload);
      if (response.success) {
        setImages(response.data?.images || []);
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

  const handleDeleteImageClick = (index) => {
    setDeletingImageIndex(index);
    setShowDeleteImageDialog(true);
  };

  const handleConfirmDeleteImage = async () => {
    if (deletingImageIndex === null) return;
    try {
      setDeletingImage(true);
      const response = await deleteBoatImage(id, deletingImageIndex);
      if (response.success) {
        setImages(response.data?.images || images.filter((_, i) => i !== deletingImageIndex));
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
          <Button variant="outline" onClick={() => navigate('/speed-boats')}>
            Back to Boats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/speed-boats')}>
        Back to Speed Boats
      </button>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{formData.name || 'Boat Detail'}</h1>
      </div>

      {/* Boat Details Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Boat Information</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Boat Name"
              placeholder="e.g. Sea Runner"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
            <Input
              label="Registration Number"
              placeholder="e.g. MH-1234"
              value={formData.registrationNumber}
              onChange={(e) => handleFormChange('registrationNumber', e.target.value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Capacity (persons)"
              type="number"
              placeholder="e.g. 8"
              value={formData.capacity}
              onChange={(e) => handleFormChange('capacity', e.target.value)}
              required
            />
            <Input
              label={`Base Rate (${CURRENCY.SYMBOL}/hour)`}
              type="number"
              placeholder="e.g. 2000"
              value={formData.baseRate}
              onChange={(e) => handleFormChange('baseRate', e.target.value)}
              required
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleFormChange('status', value)}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the boat..."
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
          />
          <Input
            label="Features & Amenities (comma-separated)"
            placeholder="e.g. Captain Included, Safety Gear, Life Jackets, Bluetooth Speakers"
            value={formData.features}
            onChange={(e) => handleFormChange('features', e.target.value)}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => navigate('/speed-boats')} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

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

export default BoatDetail;
