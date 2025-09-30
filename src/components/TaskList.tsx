import React, { useState } from 'react';
import { DataTask, IssueSeverity } from '../types';
import { TaskCard } from './TaskCard';
import { CodeModal } from './CodeModal';

interface TaskListProps {
  tasks: DataTask[];
  onTaskUpdate: (taskId: string, updates: Partial<DataTask>) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  const [selectedTask, setSelectedTask] = useState<DataTask | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'severity' | 'effort' | 'category'>('severity');

  const getSeverityOrder = (severity: IssueSeverity): number => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return order[severity];
  };

  const filteredTasks = tasks.filter(
    (task) => filterSeverity === 'All' || task.severity === filterSeverity
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'severity') {
      return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
    }
    if (sortBy === 'effort') {
      return a.estimatedEffort.localeCompare(b.estimatedEffort);
    }
    return a.category.localeCompare(b.category);
  });

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Engineering Tasks</h2>
        <div className="text-sm text-gray-600">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as IssueSeverity | 'All')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'severity' | 'effort' | 'category')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="severity">Severity</option>
            <option value="effort">Effort</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['Critical', 'High', 'Medium', 'Low'] as IssueSeverity[]).map((severity) => {
          const count = tasks.filter((t) => t.severity === severity).length;
          const badgeClass =
            severity === 'Critical'
              ? 'badge-critical'
              : severity === 'High'
                ? 'badge-high'
                : severity === 'Medium'
                  ? 'badge-medium'
                  : 'badge-low';

          return (
            <div key={severity} className="p-4 bg-gray-50 rounded-lg text-center">
              <div className={`${badgeClass} mb-2`}>{severity}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>No tasks match the current filter</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewCode={() => setSelectedTask(task)}
              onStatusChange={(status) => onTaskUpdate(task.id, { status })}
            />
          ))
        )}
      </div>

      {/* Code Modal */}
      {selectedTask && (
        <CodeModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};