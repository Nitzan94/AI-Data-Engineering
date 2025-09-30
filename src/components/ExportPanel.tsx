import React, { useState } from 'react';
import { DataTask, ExportOptions } from '../types';

interface ExportPanelProps {
  tasks: DataTask[];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ tasks }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeCodeSnippets: true,
    includeDependencies: true,
    includeValidationRules: true,
  });

  const generateJSON = () => {
    const data = tasks.map((task) => ({
      title: task.title,
      description: task.description,
      severity: task.severity,
      category: task.category,
      estimatedEffort: task.estimatedEffort,
      tools: task.tools,
      ...(options.includeCodeSnippets && { codeSnippets: task.codeSnippets }),
      ...(options.includeDependencies && { dependencies: task.dependencies }),
      ...(options.includeValidationRules && { validationRules: task.validationRules }),
    }));

    return JSON.stringify(data, null, 2);
  };

  const generateMarkdown = () => {
    let md = '# Data Engineering Tasks\n\n';
    md += `Generated: ${new Date().toISOString()}\n`;
    md += `Total Tasks: ${tasks.length}\n\n`;

    md += '## Task Summary\n\n';
    const bySeverity = {
      Critical: tasks.filter((t) => t.severity === 'Critical').length,
      High: tasks.filter((t) => t.severity === 'High').length,
      Medium: tasks.filter((t) => t.severity === 'Medium').length,
      Low: tasks.filter((t) => t.severity === 'Low').length,
    };

    for (const [severity, count] of Object.entries(bySeverity)) {
      md += `- **${severity}**: ${count}\n`;
    }

    md += '\n## Tasks\n\n';

    tasks.forEach((task, idx) => {
      md += `### ${idx + 1}. ${task.title}\n\n`;
      md += `**Severity**: ${task.severity} | **Category**: ${task.category} | **Effort**: ${task.estimatedEffort}\n\n`;
      md += `${task.description}\n\n`;

      if (task.tools.length > 0) {
        md += `**Tools**: ${task.tools.join(', ')}\n\n`;
      }

      if (options.includeCodeSnippets && task.codeSnippets.length > 0) {
        md += '**Code Snippets**:\n\n';
        task.codeSnippets.forEach((snippet) => {
          md += `\`\`\`${snippet.language}\n`;
          md += `${snippet.code}\n`;
          md += '```\n\n';
        });
      }

      if (options.includeValidationRules && task.validationRules && task.validationRules.length > 0) {
        md += '**Validation Rules**:\n\n';
        task.validationRules.forEach((rule) => {
          md += `- ${rule}\n`;
        });
        md += '\n';
      }

      md += '---\n\n';
    });

    return md;
  };

  const generateGitHubIssues = () => {
    return tasks
      .map((task) => {
        let body = task.description + '\n\n';
        body += `**Category**: ${task.category}\n`;
        body += `**Estimated Effort**: ${task.estimatedEffort}\n`;
        body += `**Tools**: ${task.tools.join(', ')}\n\n`;

        if (options.includeCodeSnippets && task.codeSnippets.length > 0) {
          body += '## Code Snippets\n\n';
          task.codeSnippets.forEach((snippet) => {
            body += `### ${snippet.language}\n`;
            body += '```' + snippet.language + '\n';
            body += snippet.code + '\n';
            body += '```\n\n';
          });
        }

        return {
          title: `[${task.severity}] ${task.title}`,
          body,
          labels: [task.severity.toLowerCase(), task.category],
        };
      })
      .map((issue, idx) => `## Issue ${idx + 1}\n\n**Title**: ${issue.title}\n\n${issue.body}\n\n---\n\n`)
      .join('');
  };

  const handleExport = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (options.format) {
      case 'json':
        content = generateJSON();
        filename = 'data-engineering-tasks.json';
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = generateMarkdown();
        filename = 'data-engineering-tasks.md';
        mimeType = 'text/markdown';
        break;
      case 'github-issues':
        content = generateGitHubIssues();
        filename = 'github-issues.md';
        mimeType = 'text/markdown';
        break;
      default:
        content = generateJSON();
        filename = 'tasks.json';
        mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-6">Export Tasks</h2>

      <div className="space-y-4 mb-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="space-y-2">
            {[
              { value: 'json', label: 'JSON', desc: 'Machine-readable format for integrations' },
              { value: 'markdown', label: 'Markdown', desc: 'Human-readable documentation' },
              {
                value: 'github-issues',
                label: 'GitHub Issues',
                desc: 'Ready-to-import GitHub issues',
              },
            ].map((format) => (
              <label
                key={format.value}
                className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={options.format === format.value}
                  onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-sm text-gray-600">{format.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Include</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeCodeSnippets}
                onChange={(e) =>
                  setOptions({ ...options, includeCodeSnippets: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Code snippets</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeDependencies}
                onChange={(e) =>
                  setOptions({ ...options, includeDependencies: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Task dependencies</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeValidationRules}
                onChange={(e) =>
                  setOptions({ ...options, includeValidationRules: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Validation rules</span>
            </label>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button onClick={handleExport} className="btn-primary w-full flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export Tasks
      </button>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip</strong>: For GitHub Issues format, copy the content and use GitHub's bulk
          issue creation or CLI tools to import.
        </p>
      </div>
    </div>
  );
};