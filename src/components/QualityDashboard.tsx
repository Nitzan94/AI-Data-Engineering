import React from 'react';
import { DataQualityScore } from '../types';
import { getScoreColor, getScoreLabel } from '../utils/qualityScore';

interface QualityDashboardProps {
  score: DataQualityScore;
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({ score }) => {
  const metrics = [
    { name: 'Completeness', value: score.completeness, description: 'Data availability' },
    { name: 'Validity', value: score.validity, description: 'Format correctness' },
    { name: 'Consistency', value: score.consistency, description: 'Data uniformity' },
    { name: 'Accuracy', value: score.accuracy, description: 'Data correctness' },
    { name: 'Uniqueness', value: score.uniqueness, description: 'Duplicate prevention' },
  ];

  const getProgressColor = (value: number): string => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 75) return 'bg-primary-500';
    if (value >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">Data Quality Assessment</h2>

      {/* Overall Score */}
      <div className="mb-8 p-6 bg-linear-to-r from-primary-50 to-primary-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Overall Quality Score</h3>
            <p className="text-sm text-gray-600">{getScoreLabel(score.overall)}</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </div>
            <div className="text-sm text-gray-600 mt-1">out of 100</div>
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{metric.name}</h4>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
              <span className={`text-xl font-bold ${getScoreColor(metric.value)}`}>
                {metric.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${getProgressColor(metric.value)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Quick Insights
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {score.completeness < 80 && (
            <li>• Address missing values to improve completeness</li>
          )}
          {score.validity < 80 && <li>• Review data types and format validation</li>}
          {score.uniqueness < 80 && <li>• Remove duplicate records</li>}
          {score.accuracy < 80 && <li>• Investigate outliers and anomalies</li>}
          {score.overall >= 90 && <li>• Excellent data quality! Focus on maintenance</li>}
        </ul>
      </div>
    </div>
  );
};