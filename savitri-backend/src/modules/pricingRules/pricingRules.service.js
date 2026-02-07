const { PricingRule } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');

class PricingRulesService {
  /**
   * Get all pricing rules (paginated)
   */
  async getAll(query) {
    const { page, limit, type, isActive } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const [rules, total] = await Promise.all([
      PricingRule.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ priority: -1, createdAt: -1 })
        .lean(),
      PricingRule.countDocuments(filter),
    ]);

    return {
      rules: formatDocuments(rules),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get rule by ID
   */
  async getById(id) {
    const rule = await PricingRule.findById(id).lean();

    if (!rule) {
      throw ApiError.notFound('Pricing rule not found');
    }

    return formatDocument(rule);
  }

  /**
   * Create pricing rule
   */
  async create(data) {
    const rule = await PricingRule.create(data);
    return formatDocument(rule.toObject());
  }

  /**
   * Update pricing rule
   */
  async update(id, data) {
    const rule = await PricingRule.findById(id);

    if (!rule) {
      throw ApiError.notFound('Pricing rule not found');
    }

    Object.assign(rule, data);
    await rule.save();

    return formatDocument(rule.toObject());
  }

  /**
   * Delete pricing rule
   */
  async delete(id) {
    const rule = await PricingRule.findById(id);

    if (!rule) {
      throw ApiError.notFound('Pricing rule not found');
    }

    await rule.deleteOne();
    return { message: 'Pricing rule deleted' };
  }

  /**
   * Find the best matching pricing rule for a given date and time
   * Returns the highest-priority active rule that matches
   */
  async findMatchingRule(date, startTime) {
    const rules = await PricingRule.find({ isActive: true })
      .sort({ priority: -1 })
      .lean();

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0=Sun, 6=Sat

    for (const rule of rules) {
      if (this._ruleMatches(rule, bookingDate, dayOfWeek, startTime)) {
        return formatDocument(rule);
      }
    }

    return null;
  }

  /**
   * Check if a rule matches the given conditions
   */
  _ruleMatches(rule, bookingDate, dayOfWeek, startTime) {
    const conditions = rule.conditions || {};

    switch (rule.type) {
      case 'WEEKEND':
        if (conditions.daysOfWeek && conditions.daysOfWeek.length > 0) {
          return conditions.daysOfWeek.includes(dayOfWeek);
        }
        return dayOfWeek === 0 || dayOfWeek === 6; // Sun or Sat

      case 'PEAK_HOURS':
      case 'OFF_PEAK_HOURS':
        if (conditions.startTime && conditions.endTime && startTime) {
          return startTime >= conditions.startTime && startTime < conditions.endTime;
        }
        return false;

      case 'SEASONAL':
        if (conditions.startDate && conditions.endDate) {
          const start = new Date(conditions.startDate);
          const end = new Date(conditions.endDate);
          return bookingDate >= start && bookingDate <= end;
        }
        return false;

      case 'HOLIDAY':
      case 'SPECIAL':
        if (conditions.specificDates && conditions.specificDates.length > 0) {
          const dateStr = bookingDate.toISOString().split('T')[0];
          return conditions.specificDates.some(d => {
            const sd = new Date(d).toISOString().split('T')[0];
            return sd === dateStr;
          });
        }
        return false;

      default:
        return false;
    }
  }
}

module.exports = new PricingRulesService();
