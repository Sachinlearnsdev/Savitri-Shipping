const { OperatingCalendar } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');

const WEATHER_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ heavy hail',
};

class CalendarService {
  constructor() {
    this._weatherCache = new Map();
    this._CACHE_TTL = 60 * 60 * 1000; // 1 hour
    this._currentWeatherCache = null;
    this._currentWeatherCacheTTL = 30 * 60 * 1000; // 30 minutes
  }

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

    const updateData = {
      date,
      status: data.status,
      reason: (data.status === 'CLOSED' || data.status === 'PARTIAL_CLOSED') ? (data.reason || null) : null,
      closedSlots: data.status === 'PARTIAL_CLOSED' ? (data.closedSlots || []) : [],
      notes: data.notes || null,
      updatedBy: adminUserId,
    };

    const entry = await OperatingCalendar.findOneAndUpdate(
      { date },
      updateData,
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

    // Find all CLOSED entries in range (PARTIAL_CLOSED is still open)
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

    return entry.status === 'OPEN' || entry.status === 'PARTIAL_CLOSED';
  }

  /**
   * Check if a specific time slot is available on a given date
   * Returns false if the slot overlaps with any closed periods on a PARTIAL_CLOSED day
   */
  async isSlotAvailable(date, startTime, endTime) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const entry = await OperatingCalendar.findOne({ date: d }).lean();

    if (!entry) return true;
    if (entry.status === 'OPEN') return true;
    if (entry.status === 'CLOSED') return false;

    // PARTIAL_CLOSED - check slot overlap
    if (entry.status === 'PARTIAL_CLOSED' && entry.closedSlots && entry.closedSlots.length > 0) {
      for (const slot of entry.closedSlots) {
        // Two ranges overlap if a1 < b2 AND b1 < a2
        if (startTime < slot.endTime && slot.startTime < endTime) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get weather data for a month (proxied from Open-Meteo APIs)
   * Returns daily summaries with wave height, wind speed, gusts, and safety recommendation
   */
  async getWeather(month) {
    // Check cache first
    const cached = this._weatherCache.get(month);
    if (cached && Date.now() - cached.timestamp < this._CACHE_TTL) {
      return cached.data;
    }

    // Parse month to get start and end dates
    const [year, mon] = month.split('-').map(Number);
    const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${year}-${String(mon).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Mumbai coordinates
    const lat = 18.9;
    const lon = 72.8;

    // Fetch marine and forecast data in parallel
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wind_wave_height,swell_wave_height&start_date=${startDate}&end_date=${endDate}&timezone=Asia/Kolkata`;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,weather_code&start_date=${startDate}&end_date=${endDate}&timezone=Asia/Kolkata`;

    const [marineRes, forecastRes] = await Promise.all([
      fetch(marineUrl),
      fetch(forecastUrl),
    ]);

    if (!marineRes.ok) {
      throw ApiError.badRequest('Failed to fetch marine weather data');
    }
    if (!forecastRes.ok) {
      throw ApiError.badRequest('Failed to fetch forecast weather data');
    }

    const marineData = await marineRes.json();
    const forecastData = await forecastRes.json();

    // Process hourly data into daily summaries
    const dailySummaries = {};
    const marineHourly = marineData.hourly || {};
    const forecastHourly = forecastData.hourly || {};
    const timeEntries = marineHourly.time || [];

    for (let i = 0; i < timeEntries.length; i++) {
      const dateKey = timeEntries[i].substring(0, 10); // 'YYYY-MM-DD'

      if (!dailySummaries[dateKey]) {
        dailySummaries[dateKey] = {
          waveHeights: [],
          windSpeeds: [],
          windGusts: [],
          weatherCodes: [],
          temperatures: [],
        };
      }

      const day = dailySummaries[dateKey];

      if (marineHourly.wave_height && marineHourly.wave_height[i] != null) {
        day.waveHeights.push(marineHourly.wave_height[i]);
      }
      if (forecastHourly.temperature_2m && forecastHourly.temperature_2m[i] != null) {
        day.temperatures.push(forecastHourly.temperature_2m[i]);
      }
      if (forecastHourly.wind_speed_10m && forecastHourly.wind_speed_10m[i] != null) {
        day.windSpeeds.push(forecastHourly.wind_speed_10m[i]);
      }
      if (forecastHourly.wind_gusts_10m && forecastHourly.wind_gusts_10m[i] != null) {
        day.windGusts.push(forecastHourly.wind_gusts_10m[i]);
      }
      if (forecastHourly.weather_code && forecastHourly.weather_code[i] != null) {
        day.weatherCodes.push(forecastHourly.weather_code[i]);
      }
    }

    // Build final result with recommendations
    const result = {};
    for (const [dateKey, day] of Object.entries(dailySummaries)) {
      const maxWaveHeight = day.waveHeights.length > 0 ? Math.max(...day.waveHeights) : 0;
      const maxWindSpeed = day.windSpeeds.length > 0 ? Math.max(...day.windSpeeds) : 0;
      const maxWindGusts = day.windGusts.length > 0 ? Math.max(...day.windGusts) : 0;
      const avgTemperature = day.temperatures.length > 0
        ? day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length
        : null;
      const weatherCode = this._getDominantWeatherCode(day.weatherCodes);

      let recommendation = 'safe';
      if (maxWaveHeight > 2 || maxWindSpeed > 40) {
        recommendation = 'dangerous';
      } else if (maxWaveHeight > 1.5 || maxWindSpeed > 30) {
        recommendation = 'caution';
      }

      result[dateKey] = {
        waveHeight: maxWaveHeight,
        windSpeed: maxWindSpeed,
        windGusts: maxWindGusts,
        temperature: avgTemperature !== null ? Math.round(avgTemperature) : null,
        weatherCode,
        recommendation,
      };
    }

    // Cache the result
    this._weatherCache.set(month, { data: result, timestamp: Date.now() });

    return result;
  }

  /**
   * Get current weather data for Mumbai (temperature, humidity, wind, waves, recommendation)
   * Cached for 30 minutes
   */
  async getCurrentWeather() {
    // Check cache
    if (this._currentWeatherCache && Date.now() - this._currentWeatherCache.timestamp < this._currentWeatherCacheTTL) {
      return this._currentWeatherCache.data;
    }

    // Mumbai coordinates
    const lat = 18.9;
    const lon = 72.8;

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m&timezone=Asia/Kolkata`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height&timezone=Asia/Kolkata`;

    const [forecastRes, marineRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(marineUrl),
    ]);

    if (!forecastRes.ok) {
      throw ApiError.badRequest('Failed to fetch current weather data');
    }

    const forecastData = await forecastRes.json();
    const current = forecastData.current || {};

    let waveHeight = 0;
    if (marineRes.ok) {
      const marineData = await marineRes.json();
      waveHeight = marineData.current?.wave_height || 0;
    }

    const temperature = current.temperature_2m || 0;
    const humidity = current.relative_humidity_2m || 0;
    const weatherCode = current.weather_code || 0;
    const windSpeed = current.wind_speed_10m || 0;
    const windGusts = current.wind_gusts_10m || 0;
    const weatherDescription = WEATHER_DESCRIPTIONS[weatherCode] || 'Unknown';

    let recommendation = 'safe';
    if (waveHeight > 2 || windSpeed > 40) {
      recommendation = 'dangerous';
    } else if (waveHeight > 1.5 || windSpeed > 30) {
      recommendation = 'caution';
    }

    const result = {
      temperature,
      humidity,
      weatherCode,
      weatherDescription,
      windSpeed,
      windGusts,
      waveHeight,
      recommendation,
    };

    // Cache
    this._currentWeatherCache = { data: result, timestamp: Date.now() };

    return result;
  }

  /**
   * Find the most common weather code in an array
   */
  _getDominantWeatherCode(codes) {
    if (!codes || codes.length === 0) return 0;

    const frequency = {};
    let maxCount = 0;
    let dominant = codes[0];

    for (const code of codes) {
      frequency[code] = (frequency[code] || 0) + 1;
      if (frequency[code] > maxCount) {
        maxCount = frequency[code];
        dominant = code;
      }
    }

    return dominant;
  }
}

module.exports = new CalendarService();
