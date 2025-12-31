import React from 'react';
import { LOG_LEVEL_COLORS } from '../constants';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface LogTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export const LogTable = <T extends { timestamp: string; level?: string }>({ data, columns, onRowClick }: LogTableProps<T>) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 shadow-sm">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-300">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 border-b border-slate-800 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                No logs found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className="hover:bg-slate-900 transition-colors cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIdx) => {
                  const content = typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : row[col.accessor];

                  // Special styling for log levels if this column is 'level'
                  let cellClass = "px-6 py-3 whitespace-nowrap";
                  if (col.header.toLowerCase() === 'level' && typeof content === 'string') {
                    const colorClass = LOG_LEVEL_COLORS[content] || 'text-slate-400';
                    return (
                      <td key={colIdx} className={cellClass}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 border border-slate-800 ${colorClass}`}>
                          {content}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td key={colIdx} className={`${cellClass} ${col.className || ''}`}>
                      {content as React.ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};