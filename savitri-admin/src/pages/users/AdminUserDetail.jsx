import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { getAdminUserById, updateAdminUser, updateAdminUserStatus, deleteAdminUser } from '../../services/users.service';
import { getAllRoles } from '../../services/roles.service';
import {
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
} from '../../utils/constants';
import styles from './AdminUserDetail.module.css';

const statusOptions = Object.entries(USER_STATUS_LABELS)
  .filter(([value]) => value !== USER_STATUS.DELETED)
  .map(([value, label]) => ({ value, label }));

const permissionFeatures = [
  { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { key: 'adminUsers', label: 'Admin Users', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'roles', label: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'customers', label: 'Customers', actions: ['view', 'edit', 'delete'] },
  { key: 'speedBoats', label: 'Speed Boats', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'bookings', label: 'Bookings', actions: ['view', 'create', 'edit', 'cancel', 'refund'] },
  { key: 'calendar', label: 'Calendar', actions: ['view', 'edit'] },
  { key: 'pricingRules', label: 'Pricing Rules', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'settings', label: 'Settings', actions: ['view', 'edit'] },
];

// Collect all unique actions across all features for column headers
const allActions = [...new Set(permissionFeatures.flatMap((f) => f.actions))];

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role?.name === 'Admin' || currentUser?.role?.name === 'Super Admin';

  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Roles for edit dropdown
  const [roles, setRoles] = useState([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', roleId: '', status: USER_STATUS.ACTIVE });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminUserById(id);
      if (response.success) {
        setAdminUser(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  // Fetch roles for edit modal
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAllRoles();
        if (response.success) {
          const rolesList = response.data?.items || response.data || [];
          setRoles(rolesList);
        }
      } catch (err) {
        console.error('Failed to load roles:', err);
      }
    };
    fetchRoles();
  }, []);

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true);
      await updateAdminUserStatus(id, status);
      showSuccess(`User status updated to ${USER_STATUS_LABELS[status]}`);
      fetchUser();
    } catch (err) {
      showError(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (!adminUser) return;
    setFormData({
      name: adminUser.name || '',
      email: adminUser.email || '',
      phone: adminUser.phone || '',
      roleId: adminUser.roleId?.id || adminUser.roleId?._id || adminUser.role?.id || adminUser.role?._id || '',
      status: adminUser.status || USER_STATUS.ACTIVE,
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitEdit = async () => {
    if (!formData.name || !formData.email || !formData.roleId) {
      showError('Please fill in all required fields');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        roleId: formData.roleId,
        status: formData.status,
      };
      await updateAdminUser(id, payload);
      showSuccess('Admin user updated successfully');
      handleCloseEdit();
      fetchUser();
    } catch (err) {
      showError(err.message || 'Failed to update admin user');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteAdminUser(id);
      showSuccess('Admin user deleted successfully');
      setShowDeleteDialog(false);
      navigate('/users/admins');
    } catch (err) {
      showError(err.message || 'Failed to delete admin user');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Get permissions from the user's role
  const getUserPermissions = () => {
    if (!adminUser) return {};
    return adminUser.roleId?.permissions || adminUser.role?.permissions || {};
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
          <Button variant="outline" onClick={() => navigate('/users/admins')}>
            Back to Admin Users
          </Button>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Admin user not found</p>
          <Button variant="outline" onClick={() => navigate('/users/admins')}>
            Back to Admin Users
          </Button>
        </div>
      </div>
    );
  }

  const permissions = getUserPermissions();
  const roleName = adminUser.role?.name || adminUser.roleId?.name || '-';
  const roleOptions = roles.map((r) => ({
    value: r.id || r._id,
    label: r.name,
  }));

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/users/admins')}>
        Back to Admin Users
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{adminUser.name}</h1>
          <Badge variant={USER_STATUS_COLORS[adminUser.status] || 'default'} size="lg">
            {USER_STATUS_LABELS[adminUser.status] || adminUser.status}
          </Badge>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {/* Profile Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Information</h2>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {getInitial(adminUser.name)}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{adminUser.name}</span>
              <span className={styles.profileEmail}>{adminUser.email}</span>
            </div>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{adminUser.phone || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoValue}>
                <Badge variant="info">{roleName}</Badge>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>
                <Badge variant={USER_STATUS_COLORS[adminUser.status] || 'default'}>
                  {USER_STATUS_LABELS[adminUser.status] || adminUser.status}
                </Badge>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Login</span>
              <span className={styles.infoValue}>
                {formatDateTime(adminUser.lastLoginAt || adminUser.lastLogin)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>
                {formatDate(adminUser.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Role & Permissions Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Role &amp; Permissions</h2>
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <span className={styles.infoLabel}>Role</span>
            <div style={{ marginTop: 'var(--spacing-1)' }}>
              <Badge variant="info" size="lg">{roleName}</Badge>
            </div>
          </div>
          <table className={styles.permGrid}>
            <thead>
              <tr>
                <th>Feature</th>
                {allActions.map((action) => (
                  <th key={action} style={{ textAlign: 'center' }}>{action}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionFeatures.map((feature) => (
                <tr key={feature.key}>
                  <td className={styles.permFeature}>{feature.label}</td>
                  {allActions.map((action) => (
                    <td key={action} style={{ textAlign: 'center' }}>
                      {feature.actions.includes(action) ? (
                        permissions[feature.key]?.[action] ? (
                          <span className={styles.permCheck}>&#10003;</span>
                        ) : (
                          <span className={styles.permCross}>&#10005;</span>
                        )
                      ) : (
                        <span className={styles.permCross}>&mdash;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Actions</h2>
        <div className={styles.statusSection}>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Current Status</span>
            <Badge variant={USER_STATUS_COLORS[adminUser.status] || 'default'}>
              {USER_STATUS_LABELS[adminUser.status] || adminUser.status}
            </Badge>
          </div>

          <div className={styles.actionButtons}>
            <Button onClick={handleOpenEdit} size="sm">
              Edit User
            </Button>

            {adminUser.status !== USER_STATUS.ACTIVE && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(USER_STATUS.ACTIVE)}
                loading={actionLoading}
                size="sm"
              >
                Activate
              </Button>
            )}

            {adminUser.status !== USER_STATUS.INACTIVE && (
              <Button
                variant="secondary"
                onClick={() => handleStatusUpdate(USER_STATUS.INACTIVE)}
                loading={actionLoading}
                size="sm"
              >
                Deactivate
              </Button>
            )}

            {adminUser.status === USER_STATUS.LOCKED && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(USER_STATUS.ACTIVE)}
                loading={actionLoading}
                size="sm"
              >
                Unlock
              </Button>
            )}

            {isSuperAdmin && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteDialog(true)}
                size="sm"
              >
                Delete User
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Edit Admin User"
        size="lg"
      >
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Phone Number"
              type="text"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
            />
            <Select
              label="Role"
              options={roleOptions}
              value={formData.roleId}
              onChange={(value) => handleFormChange('roleId', value)}
              placeholder="Select a role"
              required
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleFormChange('status', value)}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={handleCloseEdit} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} loading={saving}>
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Admin User"
        message={`Are you sure you want to delete "${adminUser.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default AdminUserDetail;
