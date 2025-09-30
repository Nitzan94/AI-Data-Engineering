import React, { useState } from 'react';
import { CSVData, ColumnProfile } from '../types';

interface DataPreviewProps {
  data: CSVData;
  columnProfiles: ColumnProfile[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, columnProfiles }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.rows.length / rowsPerPage);

  const startIdx = currentPage * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, data.rows.length);
  const currentRows = data.rows.slice(startIdx, endIdx);

  const getColumnProfile = (columnName: string) => {
    return columnProfiles.find((p) => p.name === columnName);
  };

  const hasIssues = (columnName: string): boolean => {
    const profile = getColumnProfile(columnName);
    return (profile?.issues.length || 0) > 0;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Data Preview</h2>
        <div className="text-sm text-gray-600">
          {data.fileName} • {formatBytes(data.fileSize)}
        </div>
      </div>

      {/* Dataset Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
          <div className="text-sm text-primary-700 font-medium">Total Rows</div>
          <div className="text-3xl font-bold text-primary-900">{data.rowCount.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-sm text-green-700 font-medium">Total Columns</div>
          <div className="text-3xl font-bold text-green-900">{data.columnCount}</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-sm text-purple-700 font-medium">Data Points</div>
          <div className="text-3xl font-bold text-purple-900">
            {(data.rowCount * data.columnCount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              {data.headers.map((header) => (
                <th
                  key={header}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    hasIssues(header)
                      ? 'bg-orange-50 text-orange-900'
                      : 'text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{header}</span>
                    {hasIssues(header) && (
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs font-normal text-gray-500 mt-1 capitalize">
                    {getColumnProfile(header)?.type || 'unknown'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((row, idx) => (
              <tr key={startIdx + idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">
                  {startIdx + idx + 1}
                </td>
                {data.headers.map((header) => {
                  const value = row[header];
                  const isEmpty = value === null || value === undefined || value === '';

                  return (
                    <td
                      key={header}
                      className={`px-4 py-3 text-sm whitespace-nowrap ${
                        isEmpty ? 'bg-red-50 text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {isEmpty ? (
                        <span className="italic">null</span>
                      ) : (
                        <span className="max-w-xs truncate inline-block" title={String(value)}>
                          {String(value)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {startIdx + 1} to {endIdx} of {data.rowCount} rows
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <div className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-xs font-semibold text-gray-700 mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
            <span>Column with issues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span>Missing value</span>
          </div>
        </div>
      </div>
    </div>
  );
};