import { ColumnProfile, DataIssue, DataQualityScore, CSVData } from '../types';

export function calculateQualityScore(
  _csvData: CSVData,
  columnProfiles: ColumnProfile[],
  issues: DataIssue[]
): DataQualityScore {
  const completeness = calculateCompleteness(columnProfiles);
  const validity = calculateValidity(columnProfiles, issues);
  const consistency = calculateConsistency(columnProfiles);
  const uniqueness = calculateUniqueness(columnProfiles, issues);
  const accuracy = calculateAccuracy(issues);

  const overall = (completeness + validity + consistency + accuracy + uniqueness) / 5;

  return {
    overall: Math.round(overall * 10) / 10,
    completeness: Math.round(completeness * 10) / 10,
    validity: Math.round(validity * 10) / 10,
    consistency: Math.round(consistency * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    uniqueness: Math.round(uniqueness * 10) / 10,
  };
}

function calculateCompleteness(columnProfiles: ColumnProfile[]): number {
  if (columnProfiles.length === 0) return 100;

  const avgCompleteness =
    columnProfiles.reduce((sum, profile) => {
      return sum + (100 - profile.nullPercentage);
    }, 0) / columnProfiles.length;

  return avgCompleteness;
}

function calculateValidity(_columnProfiles: ColumnProfile[], issues: DataIssue[]): number {
  const typeIssues = issues.filter((i) => i.type === 'type_mismatch' || i.type === 'invalid_values');

  if (typeIssues.length === 0) return 100;

  // Deduct points based on severity and count
  let deduction = 0;
  typeIssues.forEach((issue) => {
    switch (issue.severity) {
      case 'Critical':
        deduction += 20;
        break;
      case 'High':
        deduction += 10;
        break;
      case 'Medium':
        deduction += 5;
        break;
      case 'Low':
        deduction += 2;
        break;
    }
  });

  return Math.max(0, 100 - deduction);
}

function calculateConsistency(columnProfiles: ColumnProfile[]): number {
  if (columnProfiles.length === 0) return 100;

  // Check for mixed types and inconsistent formats
  const mixedTypeColumns = columnProfiles.filter((p) => p.type === 'mixed');

  if (mixedTypeColumns.length === 0) return 100;

  const inconsistencyPercentage = (mixedTypeColumns.length / columnProfiles.length) * 100;

  return Math.max(0, 100 - inconsistencyPercentage * 2);
}

function calculateUniqueness(_columnProfiles: ColumnProfile[], issues: DataIssue[]): number {
  const duplicateIssues = issues.filter((i) => i.type === 'duplicates');

  if (duplicateIssues.length === 0) return 100;

  // Deduct based on duplicate percentage
  // Note: In a real implementation, we would calculate this from actual data
  const duplicatePercentage = 5; // Placeholder

  return Math.max(0, 100 - duplicatePercentage * 5);
}

function calculateAccuracy(issues: DataIssue[]): number {
  const accuracyIssues = issues.filter(
    (i) => i.type === 'outliers' || i.type === 'data_quality' || i.type === 'inconsistent_format'
  );

  if (accuracyIssues.length === 0) return 100;

  let deduction = 0;
  accuracyIssues.forEach((issue) => {
    switch (issue.severity) {
      case 'Critical':
        deduction += 15;
        break;
      case 'High':
        deduction += 8;
        break;
      case 'Medium':
        deduction += 4;
        break;
      case 'Low':
        deduction += 1;
        break;
    }
  });

  return Math.max(0, 100 - deduction);
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-primary-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}