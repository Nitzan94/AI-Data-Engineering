import React, { useState, useEffect } from 'react';
import { DataIssue, ColumnProfile } from '../types';
import { explainIssueWithAI } from '../services/aiExplainer';

interface IssueDetailCardProps {
  issue: DataIssue;
  columnProfile?: ColumnProfile;
  totalRows?: number;
  onClose: () => void;
}

export const IssueDetailCard: React.FC<IssueDetailCardProps> = ({
  issue,
  columnProfile,
  totalRows,
  onClose,
}) => {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [explanation, setExplanation] = useState(issue.aiExplanation);

  useEffect(() => {
    if (!explanation && !isLoadingAI) {
      loadAIExplanation();
    }
  }, []);

  const loadAIExplanation = async () => {
    setIsLoadingAI(true);
    try {
      const aiExplanation = await explainIssueWithAI(issue, columnProfile, totalRows);
      setExplanation(aiExplanation);
    } catch (error) {
      console.error('Failed to load AI explanation:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getSeverityColor = () => {
    switch (issue.severity) {
      case 'Critical':
        return 'bg-red-50 border-red-200';
      case 'High':
        return 'bg-orange-50 border-orange-200';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getSeverityBadge = () => {
    switch (issue.severity) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b border-2 ${getSeverityColor()}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={getSeverityBadge()}>{issue.severity}</span>
                <span className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
                  {issue.type.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{issue.description}</h2>
              {issue.column && (
                <p className="text-sm text-gray-600">
                  Column: <span className="font-semibold">{issue.column}</span>
                  {columnProfile && ` (${columnProfile.type})`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingAI ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full animate-pulse mb-4">
                <svg
                  className="w-6 h-6 text-primary-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Generating AI-powered explanation...</p>
            </div>
          ) : explanation ? (
            <div className="space-y-6">
              {/* What is this? */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  What is this?
                </h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{explanation.whatIsThis}</p>
              </div>

              {/* Why is this a problem? */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-orange-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Why is this a problem?
                </h3>
                <p className="text-gray-700 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  {explanation.whyProblem}
                </p>
              </div>

              {/* How to fix? */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  How to fix this?
                </h3>
                <div className="space-y-2">
                  {explanation.howToFix.map((fix, idx) => (
                    <div
                      key={idx}
                      className="flex items-start bg-green-50 p-3 rounded-lg border border-green-200"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 flex-1">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-primary-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Expected Impact
                </h3>
                <p className="text-primary-900 font-medium">{explanation.impact}</p>
              </div>

              {/* Affected Rows Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Affected Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Affected Rows</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {issue.affectedRows.length}
                    </p>
                  </div>
                  {totalRows && (
                    <div>
                      <p className="text-xs text-gray-600">Percentage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {((issue.affectedRows.length / totalRows) * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No explanation available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            AI-Powered Explanation
          </div>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};