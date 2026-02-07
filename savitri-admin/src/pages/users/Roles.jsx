import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getAllRoles, createRole, updateRole, deleteRole } from '../../services/roles.service';
import styles from './Roles.module.css';

// Permission features for the matrix (only speed boat era features, not old ferry ones)
const permissionFeatures = [
  { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { key: 'adminUsers', label: 'Admin Users', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'roles', label: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'customers', label: 'Customers', actions: ['view', 'edit', 'delete'] },
  { key: 'speedBoats', label: 'Speed Boats', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'bookings', label: 'Bookings', actions: ['view', 'create', 'edit', 'cancel', 'refund', 'cashPayment'] },
  { key: 'calendar', label: 'Calendar', actions: ['view', 'edit'] },
  { key: 'pricingRules', label: 'Pricing Rules', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'settings', label: 'Settings', actions: ['view', 'edit'] },
];

// All unique action columns for the matrix header
const allActions = [...new Set(permissionFeatures.flatMap((f) => f.actions))];

// Build a default (all-false) permissions object
const buildDefaultPermissions = () => {
  const perms = {};
  permissionFeatures.forEach((feature) => {
    perms[feature.key] = {};
    feature.actions.forEach((action) => {
      perms[feature.key][action] = false;
    });
  });
  return perms;
};

// Count how many permissions are enabled
const countPermissions = (permissions) => {
  if (!permissions) return 0;
  let count = 0;
  permissionFeatures.forEach((feature) => {
    feature.actions.forEach((action) => {
      if (permissions[feature.key]?.[action]) count++;
    });
  });
  return count;
};

// Count total possible permissions
const totalPermissionCount = permissionFeatures.reduce((sum, f) => sum + f.actions.length, 0);

const Roles = () => {
  const { showSuccess, showError } = useUIStore();

  // List state
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState(buildDefaultPermissions());
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRoles();
      if (response.success) {
        const rolesList = response.data?.items || response.data || [];
        setRoles(rolesList);
      }
    } catch (err) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormName('');
    setFormDescription('');
    setFormPermissions(buildDefaultPermissions());
    setShowModal(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setFormName(role.name || '');
    setFormDescription(role.description || '');
    // Merge existing permissions with default structure to ensure all keys exist
    const defaultPerms = buildDefaultPermissions();
    const existingPerms = role.permissions || {};
    const merged = {};
    permissionFeatures.forEach((feature) => {
      merged[feature.key] = {};
      feature.actions.forEach((action) => {
        merged[feature.key][action] = existingPerms[feature.key]?.[action] === true;
      });
    });
    setFormPermissions(merged);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormName('');
    setFormDescription('');
    setFormPermissions(buildDefaultPermissions());
  };

  const handlePermissionToggle = (featureKey, action) => {
    setFormPermissions((prev) => ({
      ...prev,
      [featureKey]: {
        ...prev[featureKey],
        [action]: !prev[featureKey]?.[action],
      },
    }));
  };

  const handleSelectAll = (featureKey) => {
    const feature = permissionFeatures.find((f) => f.key === featureKey);
    if (!feature) return;
    const allEnabled = feature.actions.every((action) => formPermissions[featureKey]?.[action]);
    setFormPermissions((prev) => {
      const updated = { ...prev };
      updated[featureKey] = {};
      feature.actions.forEach((action) => {
        updated[featureKey][action] = !allEnabled;
      });
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      showError('Role name is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        permissions: formPermissions,
      };

      if (editingRole) {
        await updateRole(editingRole.id || editingRole._id, payload);
        showSuccess('Role updated successfully');
      } else {
        await createRole(payload);
        showSuccess('Role created successfully');
      }
      handleCloseModal();
      fetchRoles();
    } catch (err) {
      showError(err.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (role) => {
    setDeletingRole(role);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRole) return;
    try {
      setDeleting(true);
      await deleteRole(deletingRole.id || deletingRole._id);
      showSuccess('Role deleted successfully');
      setShowDeleteDialog(false);
      setDeletingRole(null);
      fetchRoles();
    } catch (err) {
      showError(err.message || 'Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Roles &amp; Permissions</h1>
        <Button onClick={handleOpenCreate}>Create Role</Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchRoles}>Retry</Button>
        </div>
      ) : roles.length === 0 ? (
        <div className={styles.empty}>
          <p>No roles found. Create your first role to get started.</p>
          <Button onClick={handleOpenCreate}>Create Role</Button>
        </div>
      ) : (
        <div className={styles.rolesGrid}>
          {roles.map((role) => {
            const permCount = countPermissions(role.permissions);
            const isSystem = role.isSystem === true;
            return (
              <div key={role.id || role._id} className={styles.roleCard}>
                <div className={styles.roleHeader}>
                  <span className={styles.roleName}>{role.name}</span>
                  {isSystem && <Badge variant="warning">System</Badge>}
                </div>
                {role.description && (
                  <p className={styles.roleDesc}>{role.description}</p>
                )}
                <div className={styles.roleFooter}>
                  <span className={styles.permCount}>
                    {permCount} of {totalPermissionCount} permissions enabled
                  </span>
                  <div className={styles.roleActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => handleOpenEdit(role)}
                      disabled={isSystem}
                      title={isSystem ? 'System roles cannot be edited' : 'Edit role'}
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleOpenDelete(role)}
                      disabled={isSystem}
                      title={isSystem ? 'System roles cannot be deleted' : 'Delete role'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="lg"
      >
        <div className={styles.form}>
          <Input
            label="Role Name"
            placeholder="e.g. Operations Manager"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Brief description of this role's responsibilities..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={2}
          />

          {/* Permission Matrix */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', marginBottom: 'var(--spacing-2)', display: 'block' }}>
              Permissions
            </label>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.permTable}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    {allActions.map((action) => (
                      <th key={action} style={{ textAlign: 'center' }}>{action}</th>
                    ))}
                    <th style={{ textAlign: 'center' }}>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionFeatures.map((feature) => {
                    const allEnabled = feature.actions.every(
                      (action) => formPermissions[feature.key]?.[action]
                    );
                    return (
                      <tr key={feature.key}>
                        <td className={styles.permFeature}>{feature.label}</td>
                        {allActions.map((action) => (
                          <td key={action} style={{ textAlign: 'center' }}>
                            {feature.actions.includes(action) ? (
                              <input
                                type="checkbox"
                                className={styles.permCheckbox}
                                checked={!!formPermissions[feature.key]?.[action]}
                                onChange={() => handlePermissionToggle(feature.key, action)}
                              />
                            ) : (
                              <span style={{ color: 'var(--text-tertiary)' }}>&mdash;</span>
                            )}
                          </td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.selectAllBtn}
                            onClick={() => handleSelectAll(feature.key)}
                          >
                            {allEnabled ? 'Deselect All' : 'Select All'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingRole(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message={`Are you sure you want to delete the "${deletingRole?.name}" role? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Roles;
