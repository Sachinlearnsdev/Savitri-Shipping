import { useState } from 'react';
import Loader from '../Loader';
import EmptyState from '../EmptyState';
import Checkbox from '../Checkbox';
import styles from './Table.module.css';

/**
 * Table Component
 * 
 * @param {object} props - Component props
 * @param {Array} props.columns - Column definitions [{key, label, sortable, render}]
 * @param {Array} props.data - Table data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message when no data
 * @param {Function} props.onRowClick - Row click handler
 * @param {boolean} props.selectable - Enable row selection
 * @param {Array} props.selectedRows - Selected row IDs
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {boolean} props.striped - Striped rows
 * @param {boolean} props.hoverable - Hoverable rows
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  striped = true,
  hoverable = true,
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  
  const wrapperClasses = [
    styles.wrapper,
    className,
  ].filter(Boolean).join(' ');
  
  const tableClasses = [
    styles.table,
    striped && styles.striped,
    hoverable && styles.hoverable,
  ].filter(Boolean).join(' ');
  
  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);
  
  // Handle sort
  const handleSort = (key) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Handle select all
  const handleSelectAll = (checked) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? data.map((_, idx) => idx.toString()) : []);
    }
  };
  
  // Handle select row
  const handleSelectRow = (rowId, checked) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter(id => id !== rowId);
      onSelectionChange(newSelection);
    }
  };
  
  // Handle row click
  const handleRowClick = (row, index) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };
  
  const allSelected = selectable && data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectable && selectedRows.length > 0 && selectedRows.length < data.length;
  
  if (loading) {
    return (
      <div className={wrapperClasses}>
        <Loader text="Loading data..." />
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className={wrapperClasses}>
        <EmptyState icon="📄" title="No Data" description={emptyMessage} />
      </div>
    );
  }
  
  return (
    <div className={wrapperClasses}>
      <div className={styles.tableContainer}>
        <table className={tableClasses}>
          <thead className={styles.thead}>
            <tr>
              {selectable && (
                <th className={styles.checkboxCell}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.th} ${column.sortable ? styles.sortable : ''}`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className={styles.thContent}>
                    <span>{column.label}</span>
                    {column.sortable && sortConfig.key === column.key && (
                      <span className={styles.sortIcon}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className={styles.tbody}>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                onClick={() => handleRowClick(row, rowIndex)}
              >
                {selectable && (
                  <td className={styles.checkboxCell}>
                    <Checkbox
                      checked={selectedRows.includes(rowIndex.toString())}
                      onChange={(checked) => handleSelectRow(rowIndex.toString(), checked)}
                    />
                  </td>
                )}
                
                {columns.map((column) => (
                  <td key={column.key} className={styles.td}>
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;