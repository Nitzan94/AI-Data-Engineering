import { ColumnProfile, CSVData, NumericStatistics } from '../types';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export function createDistributionData(
  columnProfile: ColumnProfile,
  _csvData: CSVData
): ChartData | null {
  if (columnProfile.type !== 'number' || !columnProfile.statistics) {
    return null;
  }

  const values = _csvData.rows
    .map((row) => row[columnProfile.name])
    .filter((v) => v !== null && v !== undefined && typeof v === 'number') as number[];

  if (values.length === 0) return null;

  // Create histogram bins
  const stats = columnProfile.statistics as NumericStatistics;
  const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)));
  const binWidth = (stats.max - stats.min) / binCount;

  const bins: number[] = new Array(binCount).fill(0);
  const labels: string[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = stats.min + i * binWidth;
    const binEnd = binStart + binWidth;
    labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
  }

  values.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - stats.min) / binWidth), binCount - 1);
    if (binIndex >= 0 && binIndex < binCount) {
      bins[binIndex]++;
    }
  });

  return {
    labels,
    datasets: [
      {
        label: 'Frequency',
        data: bins,
        backgroundColor: 'rgba(14, 165, 233, 0.6)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
    ],
  };
}

export function createBoxPlotData(
  columnProfile: ColumnProfile,
  _csvData: CSVData
): { stats: NumericStatistics; outliers: number[] } | null {
  if (columnProfile.type !== 'number' || !columnProfile.statistics) {
    return null;
  }

  return {
    stats: columnProfile.statistics as NumericStatistics,
    outliers: (columnProfile.statistics as NumericStatistics).outliers,
  };
}

export function calculateCorrelationMatrix(
  columnProfiles: ColumnProfile[],
  csvData: CSVData
): { matrix: number[][]; columns: string[] } | null {
  const numericColumns = columnProfiles.filter((p) => p.type === 'number');

  if (numericColumns.length < 2) {
    return null;
  }

  const columnNames = numericColumns.map((p) => p.name);
  const n = columnNames.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const correlation = calculatePearsonCorrelation(
          csvData.rows.map((row) => row[columnNames[i]]),
          csvData.rows.map((row) => row[columnNames[j]])
        );
        matrix[i][j] = correlation;
      }
    }
  }

  return { matrix, columns: columnNames };
}

function calculatePearsonCorrelation(x: any[], y: any[]): number {
  const validPairs: { x: number; y: number }[] = [];

  for (let i = 0; i < x.length; i++) {
    if (
      typeof x[i] === 'number' &&
      typeof y[i] === 'number' &&
      !isNaN(x[i]) &&
      !isNaN(y[i])
    ) {
      validPairs.push({ x: x[i], y: y[i] });
    }
  }

  if (validPairs.length < 2) return 0;

  const n = validPairs.length;
  const sumX = validPairs.reduce((sum, p) => sum + p.x, 0);
  const sumY = validPairs.reduce((sum, p) => sum + p.y, 0);
  const sumXY = validPairs.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = validPairs.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumY2 = validPairs.reduce((sum, p) => sum + p.y * p.y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;

  return numerator / denominator;
}

export function getCorrelationColor(correlation: number): string {
  // Interpolate between blue (negative) and red (positive)
  if (correlation < 0) {
    const intensity = Math.abs(correlation);
    return `rgba(59, 130, 246, ${intensity})`;
  } else {
    return `rgba(239, 68, 68, ${correlation})`;
  }
}

export function createValueCountsData(
  columnProfile: ColumnProfile,
  csvData: CSVData,
  topN: number = 10
): ChartData | null {
  if (columnProfile.type === 'number') {
    return null;
  }

  const values = csvData.rows
    .map((row) => row[columnProfile.name])
    .filter((v) => v !== null && v !== undefined);

  const counts = new Map<string, number>();
  values.forEach((v) => {
    const key = String(v);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const sortedCounts = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return {
    labels: sortedCounts.map(([label]) => label),
    datasets: [
      {
        label: 'Count',
        data: sortedCounts.map(([, count]) => count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(14, 165, 233, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(251, 146, 60, 0.6)',
          'rgba(168, 85, 247, 0.6)',
        ],
      },
    ],
  };
}