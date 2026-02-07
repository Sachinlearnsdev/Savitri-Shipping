import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import useUIStore from '../../store/uiStore';
import { getCalendar, updateDay } from '../../services/calendar.service';
import { CALENDAR_STATUS, CLOSE_REASONS } from '../../utils/constants';
import styles from './Calendar.module.css';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Calendar = () => {
  const { showSuccess, showError } = useUIStore();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Day modal state
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayStatus, setDayStatus] = useState(CALENDAR_STATUS.OPEN);
  const [closeReason, setCloseReason] = useState('');
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
            };
          }
        });
        setCalendarData(mapped);
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
    setShowDayModal(true);
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

      await updateDay(payload);
      setCalendarData((prev) => ({
        ...prev,
        [selectedDate.dateKey]: {
          status: dayStatus,
          reason: dayStatus === CALENDAR_STATUS.CLOSED ? closeReason : '',
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
      const status = entry?.status || CALENDAR_STATUS.OPEN;
      const past = isPast(day);

      const cellClasses = [
        styles.dayCell,
        status === CALENDAR_STATUS.OPEN ? styles.dayOpen : styles.dayClosed,
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
            {status === CALENDAR_STATUS.OPEN ? 'Open' : 'Closed'}
          </span>
          {entry?.reason && status === CALENDAR_STATUS.CLOSED && (
            <span className={styles.dayReason}>{CLOSE_REASONS[entry.reason] || entry.reason}</span>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Operating Calendar</h1>
      </div>

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
          <span className={`${styles.legendDot} ${styles.legendDotClosed}`} />
          <span>Closed</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotPast}`} />
          <span>Past</span>
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
        size="sm"
      >
        <div className={styles.dayModal}>
          <p className={styles.dayModalDate}>{selectedDate?.displayDate}</p>

          <div className={styles.statusToggle}>
            <button
              className={`${styles.statusOption} ${dayStatus === CALENDAR_STATUS.OPEN ? styles.statusOptionActive : ''}`}
              onClick={() => setDayStatus(CALENDAR_STATUS.OPEN)}
            >
              Open
            </button>
            <button
              className={`${styles.statusOption} ${dayStatus === CALENDAR_STATUS.CLOSED ? styles.statusOptionActive : ''}`}
              onClick={() => setDayStatus(CALENDAR_STATUS.CLOSED)}
            >
              Closed
            </button>
          </div>

          {dayStatus === CALENDAR_STATUS.CLOSED && (
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
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
