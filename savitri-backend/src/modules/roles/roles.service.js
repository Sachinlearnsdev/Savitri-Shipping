// src/modules/roles/roles.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

class RolesService {
  /**
   * Get all roles
   */
  async getAll() {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { adminUsers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return roles;
  }

  /**
   * Get role by ID
   */
  async getById(id) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { adminUsers: true },
        },
      },
    });

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    return role;
  }

  /**
   * Create role
   */
  async create(data) {
    const { name, description, permissions } = data;

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw ApiError.conflict('Role name already exists');
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions,
        isSystem: false,
      },
    });

    return role;
  }

  /**
   * Update role
   */
  async update(id, data) {
    const { name, description, permissions } = data;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw ApiError.notFound('Role not found');
    }

    // Prevent updating system roles
    if (existingRole.isSystem) {
      throw ApiError.forbidden('Cannot update system roles');
    }

    // If name is being updated, check if it's already taken
    if (name && name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name },
      });

      if (nameExists) {
        throw ApiError.conflict('Role name already exists');
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions,
      },
    });

    return role;
  }

  /**
   * Delete role
   */
  async delete(id) {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { adminUsers: true },
        },
      },
    });

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      throw ApiError.forbidden('Cannot delete system roles');
    }

    // Prevent deleting role if it has users
    if (role._count.adminUsers > 0) {
      throw ApiError.forbidden('Cannot delete role with assigned users. Reassign users first');
    }

    await prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }
}

module.exports = new RolesService();