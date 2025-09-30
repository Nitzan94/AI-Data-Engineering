import React from 'react';
import { ColumnProfile, NumericStatistics, StringStatistics } from '../types';

interface ColumnStatisticsProps {
  profiles: ColumnProfile[];
}

export const ColumnStatistics: React.FC<ColumnStatisticsProps> = ({ profiles }) => {
  const [selectedColumn, setSelectedColumn] = React.useState<ColumnProfile | null>(
    profiles[0] || null
  );

  if (!selectedColumn) {
    return <div className="card p-6">No column data available</div>;
  }

  const renderNumericStats = (stats: NumericStatistics) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatItem label="Minimum" value={stats.min.toFixed(2)} />
        <StatItem label="Maximum" value={stats.max.toFixed(2)} />
        <StatItem label="Mean" value={stats.mean.toFixed(2)} />
        <StatItem label="Median" value={stats.median.toFixed(2)} />
        <StatItem label="Std Deviation" value={stats.stdDev.toFixed(2)} />
        <StatItem label="Outliers" value={stats.outliers.length.toString()} />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quartiles</h4>
        <div className="grid grid-cols-3 gap-4">
          <StatItem label="Q1 (25%)" value={stats.quartiles.q1.toFixed(2)} />
          <StatItem label="Q2 (50%)" value={stats.quartiles.q2.toFixed(2)} />
          <StatItem label="Q3 (75%)" value={stats.quartiles.q3.toFixed(2)} />
        </div>
      </div>
    </div>
  );

  const renderStringStats = (stats: StringStatistics) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatItem label="Min Length" value={stats.minLength.toString()} />
        <StatItem label="Max Length" value={stats.maxLength.toString()} />
        <StatItem label="Avg Length" value={stats.avgLength.toFixed(2)} />
      </div>

      {stats.patterns.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Detected Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {stats.patterns.map((pattern, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.topValues.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Values</h4>
          <div className="space-y-2">
            {stats.topValues.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate max-w-xs" title={item.value}>
                  {item.value}
                </span>
                <span className="text-gray-500 ml-2">({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">Column Statistics</h2>

      {/* Column Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Column</label>
        <select
          value={selectedColumn.name}
          onChange={(e) => {
            const profile = profiles.find((p) => p.name === e.target.value);
            if (profile) setSelectedColumn(profile);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {profiles.map((profile) => (
            <option key={profile.name} value={profile.name}>
              {profile.name} ({profile.type})
            </option>
          ))}
        </select>
      </div>

      {/* Column Overview */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 font-medium">Data Type</div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {selectedColumn.type}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">Completeness</div>
            <div className="text-lg font-semibold text-gray-900">
              {(100 - selectedColumn.nullPercentage).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">Unique Values</div>
            <div className="text-lg font-semibold text-gray-900">
              {selectedColumn.uniqueCount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 font-medium">Issues</div>
            <div className="text-lg font-semibold text-gray-900">
              {selectedColumn.issues.length}
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {selectedColumn.issues.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Data Quality Issues
          </h4>
          <ul className="space-y-2">
            {selectedColumn.issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-orange-800">
                • {issue.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
        {selectedColumn.type === 'number' && selectedColumn.statistics ? (
          renderNumericStats(selectedColumn.statistics as NumericStatistics)
        ) : selectedColumn.type === 'string' && selectedColumn.statistics ? (
          renderStringStats(selectedColumn.statistics as StringStatistics)
        ) : (
          <div className="text-sm text-gray-600">
            No detailed statistics available for this column type
          </div>
        )}
      </div>

      {/* Sample Values */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Sample Values</h4>
        <div className="flex flex-wrap gap-2">
          {selectedColumn.sampleValues.slice(0, 10).map((value, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
              title={String(value)}
            >
              {String(value).substring(0, 20)}
              {String(value).length > 20 ? '...' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 bg-white rounded-lg border border-gray-200">
    <div className="text-xs text-gray-600 font-medium mb-1">{label}</div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
  </div>
);