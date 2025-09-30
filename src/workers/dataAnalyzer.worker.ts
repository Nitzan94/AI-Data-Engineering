import {
  CSVData,
  ColumnProfile,
  ColumnType,
  DataIssue,
  NumericStatistics,
  StringStatistics,
  IssueSeverity,
} from '../types';

interface AnalysisMessage {
  type: 'analyze';
  data: CSVData;
}

interface ProgressMessage {
  type: 'progress';
  progress: number;
  message: string;
}

interface ResultMessage {
  type: 'result';
  columnProfiles: ColumnProfile[];
  issues: DataIssue[];
}

self.onmessage = (e: MessageEvent<AnalysisMessage>) => {
  const { type, data } = e.data;

  if (type === 'analyze') {
    analyzeData(data);
  }
};

function postProgress(progress: number, message: string) {
  const progressMsg: ProgressMessage = { type: 'progress', progress, message };
  self.postMessage(progressMsg);
}

async function analyzeData(csvData: CSVData) {
  postProgress(10, 'Starting data analysis...');

  const columnProfiles: ColumnProfile[] = [];
  const issues: DataIssue[] = [];

  const totalColumns = csvData.headers.length;

  for (let i = 0; i < csvData.headers.length; i++) {
    const columnName = csvData.headers[i];
    postProgress(
      10 + (i / totalColumns) * 70,
      `Analyzing column: ${columnName}...`
    );

    const profile = analyzeColumn(csvData, columnName, issues);
    columnProfiles.push(profile);
  }

  postProgress(85, 'Detecting duplicates...');
  detectDuplicates(csvData, issues);

  postProgress(95, 'Analyzing relationships...');
  // Relationship analysis would go here

  postProgress(100, 'Analysis complete!');

  const result: ResultMessage = {
    type: 'result',
    columnProfiles,
    issues,
  };

  self.postMessage(result);
}

function analyzeColumn(
  csvData: CSVData,
  columnName: string,
  issues: DataIssue[]
): ColumnProfile {
  const values = csvData.rows.map((row) => row[columnName]);
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');

  const nullCount = values.length - nonNullValues.length;
  const nullPercentage = (nullCount / values.length) * 100;

  const uniqueValues = new Set(nonNullValues);
  const uniqueCount = uniqueValues.size;
  const uniquePercentage = (uniqueCount / nonNullValues.length) * 100;

  const type = inferColumnType(nonNullValues);
  const sampleValues = Array.from(uniqueValues).slice(0, 10);

  const columnIssues: DataIssue[] = [];

  // Check for high null percentage
  if (nullPercentage > 50) {
    const issue: DataIssue = {
      id: `${columnName}-null-${Date.now()}`,
      type: 'missing_values',
      severity: nullPercentage > 80 ? 'Critical' : 'High',
      column: columnName,
      description: `Column has ${nullPercentage.toFixed(1)}% missing values`,
      affectedRows: values
        .map((v, idx) => (v === null || v === undefined || v === '' ? idx : -1))
        .filter((idx) => idx !== -1),
      suggestedFix: 'Consider imputation, removal, or data collection improvement',
      autoFixable: false,
    };
    columnIssues.push(issue);
    issues.push(issue);
  }

  // Calculate statistics
  let statistics: NumericStatistics | StringStatistics | undefined;

  if (type === 'number') {
    statistics = calculateNumericStatistics(nonNullValues as number[], columnName, issues);
  } else if (type === 'string') {
    statistics = calculateStringStatistics(nonNullValues as string[]);
  }

  return {
    name: columnName,
    type,
    nullCount,
    nullPercentage,
    uniqueCount,
    uniquePercentage,
    sampleValues,
    statistics,
    issues: columnIssues,
  };
}

function inferColumnType(values: any[]): ColumnType {
  if (values.length === 0) return 'unknown';

  const sample = values.slice(0, Math.min(100, values.length));

  let numericCount = 0;
  let booleanCount = 0;
  let dateCount = 0;
  let emailCount = 0;
  let urlCount = 0;

  for (const value of sample) {
    if (typeof value === 'number' && !isNaN(value)) {
      numericCount++;
    } else if (typeof value === 'boolean') {
      booleanCount++;
    } else if (typeof value === 'string') {
      const str = value.toString().trim();

      if (isValidDate(str)) {
        dateCount++;
      } else if (isEmail(str)) {
        emailCount++;
      } else if (isURL(str)) {
        urlCount++;
      }
    }
  }

  const threshold = sample.length * 0.8;

  if (numericCount >= threshold) return 'number';
  if (booleanCount >= threshold) return 'boolean';
  if (dateCount >= threshold) return 'date';
  if (emailCount >= threshold) return 'email';
  if (urlCount >= threshold) return 'url';
  if (typeof sample[0] === 'string') return 'string';

  return 'mixed';
}

function isValidDate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime()) && str.length > 6;
}

function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isURL(str: string): boolean {
  return /^https?:\/\/.+/.test(str);
}

function calculateNumericStatistics(
  values: number[],
  columnName: string,
  issues: DataIssue[]
): NumericStatistics {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const min = sorted[0];
  const max = sorted[n - 1];
  const mean = sorted.reduce((a, b) => a + b, 0) / n;

  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const q1 = sorted[Math.floor(n * 0.25)];
  const q2 = median;
  const q3 = sorted[Math.floor(n * 0.75)];

  // Detect outliers using IQR method
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = values.filter((v) => v < lowerBound || v > upperBound);

  if (outliers.length > 0) {
    const issue: DataIssue = {
      id: `${columnName}-outliers-${Date.now()}`,
      type: 'outliers',
      severity: outliers.length > n * 0.1 ? 'High' : 'Medium',
      column: columnName,
      description: `Found ${outliers.length} outliers (${((outliers.length / n) * 100).toFixed(1)}%)`,
      affectedRows: [],
      suggestedFix: 'Review outliers for data quality issues or legitimate extreme values',
      autoFixable: false,
    };
    issues.push(issue);
  }

  return {
    min,
    max,
    mean,
    median,
    stdDev,
    quartiles: { q1, q2, q3 },
    outliers,
  };
}

function calculateStringStatistics(values: string[]): StringStatistics {
  const lengths = values.map((v) => v.toString().length);
  let minLength = Infinity;
  let maxLength = -Infinity;
  let totalLength = 0;

  for (const len of lengths) {
    if (len < minLength) minLength = len;
    if (len > maxLength) maxLength = len;
    totalLength += len;
  }

  const avgLength = totalLength / lengths.length;

  // Find top values
  const valueCounts = new Map<string, number>();
  values.forEach((v) => {
    valueCounts.set(v, (valueCounts.get(v) || 0) + 1);
  });

  const topValues = Array.from(valueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));

  // Detect patterns
  const patterns: string[] = [];
  const sampleValue = values[0];
  if (/^\d+$/.test(sampleValue)) patterns.push('numeric');
  if (/^[A-Z]+$/.test(sampleValue)) patterns.push('uppercase');
  if (/^[a-z]+$/.test(sampleValue)) patterns.push('lowercase');
  if (/^\d{4}-\d{2}-\d{2}$/.test(sampleValue)) patterns.push('date-iso');

  return {
    minLength,
    maxLength,
    avgLength,
    patterns,
    topValues,
  };
}

function detectDuplicates(csvData: CSVData, issues: DataIssue[]) {
  const rowStrings = csvData.rows.map((row) => JSON.stringify(row));
  const duplicateIndices: number[] = [];
  const seen = new Set<string>();

  rowStrings.forEach((rowStr, idx) => {
    if (seen.has(rowStr)) {
      duplicateIndices.push(idx);
    } else {
      seen.add(rowStr);
    }
  });

  if (duplicateIndices.length > 0) {
    const issue: DataIssue = {
      id: `duplicates-${Date.now()}`,
      type: 'duplicates',
      severity: duplicateIndices.length > csvData.rowCount * 0.1 ? 'High' : 'Medium',
      description: `Found ${duplicateIndices.length} duplicate rows (${((duplicateIndices.length / csvData.rowCount) * 100).toFixed(1)}%)`,
      affectedRows: duplicateIndices,
      suggestedFix: 'Remove duplicate rows or identify primary key columns',
      autoFixable: true,
    };
    issues.push(issue);
  }
}

export {};