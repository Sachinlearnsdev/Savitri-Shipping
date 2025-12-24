'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { useUIStore } from '@/store/uiStore';
import { vehicleService } from '@/services/vehicle.service';
import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS } from '@/utils/constants';
import { validateRequired } from '@/utils/validators';
import { getErrorMessage } from '@/utils/helpers';
import styles from './vehicles.module.css';

export default function VehiclesPage() {
  const { showSuccess, showError } = useUIStore();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    registrationNo: '',
    nickname: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        registrationNo: vehicle.registrationNo || '',
        nickname: vehicle.nickname || '',
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        type: '',
        brand: '',
        model: '',
        registrationNo: '',
        nickname: '',
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!validateRequired(formData.type)) {
      newErrors.type = 'Vehicle type is required';
    }

    if (!validateRequired(formData.brand)) {
      newErrors.brand = 'Brand is required';
    }

    if (!validateRequired(formData.model)) {
      newErrors.model = 'Model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, formData);
        showSuccess('Vehicle updated successfully!');
      } else {
        await vehicleService.createVehicle(formData);
        showSuccess('Vehicle added successfully!');
      }

      handleCloseModal();
      fetchVehicles();
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await vehicleService.deleteVehicle(id);
      showSuccess('Vehicle deleted successfully!');
      fetchVehicles();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const vehicleTypeOptions = Object.keys(VEHICLE_TYPES).map((key) => ({
    value: VEHICLE_TYPES[key],
    label: VEHICLE_TYPE_LABELS[key],
  }));

  if (loading) {
    return <div className={styles.loading}>Loading vehicles...</div>;
  }

  return (
    <div className={styles.vehiclesPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Vehicles</h1>
          <p className={styles.subtitle}>
            Manage your saved vehicles for quick booking
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Add Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>🚗</p>
          <p className={styles.emptyText}>No vehicles saved yet</p>
          <p className={styles.emptySubtext}>
            Add your vehicles for faster ferry bookings
          </p>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className={styles.vehiclesGrid}>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className={styles.vehicleCard}>
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
                {vehicle.registrationNo && (
                  <p className={styles.vehicleReg}>{vehicle.registrationNo}</p>
                )}
                <span className={styles.vehicleType}>
                  {VEHICLE_TYPE_LABELS[vehicle.type]}
                </span>
              </div>
              <div className={styles.vehicleActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleOpenModal(vehicle)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(vehicle.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Select
            label="Vehicle Type"
            options={vehicleTypeOptions}
            value={formData.type}
            onChange={(value) => handleChange('type', value)}
            error={errors.type}
            required
          />

          <Input
            label="Brand"
            type="text"
            placeholder="e.g., Maruti Suzuki"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            error={errors.brand}
            required
          />

          <Input
            label="Model"
            type="text"
            placeholder="e.g., Swift"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            error={errors.model}
            required
          />

          <Input
            label="Registration Number (Optional)"
            type="text"
            placeholder="e.g., MH01AB1234"
            value={formData.registrationNo}
            onChange={(e) => handleChange('registrationNo', e.target.value)}
            hint="Format: MH01AB1234"
          />

          <Input
            label="Nickname (Optional)"
            type="text"
            placeholder="e.g., My Car"
            value={formData.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            hint="A friendly name for your vehicle"
          />

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}