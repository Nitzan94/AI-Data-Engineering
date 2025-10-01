import React, { useMemo } from 'react';
import { ColumnProfile, CSVData } from '../types';
import { calculateCorrelationMatrix, getCorrelationColor } from '../utils/chartHelpers';

interface CorrelationHeatmapProps {
  columnProfiles: ColumnProfile[];
  csvData: CSVData;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  columnProfiles,
  csvData,
}) => {
  const correlationData = useMemo(() => {
    return calculateCorrelationMatrix(columnProfiles, csvData);
  }, [columnProfiles, csvData]);

  if (!correlationData) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Correlation Matrix</h3>
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p>Need at least 2 numeric columns for correlation analysis</p>
        </div>
      </div>
    );
  }

  const { matrix, columns } = correlationData;
  const cellSize = Math.min(80, 600 / columns.length);

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Correlation Matrix</h3>
        <p className="text-sm text-gray-600">
          Shows relationships between numeric columns. Hover to see correlation values.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2"></th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border border-gray-300 p-2 text-xs font-semibold text-gray-700"
                    style={{
                      minWidth: `${cellSize}px`,
                      maxWidth: `${cellSize}px`,
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.map((row, i) => (
                <tr key={row}>
                  <td className="border border-gray-300 p-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {row}
                  </td>
                  {columns.map((col, j) => {
                    const correlation = matrix[i][j];
                    const bgColor = getCorrelationColor(correlation);

                    return (
                      <td
                        key={`${row}-${col}`}
                        className="border border-gray-300 text-center relative group cursor-pointer"
                        style={{
                          backgroundColor: bgColor,
                          minWidth: `${cellSize}px`,
                          maxWidth: `${cellSize}px`,
                          height: `${cellSize}px`,
                        }}
                        title={`${row} vs ${col}: ${correlation.toFixed(3)}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`text-xs font-bold ${
                              Math.abs(correlation) > 0.5 ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {correlation.toFixed(2)}
                          </span>
                        </div>
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs rounded-sm px-2 py-1 whitespace-nowrap top-full left-1/2 transform -translate-x-1/2 mt-1">
                          {row} ↔ {col}
                          <br />
                          Correlation: {correlation.toFixed(3)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-linear-to-r from-blue-500 to-white"></div>
          <span className="text-xs text-gray-600">Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-4 bg-linear-to-r from-white to-red-500"></div>
          <span className="text-xs text-gray-600">Positive</span>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 How to Read:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>1.0</strong> = Perfect positive correlation</li>
          <li>• <strong>0.0</strong> = No correlation</li>
          <li>• <strong>-1.0</strong> = Perfect negative correlation</li>
          <li>• <strong>|r| &gt; 0.7</strong> = Strong relationship</li>
          <li>• <strong>|r| = 0.3-0.7</strong> = Moderate relationship</li>
          <li>• <strong>|r| &lt; 0.3</strong> = Weak relationship</li>
        </ul>
      </div>
    </div>
  );
};