import React from 'react';
import { DataTask, TaskStatus } from '../types';

interface TaskCardProps {
  task: DataTask;
  onViewCode: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onViewCode, onStatusChange }) => {
  const getSeverityClass = () => {
    switch (task.severity) {
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

  const getStatusClass = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = () => {
    switch (task.category) {
      case 'data_cleaning':
        return '🧹';
      case 'validation':
        return '✓';
      case 'transformation':
        return '🔄';
      case 'standardization':
        return '📏';
      case 'deduplication':
        return '🗑️';
      case 'enrichment':
        return '✨';
      case 'automation':
        return '⚙️';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getCategoryIcon()}</span>
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <span className={getSeverityClass()}>{task.severity}</span>
          <span className={`badge ${getStatusClass()}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{task.estimatedEffort}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="capitalize">{task.category.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Tools */}
      {task.tools.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-700 mb-1">Recommended Tools:</div>
          <div className="flex flex-wrap gap-1">
            {task.tools.slice(0, 3).map((tool, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tool}
              </span>
            ))}
            {task.tools.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{task.tools.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {task.dependencies.length > 0 && (
        <div className="mb-3 text-xs text-gray-600">
          <span className="font-semibold">⚠️ Depends on {task.dependencies.length} other task(s)</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={onViewCode}
          className="btn-primary text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          View Code
        </button>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </div>
  );
};