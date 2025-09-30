export interface CSVData {
  headers: string[];
  rows: Record<string, any>[];
  rowCount: number;
  columnCount: number;
  fileSize: number;
  fileName: string;
}

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniquePercentage: number;
  sampleValues: any[];
  statistics?: NumericStatistics | StringStatistics;
  issues: DataIssue[];
}

export type ColumnType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'url'
  | 'mixed'
  | 'unknown';

export interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  outliers: number[];
}

export interface StringStatistics {
  minLength: number;
  maxLength: number;
  avgLength: number;
  patterns: string[];
  topValues: Array<{ value: string; count: number }>;
}

export interface DataIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  column?: string;
  description: string;
  affectedRows: number[];
  suggestedFix?: string;
  autoFixable: boolean;
}

export type IssueType =
  | 'missing_values'
  | 'duplicates'
  | 'outliers'
  | 'inconsistent_format'
  | 'type_mismatch'
  | 'invalid_values'
  | 'data_quality'
  | 'schema_issue';

export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DataTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  severity: IssueSeverity;
  estimatedEffort: string;
  status: TaskStatus;
  relatedIssues: string[];
  dependencies: string[];
  tools: string[];
  codeSnippets: CodeSnippet[];
  validationRules?: string[];
}

export type TaskCategory =
  | 'data_cleaning'
  | 'validation'
  | 'transformation'
  | 'standardization'
  | 'deduplication'
  | 'enrichment'
  | 'automation';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface CodeSnippet {
  language: 'python' | 'sql' | 'javascript';
  code: string;
  description: string;
}

export interface DataQualityScore {
  overall: number;
  completeness: number;
  validity: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
}

export interface AnalysisResult {
  csvData: CSVData;
  columnProfiles: ColumnProfile[];
  issues: DataIssue[];
  tasks: DataTask[];
  qualityScore: DataQualityScore;
  relationships: ColumnRelationship[];
  recommendations: string[];
}

export interface ColumnRelationship {
  column1: string;
  column2: string;
  type: 'correlation' | 'dependency' | 'hierarchy';
  strength: number;
  description: string;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown' | 'github-issues';
  includeCodeSnippets: boolean;
  includeDependencies: boolean;
  includeValidationRules: boolean;
}