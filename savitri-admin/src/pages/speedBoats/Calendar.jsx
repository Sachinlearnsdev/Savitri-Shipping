import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import useUIStore from '../../store/uiStore';
import { getCalendar, updateDay, getWeather } from '../../services/calendar.service';
import { CALENDAR_STATUS, CLOSE_REASONS } from '../../utils/constants';
import styles from './Calendar.module.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EMPTY_SLOT = { startTime: '', endTime: '', reason: '' };

const Calendar = () => {
  const { showSuccess, showError } = useUIStore();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Day modal state
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayStatus, setDayStatus] = useState(CALENDAR_STATUS.OPEN);
  const [closeReason, setCloseReason] = useState('');
  const [closedSlots, setClosedSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const response = await getCalendar({ month: monthStr });
      if (response.success) {
        const data = response.data || [];
        const mapped = {};
        const items = Array.isArray(data) ? data : data.items || [];
        items.forEach((entry) => {
          const dateKey = entry.date ? entry.date.split('T')[0] : null;
          if (dateKey) {
            mapped[dateKey] = {
              status: entry.status,
              reason: entry.reason || '',
              closedSlots: entry.closedSlots || [],
            };
          }
        });
        setCalendarData(mapped);
      }

      // Fetch weather (non-critical)
      try {
        const weatherRes = await getWeather({ month: monthStr });
        if (weatherRes.success) {
          setWeatherData(weatherRes.data || {});
        }
      } catch {
        // Weather fetch failure is non-critical
      }
    } catch (err) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (day) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isPast = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isPastDate = (dateKey) => {
    const d = new Date(dateKey);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayStart;
  };

  const handleDayClick = (day) => {
    if (isPast(day)) return;

    const dateKey = formatDateKey(day);
    const existing = calendarData[dateKey];

    setSelectedDate({
      day,
      dateKey,
      displayDate: `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`,
    });
    setDayStatus(existing?.status || CALENDAR_STATUS.OPEN);
    setCloseReason(existing?.reason || '');
    setClosedSlots(existing?.closedSlots?.length > 0 ? [...existing.closedSlots] : []);
    setShowDayModal(true);
  };

  const handleAddSlot = () => {
    setClosedSlots((prev) => [...prev, { ...EMPTY_SLOT }]);
  };

  const handleRemoveSlot = (index) => {
    setClosedSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    setClosedSlots((prev) => prev.map((slot, i) => i === index ? { ...slot, [field]: value } : slot));
  };

  const handleSaveDay = async () => {
    if (!selectedDate) return;

    try {
      setSaving(true);
      const payload = {
        date: selectedDate.dateKey,
        status: dayStatus,
      };
      if (dayStatus === CALENDAR_STATUS.CLOSED && closeReason) {
        payload.reason = closeReason;
      }
      if (dayStatus === CALENDAR_STATUS.PARTIAL_CLOSED) {
        if (closeReason) payload.reason = closeReason;
        payload.closedSlots = closedSlots.filter((s) => s.startTime && s.endTime);
      }

      await updateDay(payload);
      setCalendarData((prev) => ({
        ...prev,
        [selectedDate.dateKey]: {
          status: dayStatus,
          reason: (dayStatus === CALENDAR_STATUS.CLOSED || dayStatus === CALENDAR_STATUS.PARTIAL_CLOSED) ? closeReason : '',
          closedSlots: dayStatus === CALENDAR_STATUS.PARTIAL_CLOSED ? closedSlots.filter((s) => s.startTime && s.endTime) : [],
        },
      }));
      showSuccess('Calendar updated successfully');
      setShowDayModal(false);
    } catch (err) {
      showError(err.message || 'Failed to update calendar');
    } finally {
      setSaving(false);
    }
  };

  // Count dangerous weather days
  const dangerousDays = Object.entries(weatherData).filter(
    ([dateKey, w]) => w.recommendation === 'dangerous' && !isPastDate(dateKey)
  );

  const getStatusClass = (status) => {
    if (status === CALENDAR_STATUS.OPEN) return styles.dayOpen;
    if (status === CALENDAR_STATUS.PARTIAL_CLOSED) return styles.dayPartial;
    return styles.dayClosed;
  };

  const getStatusLabel = (status) => {
    if (status === CALENDAR_STATUS.OPEN) return 'Open';
    if (status === CALENDAR_STATUS.PARTIAL_CLOSED) return 'Partial';
    return 'Closed';
  };

  const getWeatherClass = (recommendation) => {
    if (recommendation === 'dangerous') return styles.weatherDangerous;
    if (recommendation === 'caution') return styles.weatherCaution;
    return styles.weatherSafe;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayEmpty}`} />
      );
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const entry = calendarData[dateKey];
      const weather = weatherData[dateKey];
      const status = entry?.status || CALENDAR_STATUS.OPEN;
      const past = isPast(day);

      const cellClasses = [
        styles.dayCell,
        getStatusClass(status),
        past && styles.dayPast,
        isToday(day) && styles.dayToday,
      ]
        .filter(Boolean)
        .join(' ');

      cells.push(
        <div
          key={day}
          className={cellClasses}
          onClick={() => handleDayClick(day)}
        >
          <span className={styles.dayNumber}>{day}</span>
          <span className={styles.dayStatus}>
            {getStatusLabel(status)}
          </span>
          {entry?.reason && (status === CALENDAR_STATUS.CLOSED || status === CALENDAR_STATUS.PARTIAL_CLOSED) && (
            <span className={styles.dayReason}>{CLOSE_REASONS[entry.reason] || entry.reason}</span>
          )}
          {weather && !past && (
            <span className={`${styles.weatherIndicator} ${getWeatherClass(weather.recommendation)}`}>
              {weather.waveHeight.toFixed(1)}m / {Math.round(weather.windSpeed)}km/h
            </span>
          )}
        </div>
      );
    }

    return cells;
  };

  // Weather data for selected day in modal
  const selectedWeather = selectedDate ? weatherData[selectedDate.dateKey] : null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Calendar & Weather</h1>
      </div>

      {/* Weather Warning Banner */}
      {dangerousDays.length > 0 && (
        <div className={styles.weatherBanner}>
          <span className={styles.weatherBannerIcon}>&#9888;</span>
          <span>
            Weather Warning: {dangerousDays.length} upcoming day{dangerousDays.length !== 1 ? 's' : ''} with dangerous marine conditions
          </span>
        </div>
      )}

      {/* Month Navigation */}
      <div className={styles.monthNav}>
        <button className={styles.navBtn} onClick={handlePrevMonth}>
          &larr;
        </button>
        <span className={styles.monthLabel}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button className={styles.navBtn} onClick={handleNextMonth}>
          &rarr;
        </button>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotOpen}`} />
          <span>Open</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotPartial}`} />
          <span>Partial Close</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotClosed}`} />
          <span>Closed</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotPast}`} />
          <span>Past</span>
        </div>
        <span className={styles.legendSeparator}>|</span>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotSafe}`} />
          <span>Safe</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotCaution}`} />
          <span>Caution</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotDangerous}`} />
          <span>Dangerous</span>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchCalendar}>Retry</Button>
        </div>
      ) : (
        <div className={styles.calendarCard}>
          <div className={styles.calendarGrid}>
            {/* Day headers */}
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className={styles.dayHeader}>
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {renderCalendarDays()}
          </div>
        </div>
      )}

      {/* Day Edit Modal */}
      <Modal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        title="Update Day Status"
        size="md"
      >
        <div className={styles.dayModal}>
          <p className={styles.dayModalDate}>{selectedDate?.displayDate}</p>

          {/* Weather Info */}
          {selectedWeather && (
            <dl className={styles.modalWeather}>
              <dt>Wave Height</dt>
              <dd>{selectedWeather.waveHeight.toFixed(1)} m</dd>
              <dt>Wind Speed</dt>
              <dd>{Math.round(selectedWeather.windSpeed)} km/h</dd>
              <dt>Wind Gusts</dt>
              <dd>{Math.round(selectedWeather.windGusts)} km/h</dd>
              <dt>Recommendation</dt>
              <dd className={
                selectedWeather.recommendation === 'dangerous' ? styles.recommendationDangerous
                  : selectedWeather.recommendation === 'caution' ? styles.recommendationCaution
                    : styles.recommendationSafe
              }>
                {selectedWeather.recommendation === 'dangerous' ? 'Dangerous'
                  : selectedWeather.recommendation === 'caution' ? 'Caution'
                    : 'Safe'}
              </dd>
            </dl>
          )}

          {/* 3-way Status Toggle */}
          <div className={styles.statusToggle}>
            <button
              className={`${styles.statusOption} ${dayStatus === CALENDAR_STATUS.OPEN ? styles.statusOptionActive : ''}`}
              onClick={() => setDayStatus(CALENDAR_STATUS.OPEN)}
            >
              Open
            </button>
            <button
              className={`${styles.statusOption} ${dayStatus === CALENDAR_STATUS.PARTIAL_CLOSED ? styles.statusOptionActive : ''}`}
              onClick={() => {
                setDayStatus(CALENDAR_STATUS.PARTIAL_CLOSED);
                if (closedSlots.length === 0) setClosedSlots([{ ...EMPTY_SLOT }]);
              }}
            >
              Partial Close
            </button>
            <button
              className={`${styles.statusOption} ${dayStatus === CALENDAR_STATUS.CLOSED ? styles.statusOptionActive : ''}`}
              onClick={() => setDayStatus(CALENDAR_STATUS.CLOSED)}
            >
              Closed
            </button>
          </div>

          {/* Closed Reason (for CLOSED and PARTIAL_CLOSED) */}
          {(dayStatus === CALENDAR_STATUS.CLOSED || dayStatus === CALENDAR_STATUS.PARTIAL_CLOSED) && (
            <div>
              <label className={styles.closedSlotsLabel}>
                Reason for Closure
              </label>
              <select
                className={styles.reasonSelect}
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
              >
                <option value="">Select reason...</option>
                {Object.entries(CLOSE_REASONS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Closed Slots (for PARTIAL_CLOSED) */}
          {dayStatus === CALENDAR_STATUS.PARTIAL_CLOSED && (
            <div className={styles.closedSlotsSection}>
              <label className={styles.closedSlotsLabel}>Closed Time Slots</label>
              {closedSlots.map((slot, index) => (
                <div key={index} className={styles.closedSlotRow}>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                  />
                  <span style={{ color: 'var(--text-tertiary)' }}>to</span>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                  />
                  <select
                    className={styles.slotReasonSelect}
                    value={slot.reason}
                    onChange={(e) => handleSlotChange(index, 'reason', e.target.value)}
                  >
                    <option value="">Reason...</option>
                    {Object.entries(CLOSE_REASONS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button
                    className={styles.removeSlotBtn}
                    onClick={() => handleRemoveSlot(index)}
                    title="Remove slot"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button className={styles.addSlotBtn} onClick={handleAddSlot}>
                + Add Slot
              </button>
            </div>
          )}

          <div className={styles.dayModalActions}>
            <Button variant="ghost" onClick={() => setShowDayModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveDay} loading={saving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
