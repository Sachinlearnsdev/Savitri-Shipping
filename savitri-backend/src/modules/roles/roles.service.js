// src/modules/roles/roles.service.js
const { Role, AdminUser } = require("../../models");
const ApiError = require("../../utils/ApiError");
const {
  formatDocument,
  formatDocuments,
} = require("../../utils/responseFormatter");

class RolesService {
  /**
   * Get all roles
   */
  async getAll() {
    const roles = await Role.find().sort({ createdAt: -1 }).lean();

    // Get admin user counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const adminUsersCount = await AdminUser.countDocuments({
          roleId: role._id,
        });
        return {
          ...role,
          adminUsersCount,
        };
      })
    );

    return formatDocuments(rolesWithCounts);
  }

  /**
   * Get role by ID
   */
  async getById(id) {
    const role = await Role.findById(id).lean();

    if (!role) {
      throw ApiError.notFound("Role not found");
    }

    // Get admin user count
    const adminUsersCount = await AdminUser.countDocuments({ roleId: id });

    const formatted = formatDocument(role);
    formatted.adminUsersCount = adminUsersCount;

    return formatted;
  }

  /**
   * Create role
   */
  async create(data) {
    const { name, description, permissions } = data;

    // Check if role name already exists
    const existingRole = await Role.findOne({ name });

    if (existingRole) {
      throw ApiError.conflict("Role name already exists");
    }

    const role = await Role.create({
      name,
      description,
      permissions,
      isSystem: false,
    });

    return formatDocument(role.toObject());
  }

  /**
   * Update role
   */
  async update(id, data) {
    const { name, description, permissions } = data;

    // Check if role exists
    const existingRole = await Role.findById(id);

    if (!existingRole) {
      throw ApiError.notFound("Role not found");
    }

    // Prevent updating system roles
    if (existingRole.isSystem) {
      throw ApiError.forbidden("Cannot update system roles");
    }

    // If name is being updated, check if it's already taken
    if (name && name !== existingRole.name) {
      const nameExists = await Role.findOne({ name });

      if (nameExists) {
        throw ApiError.conflict("Role name already exists");
      }
    }

    const role = await Role.findByIdAndUpdate(
      id,
      { name, description, permissions },
      { new: true }
    ).lean();

    return formatDocument(role);
  }

  /**
   * Delete role
   */
  async delete(id) {
    // Check if role exists
    const role = await Role.findById(id);

    if (!role) {
      throw ApiError.notFound("Role not found");
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      throw ApiError.forbidden("Cannot delete system roles");
    }

    // Check if role has assigned users
    const adminUsersCount = await AdminUser.countDocuments({ roleId: id });

    if (adminUsersCount > 0) {
      throw ApiError.forbidden(
        "Cannot delete role with assigned users. Reassign users first"
      );
    }

    await Role.findByIdAndDelete(id);

    return { message: "Role deleted successfully" };
  }
}

module.exports = new RolesService();
