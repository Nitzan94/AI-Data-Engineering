import React, { useState } from 'react';
import { DataIssue, ColumnProfile, IssueSeverity } from '../types';
import { IssueDetailCard } from './IssueDetailCard';

interface IssuesOverviewProps {
  issues: DataIssue[];
  columnProfiles: ColumnProfile[];
  totalRows: number;
}

export const IssuesOverview: React.FC<IssuesOverviewProps> = ({
  issues,
  columnProfiles,
  totalRows,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<DataIssue | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'All'>('All');

  const getColumnProfile = (columnName?: string) => {
    return columnProfiles.find((p) => p.name === columnName);
  };

  const issuesBySeverity = {
    Critical: issues.filter((i) => i.severity === 'Critical'),
    High: issues.filter((i) => i.severity === 'High'),
    Medium: issues.filter((i) => i.severity === 'Medium'),
    Low: issues.filter((i) => i.severity === 'Low'),
  };

  const filteredIssues =
    filterSeverity === 'All' ? issues : issues.filter((i) => i.severity === filterSeverity);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'missing_values':
        return '❌';
      case 'duplicates':
        return '🔄';
      case 'outliers':
        return '📊';
      case 'inconsistent_format':
        return '📝';
      case 'type_mismatch':
        return '🔀';
      case 'invalid_values':
        return '⚠️';
      case 'data_quality':
        return '📉';
      case 'schema_issue':
        return '🗂️';
      default:
        return '⚡';
    }
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'border-red-500 hover:bg-red-50';
      case 'High':
        return 'border-orange-500 hover:bg-orange-50';
      case 'Medium':
        return 'border-yellow-500 hover:bg-yellow-50';
      case 'Low':
        return 'border-blue-500 hover:bg-blue-50';
    }
  };

  const getSeverityBadge = (severity: IssueSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'badge-critical';
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      case 'Low':
        return 'badge-low';
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">Data Quality Issues</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['Critical', 'High', 'Medium', 'Low'] as IssueSeverity[]).map((severity) => {
          const count = issuesBySeverity[severity].length;
          const bgColor =
            severity === 'Critical'
              ? 'from-red-50 to-red-100'
              : severity === 'High'
                ? 'from-orange-50 to-orange-100'
                : severity === 'Medium'
                  ? 'from-yellow-50 to-yellow-100'
                  : 'from-blue-50 to-blue-100';

          return (
            <div
              key={severity}
              className={`p-4 bg-linear-to-br ${bgColor} rounded-lg border-2 ${getSeverityColor(severity)} cursor-pointer transition-all`}
              onClick={() => setFilterSeverity(severity)}
            >
              <div className="text-xs font-semibold text-gray-700 uppercase mb-1">
                {severity} Issues
              </div>
              <div className="text-3xl font-bold text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterSeverity('All')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filterSeverity === 'All'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({issues.length})
          </button>
          {(['Critical', 'High', 'Medium', 'Low'] as IssueSeverity[]).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterSeverity === severity
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {severity} ({issuesBySeverity[severity].length})
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-semibold">No issues found!</p>
            <p className="text-sm">Your data quality looks excellent</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const columnProfile = getColumnProfile(issue.column);

            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`p-4 border-l-4 ${getSeverityColor(issue.severity)} border rounded-lg cursor-pointer transition-all bg-white`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getIssueIcon(issue.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={getSeverityBadge(issue.severity)}>
                            {issue.severity}
                          </span>
                          <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                            {issue.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
                          {issue.description}
                        </h3>
                      </div>
                    </div>

                    {issue.column && (
                      <div className="ml-11">
                        <p className="text-sm text-gray-600">
                          Column:{' '}
                          <span className="font-semibold text-gray-900">{issue.column}</span>
                          {columnProfile && (
                            <span className="text-gray-500"> ({columnProfile.type})</span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="ml-11 mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Affects {issue.affectedRows.length} rows
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {((issue.affectedRows.length / totalRows) * 100).toFixed(1)}% of data
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedIssue && (
        <IssueDetailCard
          issue={selectedIssue}
          columnProfile={getColumnProfile(selectedIssue.column)}
          totalRows={totalRows}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};