import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { getAllAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../services/users.service';
import { getAllRoles } from '../../services/roles.service';
import {
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  DEFAULT_PAGE_SIZE,
} from '../../utils/constants';
import styles from './AdminUsers.module.css';

const statusOptions = Object.entries(USER_STATUS_LABELS)
  .filter(([value]) => value !== USER_STATUS.DELETED)
  .map(([value, label]) => ({ value, label }));
const filterStatusOptions = [{ value: '', label: 'All Statuses' }, ...statusOptions];

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  roleId: '',
  status: USER_STATUS.ACTIVE,
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';

  // List state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Roles for dropdown
  const [roles, setRoles] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch roles for dropdown
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.roleId = roleFilter;

      const response = await getAllAdminUsers(params);
      if (response.success) {
        setUsers(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (adminUser) => {
    setEditingUser(adminUser);
    setFormData({
      name: adminUser.name || '',
      email: adminUser.email || '',
      phone: adminUser.phone || '',
      password: '',
      roleId: adminUser.roleId?.id || adminUser.roleId?._id || adminUser.role?.id || adminUser.role?._id || '',
      status: adminUser.status || USER_STATUS.ACTIVE,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.roleId) {
      showError('Please fill in all required fields (Name, Email, Role)');
      return;
    }
    if (!editingUser && !formData.password) {
      showError('Password is required for new admin users');
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

      if (editingUser) {
        await updateAdminUser(editingUser.id || editingUser._id, payload);
        showSuccess('Admin user updated successfully');
      } else {
        payload.password = formData.password;
        await createAdminUser(payload);
        showSuccess('Admin user created successfully');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to save admin user');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (adminUser) => {
    setDeletingUser(adminUser);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setDeleting(true);
      await deleteAdminUser(deletingUser.id || deletingUser._id);
      showSuccess('Admin user deleted successfully');
      setShowDeleteDialog(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to delete admin user');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const roleOptions = roles.map((r) => ({
    value: r.id || r._id,
    label: r.name,
  }));
  const filterRoleOptions = [{ value: '', label: 'All Roles' }, ...roleOptions];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Users</h1>
        {isSuperAdmin && (
          <Button onClick={handleOpenCreate}>Add Admin</Button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchInputWrapper}>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={filterRoleOptions}
          value={roleFilter}
          onChange={(val) => { setRoleFilter(val); setPage(1); }}
          placeholder="All Roles"
        />
        <Select
          options={filterStatusOptions}
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
          placeholder="All Statuses"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchUsers}>Retry</Button>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No admin users found.</p>
            {isSuperAdmin && (
              <Button onClick={handleOpenCreate}>Add Admin</Button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((adminUser) => (
                  <tr key={adminUser.id || adminUser._id}>
                    <td
                      className={styles.userName}
                      onClick={() => navigate(`/users/admins/${adminUser.id || adminUser._id}`)}
                    >
                      {adminUser.name}
                    </td>
                    <td>{adminUser.email}</td>
                    <td>{adminUser.phone || '-'}</td>
                    <td>
                      <Badge variant="info">
                        {adminUser.role?.name || adminUser.roleId?.name || '-'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={USER_STATUS_COLORS[adminUser.status] || 'default'}>
                        {USER_STATUS_LABELS[adminUser.status] || adminUser.status}
                      </Badge>
                    </td>
                    <td>{formatDate(adminUser.lastLoginAt || adminUser.lastLogin)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionBtn} ${styles.viewBtn}`}
                          onClick={() => navigate(`/users/admins/${adminUser.id || adminUser._id}`)}
                          title="View"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() => handleOpenEdit(adminUser)}
                          title="Edit user"
                        >
                          Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleOpenDelete(adminUser)}
                            title="Delete user"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit Admin User' : 'Add New Admin'}
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
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              required
            />
          )}
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleFormChange('status', value)}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingUser(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin User"
        message={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default AdminUsers;
