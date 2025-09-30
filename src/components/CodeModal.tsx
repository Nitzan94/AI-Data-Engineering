import React, { useState } from 'react';
import { DataTask } from '../types';

interface CodeModalProps {
  task: DataTask;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ task, onClose }) => {
  const [selectedSnippet, setSelectedSnippet] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const code = task.codeSnippets[selectedSnippet].code;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
          {/* Code Snippet Tabs */}
          {task.codeSnippets.length > 1 && (
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {task.codeSnippets.map((snippet, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSnippet(idx)}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    selectedSnippet === idx
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {snippet.language.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Snippet Description */}
          <p className="text-sm text-gray-600 mb-4">
            {task.codeSnippets[selectedSnippet].description}
          </p>

          {/* Code Block */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleCopy}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
              <code className="text-sm font-mono">
                {task.codeSnippets[selectedSnippet].code}
              </code>
            </pre>
          </div>

          {/* Validation Rules */}
          {task.validationRules && task.validationRules.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Validation Rules</h3>
              <ul className="space-y-2">
                {task.validationRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tools */}
          {task.tools.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Tools</h3>
              <div className="flex flex-wrap gap-2">
                {task.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Effort Estimate */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Estimated Effort</div>
                <div className="text-lg font-semibold text-gray-900">{task.estimatedEffort}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Category</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {task.category.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button onClick={handleCopy} className="btn-primary">
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
};