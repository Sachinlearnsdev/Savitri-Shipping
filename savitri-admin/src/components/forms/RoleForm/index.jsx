import { useState } from 'react';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import Button from '../../common/Button';
import Checkbox from '../../common/Checkbox';
import { required } from '../../../utils/validators';
import styles from './RoleForm.module.css';

/**
 * RoleForm Component
 * Form for creating/editing roles with permissions
 */
const RoleForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    permissions: initialData.permissions || {},
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
    
    const nameError = required(formData.name);
    if (nameError) newErrors.name = nameError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Role Name"
        value={formData.name}
        onChange={handleChange('name')}
        error={errors.name}
        placeholder="e.g., Operations Manager"
        required
      />
      
      <Textarea
        label="Description"
        value={formData.description}
        onChange={handleChange('description')}
        placeholder="Describe the role responsibilities..."
        rows={3}
      />
      
      <div className={styles.permissionsSection}>
        <h4 className={styles.sectionTitle}>Permissions</h4>
        <p className={styles.sectionHint}>
          Permissions will be configured in Phase 2
        </p>
      </div>
      
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
          {isEdit ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;