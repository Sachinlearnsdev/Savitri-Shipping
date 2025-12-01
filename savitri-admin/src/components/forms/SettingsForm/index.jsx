import { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import styles from './SettingsForm.module.css';

/**
 * SettingsForm Component
 * Generic form for settings pages
 */
const SettingsForm = ({
  initialData = {},
  fields = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  
  const handleChange = (field) => (value) => {
    const actualValue = value?.target ? value.target.value : value;
    setFormData(prev => ({ ...prev, [field]: actualValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {fields.map((field) => (
        <Input
          key={field.name}
          label={field.label}
          type={field.type || 'text'}
          value={formData[field.name] || ''}
          onChange={handleChange(field.name)}
          error={errors[field.name]}
          placeholder={field.placeholder}
          required={field.required}
          hint={field.hint}
        />
      ))}
      
      <div className={styles.actions}>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default SettingsForm;