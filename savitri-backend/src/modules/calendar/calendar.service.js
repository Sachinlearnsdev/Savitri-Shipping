const { OperatingCalendar } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');

class CalendarService {
  /**
   * Get calendar entries for a month or date range
   */
  async getCalendar(query) {
    const filter = {};

    if (query.month) {
      // YYYY-MM format
      const [year, month] = query.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59); // last day of month
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (query.startDate && query.endDate) {
      filter.date = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    const entries = await OperatingCalendar.find(filter)
      .sort({ date: 1 })
      .lean();

    return formatDocuments(entries);
  }

  /**
   * Update a single day's status
   */
  async updateDay(data, adminUserId) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const entry = await OperatingCalendar.findOneAndUpdate(
      { date },
      {
        date,
        status: data.status,
        reason: data.status === 'CLOSED' ? (data.reason || null) : null,
        notes: data.notes || null,
        updatedBy: adminUserId,
      },
      { upsert: true, new: true }
    ).lean();

    return formatDocument(entry);
  }

  /**
   * Bulk update multiple days
   */
  async bulkUpdate(dates, adminUserId) {
    const operations = dates.map(item => {
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);

      return {
        updateOne: {
          filter: { date },
          update: {
            $set: {
              date,
              status: item.status,
              reason: item.status === 'CLOSED' ? (item.reason || null) : null,
              notes: item.notes || null,
              updatedBy: adminUserId,
            },
          },
          upsert: true,
        },
      };
    });

    await OperatingCalendar.bulkWrite(operations);

    // Return updated entries
    const updatedDates = dates.map(d => {
      const date = new Date(d.date);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const entries = await OperatingCalendar.find({ date: { $in: updatedDates } })
      .sort({ date: 1 })
      .lean();

    return formatDocuments(entries);
  }

  /**
   * Get open/closed status for a date range (for public calendar strip)
   */
  async getDateRangeStatus(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Find all CLOSED entries in range
    const closedEntries = await OperatingCalendar.find({
      date: { $gte: start, $lte: end },
      status: 'CLOSED',
    }).select('date').lean();

    const closedDates = new Set(
      closedEntries.map((e) => e.date.toISOString().split('T')[0])
    );

    // Generate array of dates with status
    const result = [];
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        isOpen: !closedDates.has(dateStr),
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  /**
   * Check if a specific date is open for operations
   */
  async isDayOpen(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const entry = await OperatingCalendar.findOne({ date: d }).lean();

    // If no entry exists, default to OPEN
    if (!entry) return true;

    return entry.status === 'OPEN';
  }
}

module.exports = new CalendarService();
