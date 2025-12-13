/**
 * Saved Vehicles Page
 * FIXED: Correct service method names and response structure
 */

'use client';
import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import profileService from '@/services/profile.service';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Loader from '@/components/common/Loader';
import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS } from '@/utils/constants';
import styles from './page.module.css';

export default function VehiclesPage() {
  useAuth({ requireAuth: true });
  const { success, error: showError } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    
    // FIXED: Use correct method name
    const { data, error } = await profileService.getVehicles();
    
    if (error) {
      const errorMsg = error.message || error.error?.message || 'Failed to load vehicles';
      showError(errorMsg);
      setVehicles([]);
    } else {
      // Backend returns: { success, message, data: [...vehicles] }
      setVehicles(data?.data || []);
    }
    
    setLoading(false);
  };

  const handleDelete = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    // FIXED: Use correct method name
    const { error } = await profileService.deleteVehicle(vehicleId);
    
    if (error) {
      const errorMsg = error.message || error.error?.message || 'Failed to delete vehicle';
      showError(errorMsg);
    } else {
      success('Vehicle deleted successfully');
      fetchVehicles();
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.vehiclesPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Saved Vehicles</h1>
          <p className={styles.description}>
            Save your vehicle details for faster ferry bookings
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path
                d="M10 35L15 30H65L70 35V55H10V35Z"
                stroke="var(--color-gray-300)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="55" r="5" stroke="var(--color-gray-300)" strokeWidth="2" />
              <circle cx="55" cy="55" r="5" stroke="var(--color-gray-300)" strokeWidth="2" />
            </svg>
          }
          title="No saved vehicles"
          description="Add your vehicle details to make ferry bookings faster and easier."
          action={
            <Button onClick={() => setShowModal(true)}>
              Add Your First Vehicle
            </Button>
          }
        />
      ) : (
        <div className={styles.vehiclesGrid}>
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} padding="md" hover>
              <div className={styles.vehicleCard}>
                <div className={styles.vehicleIcon}>
                  {vehicle.type === 'CAR' && '🚗'}
                  {vehicle.type === 'BIKE' && '🏍️'}
                  {vehicle.type === 'CYCLE' && '🚲'}
                </div>
                <div className={styles.vehicleInfo}>
                  <h3 className={styles.vehicleName}>
                    {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`}
                  </h3>
                  <p className={styles.vehicleDetails}>
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className={styles.vehicleType}>
                    {VEHICLE_TYPE_LABELS[vehicle.type]}
                  </p>
                  {vehicle.registrationNo && (
                    <p className={styles.vehicleReg}>{vehicle.registrationNo}</p>
                  )}
                  {vehicle.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(vehicle.id)}
                  aria-label="Delete vehicle"
                  title="Delete vehicle"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M3 5H17M8 5V3H12V5M8 9V15M12 9V15M5 5L6 17H14L15 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddVehicleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
}

// Add Vehicle Modal
function AddVehicleModal({ isOpen, onClose, onSuccess }) {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    registrationNo: '',
    nickname: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    handleChange(field)(value);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = 'Vehicle type is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.model) newErrors.model = 'Model is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    // FIXED: Use correct method name
    const { data, error } = await profileService.addVehicle({
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      registrationNo: formData.registrationNo || undefined,
      nickname: formData.nickname || undefined,
      isDefault: formData.isDefault,
    });

    if (error) {
      const errorMsg = error.message || error.error?.message || 'Failed to add vehicle';
      showError(errorMsg);
    } else {
      success('Vehicle added successfully');
      onClose();
      onSuccess();
      setFormData({
        type: '',
        brand: '',
        model: '',
        registrationNo: '',
        nickname: '',
        isDefault: false,
      });
      setErrors({});
    }

    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    setFormData({
      type: '',
      brand: '',
      model: '',
      registrationNo: '',
      nickname: '',
      isDefault: false,
    });
    setErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Vehicle">
      <form onSubmit={handleSubmit}>
        <Select
          label="Vehicle Type"
          options={[
            { value: '', label: 'Select vehicle type' },
            { value: VEHICLE_TYPES.CAR, label: VEHICLE_TYPE_LABELS[VEHICLE_TYPES.CAR] },
            { value: VEHICLE_TYPES.BIKE, label: VEHICLE_TYPE_LABELS[VEHICLE_TYPES.BIKE] },
            { value: VEHICLE_TYPES.CYCLE, label: VEHICLE_TYPE_LABELS[VEHICLE_TYPES.CYCLE] },
          ]}
          value={formData.type}
          onChange={handleChange('type')}
          error={errors.type}
          required
        />
        
        <Input
          label="Brand"
          placeholder="e.g., Maruti Suzuki"
          value={formData.brand}
          onChange={handleInputChange('brand')}
          error={errors.brand}
          required
        />
        
        <Input
          label="Model"
          placeholder="e.g., Swift"
          value={formData.model}
          onChange={handleInputChange('model')}
          error={errors.model}
          required
        />
        
        <Input
          label="Registration Number"
          placeholder="e.g., MH01AB1234"
          value={formData.registrationNo}
          onChange={handleInputChange('registrationNo')}
          error={errors.registrationNo}
          hint="Optional (Indian format: XX00XX0000)"
        />
        
        <Input
          label="Nickname"
          placeholder="e.g., My Car"
          value={formData.nickname}
          onChange={handleInputChange('nickname')}
          hint="Optional (for easy identification)"
        />
        
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleInputChange('isDefault')}
            />
            <span>Set as default vehicle</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>
          <Button type="submit" loading={loading} disabled={loading}>
            Add Vehicle
          </Button>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}