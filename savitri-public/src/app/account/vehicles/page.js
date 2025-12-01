/**
 * Saved Vehicles Page
 */

'use client';
import { useState, useEffect } from 'react';
import useToast from '@/hooks/useToast';
import profileService from '@/services/profile.service';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS } from '@/utils/constants';
import styles from './page.module.css';

export default function VehiclesPage() {
  const { success, error: showError } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await profileService.getSavedVehicles();
    if (error) {
      showError('Failed to load vehicles');
    } else {
      setVehicles(data?.vehicles || []);
    }
    setLoading(false);
  };

  const handleDelete = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    const { error } = await profileService.deleteSavedVehicle(vehicleId);
    if (error) {
      showError('Failed to delete vehicle');
    } else {
      success('Vehicle deleted successfully');
      fetchVehicles();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
            <svg viewBox="0 0 80 80" fill="none">
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
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className={styles.vehicleType}>
                    {VEHICLE_TYPE_LABELS[vehicle.type]}
                  </p>
                  {vehicle.registrationNo && (
                    <p className={styles.vehicleReg}>{vehicle.registrationNo}</p>
                  )}
                </div>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(vehicle.id)}
                  aria-label="Delete vehicle"
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
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await profileService.addSavedVehicle(formData);

    if (error) {
      showError(error.message || 'Failed to add vehicle');
    } else {
      success('Vehicle added successfully');
      onClose();
      onSuccess();
      setFormData({ type: '', brand: '', model: '', registrationNo: '' });
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vehicle">
      <form onSubmit={handleSubmit}>
        <Select
          label="Vehicle Type"
          options={[
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
          value={formData.brand}
          onChange={(e) => handleChange('brand')(e.target.value)}
          error={errors.brand}
          required
        />
        <Input
          label="Model"
          value={formData.model}
          onChange={(e) => handleChange('model')(e.target.value)}
          error={errors.model}
          required
        />
        <Input
          label="Registration Number"
          value={formData.registrationNo}
          onChange={(e) => handleChange('registrationNo')(e.target.value)}
          error={errors.registrationNo}
          hint="Optional (e.g., MH01AB1234)"
        />
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>
          <Button type="submit" loading={loading}>
            Add Vehicle
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}