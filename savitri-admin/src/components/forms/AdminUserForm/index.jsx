import { useState } from 'react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Button from '../../common/Button';
import { validateEmail, validateName, validatePhone } from '../../../utils/validators';
import styles from './AdminUserForm.module.css';

/**
 * AdminUserForm Component
 * Form for creating/editing admin users
 * 
 * @param {object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.isEdit - Whether in edit mode
 * @param {Array} props.roles - Available roles
 */
const AdminUserForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isEdit = false,
  roles = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    roleId: initialData.roleId || '',
    status: initialData.status || 'ACTIVE',
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (field) => (value) => {
    const actualValue = value?.target ? value.target.value : value;
    setFormData(prev => ({ ...prev, [field]: actualValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  };
  
  const roleOptions = roles.map(role => ({
    value: role.id,
    label: role.name,
  }));
  
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Full Name"
        value={formData.name}
        onChange={handleChange('name')}
        error={errors.name}
        placeholder="Enter full name"
        required
      />
      
      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        placeholder="admin@example.com"
        required
        disabled={isEdit}
      />
      
      <Input
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        placeholder="9876543210"
        hint="10-digit Indian mobile number"
      />
      
      <Select
        label="Role"
        value={formData.roleId}
        onChange={handleChange('roleId')}
        options={roleOptions}
        error={errors.roleId}
        placeholder="Select a role"
        required
        searchable
      />
      
      {isEdit && (
        <Select
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={statusOptions}
          required
        />
      )}
      
      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {isEdit ? 'Update Admin User' : 'Create Admin User'}
        </Button>
      </div>
    </form>
  );
};

export default AdminUserForm;