import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getTopBoats, getBookingStats, getAllBookingsForReports, getAllPartyBookingsForReports, getAllSpeedBoatsForReports, getAllPartyBoatsForReports } from '../../services/reports.service';
import useUIStore from '../../store/uiStore';
import { CURRENCY } from '../../utils/constants';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const COLORS = ['#0891b2', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatCurrency = (amount) => {
  if (amount == null) return `${CURRENCY.SYMBOL}0`;
  if (amount >= 100000) return `${CURRENCY.SYMBOL}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(1)}K`;
  return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
};

const formatFullCurrency = (amount) => {
  if (amount == null) return `${CURRENCY.SYMBOL}0`;
  return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
};

const BoatPerformance = () => {
  const { showSuccess, showError } = useUIStore();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [topBoats, setTopBoats] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [utilizationData, setUtilizationData] = useState([]);
  const [revenuePerBoatPerDay, setRevenuePerBoatPerDay] = useState([]);
  const [topPerformingDays, setTopPerformingDays] = useState([]);

  const getPeriodDays = (p) => {
    switch (p) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boatsRes, statsRes, bookingsRes, partyBookingsRes, speedBoatsRes, partyBoatsRes] = await Promise.all([
        getTopBoats({ period }),
        getBookingStats({ period }),
        getAllBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllPartyBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllSpeedBoatsForReports({ limit: 100 }).catch(() => ({ success: false })),
        getAllPartyBoatsForReports({ limit: 100 }).catch(() => ({ success: false })),
      ]);
      if (boatsRes.success) setTopBoats(boatsRes.data || []);
      if (statsRes.success) setBookingStats(statsRes.data);

      const speedBookings = bookingsRes.success ? (bookingsRes.data?.docs || bookingsRes.data || []) : [];
      const partyBookings = partyBookingsRes.success ? (partyBookingsRes.data?.docs || partyBookingsRes.data || []) : [];
      const allBookings = [...(Array.isArray(speedBookings) ? speedBookings : []), ...(Array.isArray(partyBookings) ? partyBookings : [])];

      const allSpeedBoats = speedBoatsRes.success ? (speedBoatsRes.data?.docs || speedBoatsRes.data || []) : [];
      const allPartyBoats = partyBoatsRes.success ? (partyBoatsRes.data?.docs || partyBoatsRes.data || []) : [];
      const totalBoats = (Array.isArray(allSpeedBoats) ? allSpeedBoats.length : 0) + (Array.isArray(allPartyBoats) ? allPartyBoats.length : 0);

      const periodDays = getPeriodDays(period);

      // Utilization Rate - booked slots per boat vs available slots
      // Each boat has ~3 time slots per day (morning, afternoon, evening)
      const slotsPerDay = 3;
      const boatBookingCounts = {};
      const boatNames = {};

      // Map all boats by ID
      if (Array.isArray(allSpeedBoats)) {
        allSpeedBoats.forEach(b => { boatNames[b.id || b._id] = b.name; });
      }
      if (Array.isArray(allPartyBoats)) {
        allPartyBoats.forEach(b => { boatNames[b.id || b._id] = b.name; });
      }

      allBookings.forEach(b => {
        if (['CONFIRMED', 'COMPLETED'].includes(b.status)) {
          // For speed boats with per-boat selection
          if (b.boatIds && b.boatIds.length > 0) {
            b.boatIds.forEach(bid => {
              const id = typeof bid === 'object' ? (bid._id || bid.id || bid) : bid;
              boatBookingCounts[id] = (boatBookingCounts[id] || 0) + 1;
            });
          } else if (b.boats && b.boats.length > 0) {
            b.boats.forEach(boat => {
              const name = boat.boatName || 'Unknown';
              boatBookingCounts[name] = (boatBookingCounts[name] || 0) + 1;
            });
          } else {
            const boatId = b.boatId?._id || b.boatId?.id || b.boatId || 'Unknown';
            boatBookingCounts[boatId] = (boatBookingCounts[boatId] || 0) + 1;
          }
        }
      });

      const totalAvailableSlots = slotsPerDay * periodDays;
      const utilization = Object.entries(boatBookingCounts)
        .map(([key, count]) => {
          const name = boatNames[key] || key;
          const rate = totalAvailableSlots > 0 ? Math.min(100, Math.round((count / totalAvailableSlots) * 100)) : 0;
          return { name: name.length > 15 ? name.slice(0, 15) + '...' : name, utilization: rate, bookings: count };
        })
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 8);
      setUtilizationData(utilization);

      // Revenue per boat per day average
      const boatRevenue = {};
      const boatDays = {};
      allBookings.forEach(b => {
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
          const boatName = b.boats?.[0]?.boatName || b.boatId?.name || b.boatName || 'Unknown';
          const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
          if (!boatRevenue[boatName]) {
            boatRevenue[boatName] = 0;
            boatDays[boatName] = new Set();
          }
          boatRevenue[boatName] += amount;
          const dateStr = new Date(b.date || b.createdAt).toISOString().split('T')[0];
          boatDays[boatName].add(dateStr);
        }
      });

      const revPerBoatPerDay = Object.entries(boatRevenue)
        .map(([name, revenue]) => {
          const activeDays = boatDays[name]?.size || 1;
          return {
            name: name.length > 15 ? name.slice(0, 15) + '...' : name,
            avgRevenue: Math.round(revenue / activeDays),
            totalRevenue: Math.round(revenue),
          };
        })
        .sort((a, b) => b.avgRevenue - a.avgRevenue)
        .slice(0, 8);
      setRevenuePerBoatPerDay(revPerBoatPerDay);

      // Top Performing Days of Week
      const dayRevenue = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
      const dayBookings = [0, 0, 0, 0, 0, 0, 0];
      allBookings.forEach(b => {
        const bDate = new Date(b.date || b.createdAt);
        const dayOfWeek = bDate.getDay();
        const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
          dayRevenue[dayOfWeek] += amount;
        }
        dayBookings[dayOfWeek]++;
      });

      setTopPerformingDays(DAY_NAMES.map((name, i) => ({
        name,
        revenue: Math.round(dayRevenue[i]),
        bookings: dayBookings[i],
      })));
    } catch (err) {
      console.error('Boat performance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const handleExportCSV = () => {
    try {
      setExporting('csv');
      const speedBoats = topBoats.filter(b => b.type === 'Speed Boat');
      const partyBoats = topBoats.filter(b => b.type === 'Party Boat');

      let csv = 'Savitri Shipping - Boat Performance Report\n';
      csv += `Period: ${PERIOD_OPTIONS.find(p => p.value === period)?.label || period}\n`;
      csv += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;

      // Speed Boat Performance
      csv += '--- Speed Boat Performance ---\n';
      csv += 'Boat Name,Total Bookings,Revenue\n';
      speedBoats.forEach(boat => {
        csv += `"${boat.name || 'Unknown'}",${boat.bookings || 0},${formatFullCurrency(boat.revenue)}\n`;
      });
      if (speedBoats.length === 0) csv += 'No speed boat data available\n';
      csv += '\n';

      // Party Boat Performance
      csv += '--- Party Boat Performance ---\n';
      csv += 'Boat Name,Total Bookings,Revenue\n';
      partyBoats.forEach(boat => {
        csv += `"${boat.name || 'Unknown'}",${boat.bookings || 0},${formatFullCurrency(boat.revenue)}\n`;
      });
      if (partyBoats.length === 0) csv += 'No party boat data available\n';
      csv += '\n';

      // Utilization Rate
      csv += '--- Utilization Rate ---\n';
      csv += 'Boat Name,Utilization Rate,Bookings\n';
      utilizationData.forEach(item => {
        csv += `"${item.name}",${item.utilization}%,${item.bookings}\n`;
      });
      if (utilizationData.length === 0) csv += 'No utilization data available\n';
      csv += '\n';

      // Revenue per Boat per Day
      csv += '--- Avg Revenue per Boat per Day ---\n';
      csv += 'Boat Name,Avg Revenue/Day,Total Revenue\n';
      revenuePerBoatPerDay.forEach(item => {
        csv += `"${item.name}",${formatFullCurrency(item.avgRevenue)},${formatFullCurrency(item.totalRevenue)}\n`;
      });
      if (revenuePerBoatPerDay.length === 0) csv += 'No revenue data available\n';
      csv += '\n';

      // Revenue by Day of Week
      csv += '--- Revenue by Day of Week ---\n';
      csv += 'Day,Revenue,Bookings\n';
      topPerformingDays.forEach(item => {
        csv += `${item.name},${formatFullCurrency(item.revenue)},${item.bookings}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boat-performance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('CSV report downloaded successfully');
    } catch (err) {
      console.error('CSV export error:', err);
      showError('Failed to export CSV report');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = () => {
    try {
      setExporting('pdf');
      const speedBoats = topBoats.filter(b => b.type === 'Speed Boat');
      const partyBoats = topBoats.filter(b => b.type === 'Party Boat');
      const boatTypeData = bookingStats?.byType || [];

      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Boat Performance - Savitri Shipping</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
    h1 { font-size: 24px; margin-bottom: 4px; color: #0891b2; }
    h2 { font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #0891b2; color: #1a1a2e; }
    .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
    .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .stat-value { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
    tr:last-child td { border-bottom: none; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-speed { background: #dcfce7; color: #16a34a; }
    .badge-party { background: #fef3c7; color: #d97706; }
    .revenue { font-weight: 600; color: #0891b2; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Boat Performance Report</h1>
  <p class="subtitle">Period: ${PERIOD_OPTIONS.find(p => p.value === period)?.label || period} | Generated: ${new Date().toLocaleDateString('en-IN')} | Savitri Shipping</p>

  <h2>Top Performing Boats</h2>
  <table>
    <thead><tr><th>#</th><th>Boat Name</th><th>Type</th><th>Bookings</th><th>Revenue</th></tr></thead>
    <tbody>
      ${topBoats.map((boat, i) => `<tr>
        <td>${i + 1}</td>
        <td>${boat.name || 'Unknown'}</td>
        <td><span class="badge ${boat.type === 'Speed Boat' ? 'badge-speed' : 'badge-party'}">${boat.type}</span></td>
        <td>${boat.bookings || 0}</td>
        <td class="revenue">${formatFullCurrency(boat.revenue)}</td>
      </tr>`).join('')}
      ${topBoats.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#9ca3af;">No boat data for this period</td></tr>' : ''}
    </tbody>
  </table>

  <div class="two-col">
    <div class="section">
      <h2>Speed Boat Performance</h2>
      <table>
        <thead><tr><th>Boat Name</th><th>Bookings</th><th>Revenue</th></tr></thead>
        <tbody>
          ${speedBoats.map(boat => `<tr><td>${boat.name || 'Unknown'}</td><td>${boat.bookings || 0}</td><td class="revenue">${formatFullCurrency(boat.revenue)}</td></tr>`).join('')}
          ${speedBoats.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2>Party Boat Performance</h2>
      <table>
        <thead><tr><th>Boat Name</th><th>Bookings</th><th>Revenue</th></tr></thead>
        <tbody>
          ${partyBoats.map(boat => `<tr><td>${boat.name || 'Unknown'}</td><td>${boat.bookings || 0}</td><td class="revenue">${formatFullCurrency(boat.revenue)}</td></tr>`).join('')}
          ${partyBoats.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <h2>Utilization Rate</h2>
      <table>
        <thead><tr><th>Boat Name</th><th>Utilization</th><th>Bookings</th></tr></thead>
        <tbody>
          ${utilizationData.map(item => `<tr><td>${item.name}</td><td>${item.utilization}%</td><td>${item.bookings}</td></tr>`).join('')}
          ${utilizationData.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2>Avg Revenue per Boat per Day</h2>
      <table>
        <thead><tr><th>Boat Name</th><th>Avg/Day</th><th>Total Revenue</th></tr></thead>
        <tbody>
          ${revenuePerBoatPerDay.map(item => `<tr><td>${item.name}</td><td class="revenue">${formatFullCurrency(item.avgRevenue)}</td><td class="revenue">${formatFullCurrency(item.totalRevenue)}</td></tr>`).join('')}
          ${revenuePerBoatPerDay.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  </div>

  <h2>Revenue by Day of Week</h2>
  <table>
    <thead><tr><th>Day</th><th>Revenue</th><th>Bookings</th></tr></thead>
    <tbody>
      ${topPerformingDays.map(item => `<tr><td>${item.name}</td><td class="revenue">${formatFullCurrency(item.revenue)}</td><td>${item.bookings}</td></tr>`).join('')}
    </tbody>
  </table>

  ${boatTypeData.length > 0 ? `
  <h2>Speed vs Party Boats</h2>
  <div class="stats-grid" style="grid-template-columns: repeat(${boatTypeData.length}, 1fr);">
    ${boatTypeData.map(item => `<div class="stat-card">
      <div class="stat-label">${item.name}</div>
      <div class="stat-value">${item.value}</div>
    </div>`).join('')}
  </div>` : ''}

  <div class="footer">Savitri Shipping - Boat Performance Report | Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
      showSuccess('PDF report opened in new tab');
    } catch (err) {
      console.error('PDF export error:', err);
      showError('Failed to export PDF report');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading boat performance...</div>
      </div>
    );
  }

  const boatTypeData = bookingStats?.byType || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Boat Performance</h1>
        <div className={styles.headerActions}>
          <div className={styles.exportButtons}>
            <Button variant="outline" size="sm" onClick={handleExportCSV} loading={exporting === 'csv'} disabled={!!exporting}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} loading={exporting === 'pdf'} disabled={!!exporting}>
              Export PDF
            </Button>
          </div>
          <div className={styles.periodSelector}>
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.periodBtn} ${period === opt.value ? styles.periodBtnActive : ''}`}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Boats Table */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Top Performing Boats</h2>
        {topBoats.length > 0 ? (
          <table className={styles.topBoatsTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Boat Name</th>
                <th>Type</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topBoats.map((boat, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={styles.boatName}>{boat.name || 'Unknown'}</td>
                  <td>
                    <Badge variant={boat.type === 'Speed Boat' ? 'success' : 'warning'}>
                      {boat.type}
                    </Badge>
                  </td>
                  <td>{boat.bookings || 0}</td>
                  <td className={styles.revenueCell}>{formatFullCurrency(boat.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.noData}>No boat data for this period</div>
        )}
      </div>

      {/* Utilization + Revenue per Boat per Day */}
      <div className={styles.chartsRowTwo}>
        {/* Utilization Rate */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Utilization Rate (Booked vs Available Slots)</h2>
          {utilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={utilizationData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value, name) => name === 'utilization' ? `${value}%` : value} />
                <Bar dataKey="utilization" fill="#0891b2" radius={[0, 4, 4, 0]}>
                  {utilizationData.map((entry, i) => (
                    <Cell key={i} fill={entry.utilization > 70 ? '#22c55e' : entry.utilization > 40 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No utilization data available</div>
          )}
        </div>

        {/* Revenue per Boat per Day */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Avg Revenue per Boat per Day</h2>
          {revenuePerBoatPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenuePerBoatPerDay} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value, name) => [formatFullCurrency(value), name === 'avgRevenue' ? 'Avg/Day' : 'Total']} />
                <Bar dataKey="avgRevenue" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {revenuePerBoatPerDay.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No revenue data available</div>
          )}
        </div>
      </div>

      {/* Top Performing Days + Speed vs Party Boats */}
      <div className={styles.chartsRowTwo}>
        {/* Top Performing Days */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Revenue by Day of Week</h2>
          {topPerformingDays.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topPerformingDays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? formatFullCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Bar dataKey="revenue" fill="#0891b2" radius={[4, 4, 0, 0]}>
                  {topPerformingDays.map((entry, i) => {
                    const maxRev = Math.max(...topPerformingDays.map(d => d.revenue));
                    return <Cell key={i} fill={entry.revenue === maxRev ? '#22c55e' : '#0891b2'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No day-of-week data available</div>
          )}
        </div>

        {/* Speed vs Party Boats */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Speed vs Party Boats</h2>
          {boatTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={boatTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]}>
                  {boatTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No boat type data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoatPerformance;
