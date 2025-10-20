import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from '../types';
import { css } from '@emotion/css';
import { useTheme2 } from '@grafana/ui';

interface Props extends PanelProps<PanelOptions> {}

export const PivotTablePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme2();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const currentMonthColRef = useRef<HTMLTableHeaderCellElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Process and sort the data
  const tableData = useMemo(() => {
    if (!data.series || data.series.length === 0) {
      return { columns: [], rows: [] };
    }

    const series = data.series[0];
    const rawData: any[] = [];

    // Extract raw data from fields
    // const fieldCount = series.fields.length;
    const rowCount = series.length;

    for (let i = 0; i < rowCount; i++) {
      const row: any = {};
      series.fields.forEach((field) => {
        row[field.name] = field.values.get(i);
      });
      rawData.push(row);
    }

    if (rawData.length === 0) {
      return { columns: [], rows: [] };
    }

    // Get all column names (excluding 'month' which will be first)
    const allColumns = Object.keys(rawData[0]);
    const monthColumn = allColumns.find(col => col.toLowerCase() === 'month');
    const dateColumns = allColumns.filter(col => col.toLowerCase() !== 'month');

    // Sort date columns based on columnSortOrder option
    let sortedDateColumns = [...dateColumns];
    if (options.columnSortOrder === 'chronological') {
      sortedDateColumns.sort((a, b) => {
        try {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA.getTime() - dateB.getTime();
        } catch {
          return a.localeCompare(b);
        }
      });
    } else if (options.columnSortOrder === 'reverse-chronological') {
      sortedDateColumns.sort((a, b) => {
        try {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateB.getTime() - dateA.getTime();
        } catch {
          return b.localeCompare(a);
        }
      });
    } else if (options.columnSortOrder === 'alphabetical') {
      sortedDateColumns.sort((a, b) => a.localeCompare(b));
    }
    // If 'none', keep original order (no sorting)

    // Create final column order: month first, then sorted dates
    const columns = monthColumn ? [monthColumn, ...sortedDateColumns] : sortedDateColumns;

    // Sort rows based on rowSortOrder option
    let sortedRows = [...rawData];
    if (monthColumn && options.rowSortOrder !== 'none') {
      if (options.rowSortOrder === 'chronological') {
        sortedRows.sort((a, b) => {
          try {
            const dateA = new Date(a[monthColumn]);
            const dateB = new Date(b[monthColumn]);
            return dateA.getTime() - dateB.getTime();
          } catch {
            return String(a[monthColumn]).localeCompare(String(b[monthColumn]));
          }
        });
      } else if (options.rowSortOrder === 'reverse-chronological') {
        sortedRows.sort((a, b) => {
          try {
            const dateA = new Date(a[monthColumn]);
            const dateB = new Date(b[monthColumn]);
            return dateB.getTime() - dateA.getTime();
          } catch {
            return String(b[monthColumn]).localeCompare(String(a[monthColumn]));
          }
        });
      } else if (options.rowSortOrder === 'alphabetical') {
        sortedRows.sort((a, b) =>
          String(a[monthColumn]).localeCompare(String(b[monthColumn]))
        );
      }
    }

    // Find current month column
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthColumn = dateColumns.find(col => {
      try {
        const colDate = new Date(col);
        return colDate.getFullYear() === currentYear && colDate.getMonth() === currentMonth;
      } catch {
        return false;
      }
    });

    return { columns, rows: sortedRows, currentMonthColumn };
  }, [data, options.columnSortOrder, options.rowSortOrder]);

  // Check if content is HTML
  const isHtml = (value: string) => {
    return typeof value === 'string' && value.trim().startsWith('<');
  };

  const styles = {
    wrapper: css`
      width: ${width}px;
      height: ${height}px;
      overflow: auto;
      font-family: ${theme.typography.fontFamily};
      font-size: ${options.fontSize}px;
    `,
    table: css`
      width: 100%;
      border-collapse: collapse;
      background-color: ${theme.colors.background.primary};
    `,
    th: css`
      padding: 8px 12px;
      text-align: center;
      font-weight: 600;
      border: 1px solid ${theme.colors.border.weak};
      background-color: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
      position: sticky;
      top: 0;
      z-index: 1;
      min-width: 120px;
    `,
    thCurrentMonth: css`
      padding: 8px 12px;
      text-align: center;
      font-weight: 600;
      border: 1px solid ${theme.colors.border.weak};
      background-color: #fffbea;
      color: ${theme.colors.text.primary};
      position: sticky;
      top: 0;
      z-index: 1;
      min-width: 120px;
    `,
    thFirstCol: css`
      padding: 8px 12px;
      text-align: center;
      font-weight: 600;
      border: 1px solid ${theme.colors.border.weak};
      background-color: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
      position: sticky;
      top: 0;
      left: 0;
      z-index: 2;
      min-width: 120px;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: -8px;
        bottom: 0;
        width: 8px;
        background: linear-gradient(to right, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
        pointer-events: none;
      }
    `,
    td: css`
      padding: 4px;
      text-align: center;
      border: 1px solid ${theme.colors.border.weak};
      color: ${theme.colors.text.primary};
      min-width: 120px;
    `,
    tdCurrentMonth: css`
      padding: 4px;
      text-align: center;
      border: 1px solid ${theme.colors.border.weak};
      color: ${theme.colors.text.primary};
      min-width: 120px;
      background-color: #fffbea;
    `,
    tdFirstCol: css`
      padding: 4px;
      text-align: center;
      border: 1px solid ${theme.colors.border.weak};
      color: ${theme.colors.text.primary};
      position: sticky;
      left: 0;
      background-color: ${theme.colors.background.primary};
      z-index: 1;
      min-width: 120px;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: -8px;
        bottom: 0;
        width: 8px;
        background: linear-gradient(to right, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
        pointer-events: none;
      }
    `,
    cellContent: css`
      width: 100%;
      height: 100%;
      padding: 4px;
      border-radius: 4px;
      text-align: center;
    `,
    pagination: css`
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background-color: ${theme.colors.background.secondary};
      border-top: 1px solid ${theme.colors.border.weak};
    `,
    button: css`
      padding: 6px 12px;
      background-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrastText};
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: ${options.fontSize - 2}px;

      &:hover {
        background-color: ${theme.colors.primary.shade};
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
    tableContainer: css`
      position: relative;
      width: 100%;
      height: 100%;
    `,
    scrollButton: css`
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background-color: ${theme.colors.background.primary};
      border: 2px solid ${theme.colors.border.strong};
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: ${theme.colors.background.secondary};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      &:active:not(:disabled) {
        transform: translateY(-50%) scale(0.95);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        border-color: ${theme.colors.border.weak};
      }

      svg {
        width: 20px;
        height: 20px;
        fill: ${theme.colors.text.primary};
      }
    `,
    scrollButtonLeft: css`
      left: 8px;
    `,
    scrollButtonRight: css`
      right: 8px;
    `,
  };

  // Pagination logic
  const [currentPage, setCurrentPage] = React.useState(0);
  const totalPages = options.enablePagination
    ? Math.ceil(tableData.rows.length / options.rowsPerPage)
    : 1;

  const displayedRows = options.enablePagination
    ? tableData.rows.slice(
      currentPage * options.rowsPerPage,
      (currentPage + 1) * options.rowsPerPage
    )
    : tableData.rows;

  const handlePrevPage = () => setCurrentPage(prev => Math.max(0, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));

  // Check overflow and scroll positions
  const checkOverflow = useCallback(() => {
    if (wrapperRef.current) {
      const wrapper = wrapperRef.current;
      const hasHorizontalOverflow = wrapper.scrollWidth > wrapper.clientWidth;
      setHasOverflow(hasHorizontalOverflow);

      if (hasHorizontalOverflow) {
        setCanScrollLeft(wrapper.scrollLeft > 0);
        setCanScrollRight(wrapper.scrollLeft < wrapper.scrollWidth - wrapper.clientWidth - 1);
      } else {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    }
  }, []);

  // Scroll one column to the left or right
  const scrollOneColumn = useCallback((direction: 'left' | 'right') => {
    if (wrapperRef.current) {
      const wrapper = wrapperRef.current;
      const table = wrapper.querySelector('table');
      if (table) {
        const firstCell = table.querySelector('th, td');
        if (firstCell) {
          const columnWidth = (firstCell as HTMLElement).offsetWidth;
          const scrollAmount = direction === 'left' ? -columnWidth : columnWidth;

          wrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth',
          });
        }
      }
    }
  }, []);

  const handleScrollLeft = () => scrollOneColumn('left');
  const handleScrollRight = () => scrollOneColumn('right');

  // Check overflow on mount and when data/size changes
  useEffect(() => {
    checkOverflow();

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', checkOverflow);
      return () => wrapper.removeEventListener('scroll', checkOverflow);
    }
    return undefined;
  }, [checkOverflow, tableData, width, height]);

  // Auto-scroll to current month column
  useEffect(() => {
    if (options.scrollToCurrentMonth && tableData.currentMonthColumn && currentMonthColRef.current && wrapperRef.current) {
      const colElement = currentMonthColRef.current;
      const wrapper = wrapperRef.current;

      // Calculate the position to scroll to center the column
      const colLeft = colElement.offsetLeft;
      const colWidth = colElement.offsetWidth;
      const wrapperWidth = wrapper.clientWidth;

      // Center the column in the viewport, accounting for pinned left column
      const scrollPosition = colLeft - (wrapperWidth / 2) + (colWidth / 2);

      wrapper.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, [tableData.currentMonthColumn, options.scrollToCurrentMonth]);

  if (tableData.columns.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div style={{ padding: 16, textAlign: 'center', color: theme.colors.text.secondary }}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {options.showScrollArrows && hasOverflow && canScrollLeft && (
        <button
          className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      )}

      {options.showScrollArrows && hasOverflow && canScrollRight && (
        <button
          className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      )}

      <div ref={wrapperRef} className={styles.wrapper}>
        <table className={styles.table}>
        {options.showHeader && (
          <thead>
          <tr>
            {tableData.columns.map((column, idx) => {
              const isCurrentMonth = options.highlightCurrentMonth && column === tableData.currentMonthColumn;
              const isPinned = options.pinLeftColumn && idx === 0;
              const className = isPinned ? styles.thFirstCol : (isCurrentMonth ? styles.thCurrentMonth : styles.th);

              return (
                <th
                  key={idx}
                  className={className}
                  ref={isCurrentMonth ? currentMonthColRef : null}
                >
                  {column}
                </th>
              );
            })}
          </tr>
          </thead>
        )}
        <tbody>
        {displayedRows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {tableData.columns.map((column, colIdx) => {
              const cellValue = row[column];
              const isCurrentMonth = options.highlightCurrentMonth && column === tableData.currentMonthColumn;
              const isPinned = options.pinLeftColumn && colIdx === 0;
              const className = isPinned ? styles.tdFirstCol : (isCurrentMonth ? styles.tdCurrentMonth : styles.td);

              return (
                <td key={colIdx} className={className}>
                  {isHtml(cellValue) ? (
                    <div dangerouslySetInnerHTML={{ __html: cellValue }} />
                  ) : (
                    <div className={styles.cellContent}>{cellValue}</div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
        </tbody>
      </table>

        {options.enablePagination && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.button}
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              className={styles.button}
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
