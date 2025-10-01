import React, { useState } from 'react';
import { ColumnProfile, CSVData } from '../types';
import { DistributionChart } from './DistributionChart';
import { CorrelationHeatmap } from './CorrelationHeatmap';
import { BoxPlotChart } from './BoxPlotChart';

interface EDAOverviewProps {
  columnProfiles: ColumnProfile[];
  csvData: CSVData;
}

export const EDAOverview: React.FC<EDAOverviewProps> = ({ columnProfiles, csvData }) => {
  const [selectedColumn, setSelectedColumn] = useState<ColumnProfile | null>(
    columnProfiles.find((p) => p.type === 'number') || null
  );

  const numericColumns = columnProfiles.filter((p) => p.type === 'number');
  const categoricalColumns = columnProfiles.filter((p) => p.type !== 'number');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-2">Exploratory Data Analysis (EDA)</h2>
        <p className="text-gray-600">
          Visualize data distributions, correlations, and patterns to gain deeper insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Total Rows</div>
          <div className="text-3xl font-bold text-gray-900">{csvData.rowCount.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Total Columns</div>
          <div className="text-3xl font-bold text-gray-900">{csvData.columnCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Numeric Columns</div>
          <div className="text-3xl font-bold text-primary-600">{numericColumns.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Categorical Columns</div>
          <div className="text-3xl font-bold text-green-600">{categoricalColumns.length}</div>
        </div>
      </div>

      {/* Correlation Heatmap */}
      {numericColumns.length >= 2 && (
        <CorrelationHeatmap columnProfiles={columnProfiles} csvData={csvData} />
      )}

      {/* Distribution & Box Plots */}
      {numericColumns.length > 0 && (
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Distribution Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a numeric column to view its distribution and detect outliers
            </p>

            {/* Column Selector */}
            <div className="flex flex-wrap gap-2">
              {numericColumns.map((column) => (
                <button
                  key={column.name}
                  onClick={() => setSelectedColumn(column)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedColumn?.name === column.name
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {column.name}
                </button>
              ))}
            </div>
          </div>

          {selectedColumn && (
            <div className="space-y-6">
              {/* Distribution Chart */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Histogram</h4>
                <DistributionChart columnProfile={selectedColumn} csvData={csvData} />
              </div>

              {/* Box Plot */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Box Plot</h4>
                <BoxPlotChart columnProfile={selectedColumn} csvData={csvData} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categorical Analysis */}
      {categoricalColumns.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Categorical Columns Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoricalColumns.map((column) => (
              <div key={column.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{column.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{column.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Values:</span>
                    <span className="font-medium">{column.uniqueCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completeness:</span>
                    <span className="font-medium">{(100 - column.nullPercentage).toFixed(1)}%</span>
                  </div>
                  {column.statistics && 'topValues' in column.statistics && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs text-gray-600 mb-1">Top Values:</div>
                      <div className="space-y-1">
                        {column.statistics.topValues.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]">{item.value}</span>
                            <span className="text-gray-500">({item.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="card p-6 bg-linear-to-r from-primary-50 to-blue-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <svg className="w-6 h-6 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Key Insights
        </h3>
        <div className="space-y-3">
          {numericColumns.length > 0 && (
            <div className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-700">
                Dataset contains <strong>{numericColumns.length} numeric columns</strong> suitable for statistical analysis
              </p>
            </div>
          )}
          {categoricalColumns.length > 0 && (
            <div className="flex items-start">
              <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-700">
                <strong>{categoricalColumns.length} categorical columns</strong> provide context and segmentation opportunities
              </p>
            </div>
          )}
          {numericColumns.some((c) => c.statistics && 'outliers' in c.statistics && (c.statistics as any).outliers.length > 0) && (
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-700">
                Outliers detected in some columns - review box plots for data quality assessment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};