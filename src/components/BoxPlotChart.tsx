import React from 'react';
import { ColumnProfile, CSVData, NumericStatistics } from '../types';

interface BoxPlotChartProps {
  columnProfile: ColumnProfile;
  csvData: CSVData;
}

export const BoxPlotChart: React.FC<BoxPlotChartProps> = ({ columnProfile, csvData }) => {
  if (columnProfile.type !== 'number' || !columnProfile.statistics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Box plot is only available for numeric columns</p>
      </div>
    );
  }

  const stats = columnProfile.statistics as NumericStatistics;
  const { min, max, quartiles, outliers } = stats;
  const { q1, q2, q3 } = quartiles;

  const range = max - min;
  const scale = 100 / range;

  const getPosition = (value: number) => {
    return ((value - min) * scale).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          {columnProfile.name} Distribution
        </h4>
      </div>

      {/* Box Plot Visualization */}
      <div className="relative h-32 bg-gray-50 rounded-lg border border-gray-200 p-4">
        {/* Whiskers and Box */}
        <div className="relative h-16 mt-4">
          {/* Left whisker */}
          <div
            className="absolute h-0.5 bg-gray-600"
            style={{
              left: `${getPosition(min)}%`,
              width: `${getPosition(q1) - getPosition(min)}%`,
              top: '50%',
            }}
          ></div>

          {/* Box */}
          <div
            className="absolute h-full bg-primary-200 border-2 border-primary-600 rounded"
            style={{
              left: `${getPosition(q1)}%`,
              width: `${getPosition(q3) - getPosition(q1)}%`,
            }}
          >
            {/* Median line */}
            <div
              className="absolute h-full w-1 bg-primary-900"
              style={{
                left: `${((q2 - q1) / (q3 - q1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Right whisker */}
          <div
            className="absolute h-0.5 bg-gray-600"
            style={{
              left: `${getPosition(q3)}%`,
              width: `${getPosition(max) - getPosition(q3)}%`,
              top: '50%',
            }}
          ></div>

          {/* Outliers */}
          {outliers.slice(0, 20).map((outlier, idx) => (
            <div
              key={idx}
              className="absolute w-2 h-2 bg-red-500 rounded-full border border-red-700"
              style={{
                left: `${getPosition(outlier)}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              title={`Outlier: ${outlier.toFixed(2)}`}
            ></div>
          ))}
        </div>

        {/* Scale labels */}
        <div className="relative mt-2 text-xs text-gray-600">
          <div className="absolute" style={{ left: `${getPosition(min)}%`, transform: 'translateX(-50%)' }}>
            {min.toFixed(1)}
          </div>
          <div className="absolute" style={{ left: `${getPosition(q1)}%`, transform: 'translateX(-50%)' }}>
            Q1: {q1.toFixed(1)}
          </div>
          <div className="absolute" style={{ left: `${getPosition(q2)}%`, transform: 'translateX(-50%)' }}>
            Median: {q2.toFixed(1)}
          </div>
          <div className="absolute" style={{ left: `${getPosition(q3)}%`, transform: 'translateX(-50%)' }}>
            Q3: {q3.toFixed(1)}
          </div>
          <div className="absolute" style={{ left: `${getPosition(max)}%`, transform: 'translateX(-50%)' }}>
            {max.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600">Min</div>
          <div className="text-lg font-semibold text-gray-900">{min.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="text-xs text-primary-700">Q1 (25%)</div>
          <div className="text-lg font-semibold text-primary-900">{q1.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-primary-100 rounded-lg border border-primary-300">
          <div className="text-xs text-primary-700">Median (50%)</div>
          <div className="text-lg font-semibold text-primary-900">{q2.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <div className="text-xs text-primary-700">Q3 (75%)</div>
          <div className="text-lg font-semibold text-primary-900">{q3.toFixed(2)}</div>
        </div>
      </div>

      {/* Outlier Info */}
      {outliers.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-red-900 mb-1">
                {outliers.length} Outlier{outliers.length > 1 ? 's' : ''} Detected
              </h5>
              <p className="text-xs text-red-800">
                Values outside 1.5 × IQR range: {outliers.slice(0, 5).map(o => o.toFixed(2)).join(', ')}
                {outliers.length > 5 && ` ... and ${outliers.length - 5} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="text-sm font-semibold text-blue-900 mb-2">📊 How to Read:</h5>
        <div className="text-xs text-blue-800 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-200 border-2 border-primary-600 rounded"></div>
            <span><strong>Box:</strong> Middle 50% of data (Q1 to Q3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-primary-900"></div>
            <span><strong>Line in box:</strong> Median value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-600"></div>
            <span><strong>Whiskers:</strong> Min and Max (excluding outliers)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full border border-red-700"></div>
            <span><strong>Red dots:</strong> Outliers (extreme values)</span>
          </div>
        </div>
      </div>
    </div>
  );
};