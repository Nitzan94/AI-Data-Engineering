import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { QualityDashboard } from './components/QualityDashboard';
import { TaskList } from './components/TaskList';
import { DataPreview } from './components/DataPreview';
import { ColumnStatistics } from './components/ColumnStatistics';
import { ExportPanel } from './components/ExportPanel';
import { IssuesOverview } from './components/IssuesOverview';
import { EDAOverview } from './components/EDAOverview';
import { CSVData, AnalysisResult, DataTask, ColumnProfile, DataIssue } from './types';
import { generateTasks } from './utils/taskGenerator';
import { calculateQualityScore } from './utils/qualityScore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type AppState = 'upload' | 'analyzing' | 'results';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'tasks' | 'eda' | 'data' | 'stats' | 'export'>(
    'overview'
  );

  const handleFileUpload = useCallback((csvData: CSVData) => {
    setState('analyzing');
    setProgress(0);
    setProgressMessage('Initializing analysis...');

    // Create worker
    const worker = new Worker(new URL('./workers/dataAnalyzer.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        setProgress(e.data.progress);
        setProgressMessage(e.data.message);
      } else if (e.data.type === 'result') {
        const { columnProfiles, issues } = e.data as {
          columnProfiles: ColumnProfile[];
          issues: DataIssue[];
        };

        // Generate tasks
        const tasks = generateTasks(issues, columnProfiles);

        // Calculate quality score
        const qualityScore = calculateQualityScore(csvData, columnProfiles, issues);

        const result: AnalysisResult = {
          csvData,
          columnProfiles,
          issues,
          tasks,
          qualityScore,
          relationships: [],
          recommendations: generateRecommendations(qualityScore, issues),
        };

        setAnalysisResult(result);
        setState('results');
        worker.terminate();
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      alert('Analysis failed. Please try again.');
      setState('upload');
      worker.terminate();
    };

    worker.postMessage({ type: 'analyze', data: csvData });
  }, []);

  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<DataTask>) => {
    setAnalysisResult((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setState('upload');
    setAnalysisResult(null);
    setProgress(0);
    setProgressMessage('');
    setActiveTab('overview');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Modern Gradient Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-lg shadow-slate-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo/Icon with gradient */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              {/* Title with gradient text */}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-2">
                  AI Data Engineering
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/50">
                    v1.0
                  </Badge>
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Intelligent CSV analysis powered by AI
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {state === 'results' && (
                <>
                  <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Analysis Complete
                  </Badge>
                  <Separator orientation="vertical" className="h-8 hidden sm:block" />
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200/50 text-blue-700 font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    New Analysis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subtle animated gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state === 'upload' && (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Your CSV File to Begin
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI-powered analysis engine will automatically profile your data, detect quality
                issues, and generate prioritized engineering tasks with code snippets.
              </p>
            </div>

            <FileUpload onFileUpload={handleFileUpload} />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto text-left">
              <FeatureCard
                icon="🔍"
                title="Smart Analysis"
                description="Automatic column profiling, type detection, and statistical analysis"
              />
              <FeatureCard
                icon="⚠️"
                title="Issue Detection"
                description="Identifies missing values, duplicates, outliers, and inconsistencies"
              />
              <FeatureCard
                icon="✅"
                title="Task Generation"
                description="Generates actionable tasks with code snippets and effort estimates"
              />
            </div>
          </div>
        )}

        {state === 'analyzing' && (
          <div className="max-w-2xl mx-auto">
            <div className="card p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full animate-pulse">
                  <svg
                    className="w-8 h-8 text-primary-600 animate-spin"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Data</h2>
              <p className="text-gray-600 mb-6">{progressMessage}</p>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
            </div>
          </div>
        )}

        {state === 'results' && analysisResult && (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'issues', label: 'Issues', icon: '⚠️', badge: analysisResult.issues.length },
                  { id: 'tasks', label: 'Tasks', icon: '✅', badge: analysisResult.tasks.length },
                  { id: 'eda', label: 'EDA', icon: '📈' },
                  { id: 'data', label: 'Data Preview', icon: '📋' },
                  { id: 'stats', label: 'Statistics', icon: '🔢' },
                  { id: 'export', label: 'Export', icon: '📤' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span className="ml-2 bg-primary-100 text-primary-800 py-0.5 px-2 rounded-full text-xs">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <QualityDashboard score={analysisResult.qualityScore} />

                  {analysisResult.recommendations.length > 0 && (
                    <div className="card p-6">
                      <h2 className="text-2xl font-bold mb-4">Key Recommendations</h2>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <svg
                              className="w-5 h-5 text-primary-600 mr-2 mt-0.5 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'issues' && (
                <IssuesOverview
                  issues={analysisResult.issues}
                  columnProfiles={analysisResult.columnProfiles}
                  totalRows={analysisResult.csvData.rowCount}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskList tasks={analysisResult.tasks} onTaskUpdate={handleTaskUpdate} />
              )}

              {activeTab === 'eda' && (
                <EDAOverview
                  columnProfiles={analysisResult.columnProfiles}
                  csvData={analysisResult.csvData}
                />
              )}

              {activeTab === 'data' && (
                <DataPreview
                  data={analysisResult.csvData}
                  columnProfiles={analysisResult.columnProfiles}
                />
              )}

              {activeTab === 'stats' && (
                <ColumnStatistics profiles={analysisResult.columnProfiles} />
              )}

              {activeTab === 'export' && <ExportPanel tasks={analysisResult.tasks} />}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>AI Data Engineering Task Orchestrator • Built with React & TypeScript</p>
        <p className="mt-1">🔒 All processing happens locally in your browser</p>
      </footer>
    </div>
  );
}

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

function generateRecommendations(
  qualityScore: AnalysisResult['qualityScore'],
  issues: DataIssue[]
): string[] {
  const recommendations: string[] = [];

  if (qualityScore.completeness < 80) {
    recommendations.push(
      'Improve data completeness by addressing missing values in critical columns'
    );
  }

  if (qualityScore.uniqueness < 80) {
    recommendations.push('Remove duplicate records to ensure data uniqueness');
  }

  if (qualityScore.validity < 80) {
    recommendations.push('Implement data validation rules to ensure format correctness');
  }

  const criticalIssues = issues.filter((i) => i.severity === 'Critical');
  if (criticalIssues.length > 0) {
    recommendations.push(`Address ${criticalIssues.length} critical data quality issues immediately`);
  }

  if (qualityScore.overall >= 90) {
    recommendations.push('Excellent data quality! Focus on maintaining current standards');
  }

  return recommendations;
}

export default App;