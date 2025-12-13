// src/modules/settings/settings.service.js
const { Setting } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { SETTINGS_GROUPS } = require("../../config/constants");

class SettingsService {
  /**
   * Get all settings
   */
  async getAll() {
    const settings = await Setting.find().lean();

    // Group settings by group
    const grouped = {};
    settings.forEach((setting) => {
      if (!grouped[setting.group]) {
        grouped[setting.group] = {};
      }
      grouped[setting.group][setting.key] = setting.value;
    });

    return grouped;
  }

  /**
   * Get settings by group
   */
  async getByGroup(group) {
    const settings = await Setting.find({ group }).lean();

    if (settings.length === 0) {
      throw ApiError.notFound(`Settings for group '${group}' not found`);
    }

    // Return as single object for convenience
    const result = {};
    settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });

    // If there's only one key (common pattern), return its value directly
    if (settings.length === 1) {
      return settings[0].value;
    }

    return result;
  }

  /**
   * Update settings by group
   */
  async updateByGroup(group, data) {
    // Validate group
    const validGroups = Object.values(SETTINGS_GROUPS);
    if (!validGroups.includes(group)) {
      throw ApiError.badRequest("Invalid settings group");
    }

    // For most groups, we store all data under a single 'config' key
    const key = group === SETTINGS_GROUPS.CONTENT ? "pages" : "config";

    // Upsert setting
    const setting = await Setting.findOneAndUpdate(
      { group, key },
      { group, key, value: data },
      { upsert: true, new: true }
    ).lean();

    return setting.value;
  }

  /**
   * Upload company logo
   */
  async uploadLogo(file) {
    if (!file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const logoUrl = `/uploads/${file.filename}`;

    // Get current general settings
    const currentSettings = await this.getByGroup(SETTINGS_GROUPS.GENERAL);

    // Update with new logo
    const updatedSettings = {
      ...currentSettings,
      companyLogo: logoUrl,
    };

    await this.updateByGroup(SETTINGS_GROUPS.GENERAL, updatedSettings);

    return { logoUrl };
  }
}

module.exports = new SettingsService();
