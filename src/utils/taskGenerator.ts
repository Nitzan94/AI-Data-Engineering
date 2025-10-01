import {
  DataIssue,
  DataTask,
  ColumnProfile,
  IssueSeverity,
} from '../types';

export function generateTasks(
  issues: DataIssue[],
  columnProfiles: ColumnProfile[]
): DataTask[] {
  const tasks: DataTask[] = [];

  // Group issues by type
  const issuesByType = new Map<string, DataIssue[]>();
  issues.forEach((issue) => {
    const existing = issuesByType.get(issue.type) || [];
    existing.push(issue);
    issuesByType.set(issue.type, existing);
  });

  // Generate tasks for missing values
  const missingValueIssues = issuesByType.get('missing_values') || [];
  if (missingValueIssues.length > 0) {
    tasks.push(createMissingValueTask(missingValueIssues));
  }

  // Generate tasks for duplicates
  const duplicateIssues = issuesByType.get('duplicates') || [];
  if (duplicateIssues.length > 0) {
    tasks.push(createDuplicateTask(duplicateIssues));
  }

  // Generate tasks for outliers
  const outlierIssues = issuesByType.get('outliers') || [];
  if (outlierIssues.length > 0) {
    tasks.push(createOutlierTask(outlierIssues));
  }

  // Generate data validation task
  tasks.push(createDataValidationTask(columnProfiles));

  // Generate schema standardization task
  tasks.push(createSchemaStandardizationTask(columnProfiles));

  // Assign dependencies
  assignTaskDependencies(tasks);

  return tasks;
}

function createMissingValueTask(issues: DataIssue[]): DataTask {
  const criticalColumns = issues.filter((i) => i.severity === 'Critical');
  const highestSeverity = criticalColumns.length > 0 ? 'Critical' : 'High';

  const affectedColumns = issues.map((i) => i.column).filter(Boolean);

  const pythonCode = `import pandas as pd

# Load data
df = pd.read_csv('your_data.csv')

# Option 1: Drop rows with missing values in critical columns
critical_cols = ${JSON.stringify(affectedColumns)}
df_cleaned = df.dropna(subset=critical_cols)

# Option 2: Impute missing values
# For numeric columns - use mean/median
numeric_cols = df.select_dtypes(include=['number']).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

# For categorical columns - use mode
categorical_cols = df.select_dtypes(include=['object']).columns
df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])

# Save cleaned data
df_cleaned.to_csv('cleaned_data.csv', index=False)
print(f"Removed {len(df) - len(df_cleaned)} rows with missing values")`;

  const sqlCode = `-- Check missing value counts
SELECT
    ${affectedColumns.map((col) => `SUM(CASE WHEN "${col}" IS NULL THEN 1 ELSE 0 END) as ${col}_nulls`).join(',\n    ')}
FROM your_table;

-- Remove rows with critical missing values
DELETE FROM your_table
WHERE ${affectedColumns.map((col) => `"${col}" IS NULL`).join(' OR ')};`;

  return {
    id: `task-missing-values-${Date.now()}`,
    title: 'Handle Missing Values',
    description: `Address missing values in ${affectedColumns.length} columns. ${criticalColumns.length > 0 ? `${criticalColumns.length} columns have critical levels (>80% missing).` : ''}`,
    category: 'data_cleaning',
    severity: highestSeverity as IssueSeverity,
    estimatedEffort: '2-4 hours',
    status: 'pending',
    relatedIssues: issues.map((i) => i.id),
    dependencies: [],
    tools: ['pandas', 'SQL', 'data imputation libraries'],
    codeSnippets: [
      {
        language: 'python',
        code: pythonCode,
        description: 'Handle missing values with multiple strategies',
      },
      {
        language: 'sql',
        code: sqlCode,
        description: 'Check and remove rows with missing values',
      },
    ],
    validationRules: [
      'Verify no critical columns have >5% missing values after processing',
      'Document imputation strategy for audit trail',
      'Compare before/after statistics',
    ],
  };
}

function createDuplicateTask(issues: DataIssue[]): DataTask {
  const totalDuplicates = issues.reduce((sum, i) => sum + i.affectedRows.length, 0);

  const pythonCode = `import pandas as pd

# Load data
df = pd.read_csv('your_data.csv')

# Check for duplicates
duplicates = df[df.duplicated(keep=False)]
print(f"Found {len(duplicates)} duplicate rows")

# Option 1: Remove all duplicates, keep first occurrence
df_deduped = df.drop_duplicates(keep='first')

# Option 2: Remove duplicates based on specific columns
key_columns = ['column1', 'column2']  # Define your key columns
df_deduped = df.drop_duplicates(subset=key_columns, keep='first')

# Option 3: Identify and review duplicates before removal
duplicate_groups = df[df.duplicated(subset=key_columns, keep=False)]
duplicate_groups.to_csv('duplicates_review.csv', index=False)

# Save deduplicated data
df_deduped.to_csv('deduplicated_data.csv', index=False)
print(f"Removed {len(df) - len(df_deduped)} duplicate rows")`;

  const sqlCode = `-- Find duplicate rows
WITH duplicates AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY column1, column2 ORDER BY id) as rn
    FROM your_table
)
SELECT * FROM duplicates WHERE rn > 1;

-- Remove duplicates, keep first occurrence
DELETE FROM your_table
WHERE id NOT IN (
    SELECT MIN(id)
    FROM your_table
    GROUP BY column1, column2
);`;

  return {
    id: `task-duplicates-${Date.now()}`,
    title: 'Remove Duplicate Records',
    description: `Remove ${totalDuplicates} duplicate rows from the dataset. Define primary key columns to prevent future duplicates.`,
    category: 'deduplication',
    severity: totalDuplicates > 100 ? 'High' : 'Medium',
    estimatedEffort: '1-2 hours',
    status: 'pending',
    relatedIssues: issues.map((i) => i.id),
    dependencies: [],
    tools: ['pandas', 'SQL', 'data deduplication tools'],
    codeSnippets: [
      {
        language: 'python',
        code: pythonCode,
        description: 'Identify and remove duplicate rows',
      },
      {
        language: 'sql',
        code: sqlCode,
        description: 'Find and delete duplicate records',
      },
    ],
    validationRules: [
      'Verify all duplicates are removed',
      'Ensure no data loss of unique records',
      'Document deduplication strategy',
    ],
  };
}

function createOutlierTask(issues: DataIssue[]): DataTask {
  const affectedColumns = issues.map((i) => i.column).filter(Boolean);

  const pythonCode = `import pandas as pd
import numpy as np
from scipy import stats

# Load data
df = pd.read_csv('your_data.csv')

numeric_cols = ${JSON.stringify(affectedColumns)}

# Method 1: IQR method for outlier detection
def remove_outliers_iqr(df, columns):
    df_clean = df.copy()
    for col in columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR

        # Flag outliers
        outliers = (df[col] < lower_bound) | (df[col] > upper_bound)
        print(f"{col}: {outliers.sum()} outliers detected")

        # Option 1: Remove outliers
        df_clean = df_clean[~outliers]

        # Option 2: Cap outliers at bounds
        # df_clean[col] = df_clean[col].clip(lower_bound, upper_bound)

    return df_clean

# Method 2: Z-score method (assuming normal distribution)
def remove_outliers_zscore(df, columns, threshold=3):
    df_clean = df.copy()
    for col in columns:
        z_scores = np.abs(stats.zscore(df[col].dropna()))
        outliers = z_scores > threshold
        df_clean = df_clean[~outliers]
    return df_clean

df_cleaned = remove_outliers_iqr(df, numeric_cols)
df_cleaned.to_csv('cleaned_data.csv', index=False)`;

  return {
    id: `task-outliers-${Date.now()}`,
    title: 'Handle Outliers in Numeric Columns',
    description: `Detect and handle outliers in ${affectedColumns.length} numeric columns. Determine if outliers are data errors or legitimate extreme values.`,
    category: 'data_cleaning',
    severity: 'Medium',
    estimatedEffort: '2-3 hours',
    status: 'pending',
    relatedIssues: issues.map((i) => i.id),
    dependencies: [],
    tools: ['pandas', 'scipy', 'numpy', 'statistical analysis tools'],
    codeSnippets: [
      {
        language: 'python',
        code: pythonCode,
        description: 'Detect and handle outliers using IQR and Z-score methods',
      },
    ],
    validationRules: [
      'Review outliers manually before removal',
      'Document outlier treatment strategy',
      'Verify data distribution after treatment',
    ],
  };
}

function createDataValidationTask(columnProfiles: ColumnProfile[]): DataTask {
  const validationRules = columnProfiles.map((profile) => {
    switch (profile.type) {
      case 'email':
        return `"${profile.name}" must be a valid email address`;
      case 'url':
        return `"${profile.name}" must be a valid URL`;
      case 'number':
        return `"${profile.name}" must be numeric`;
      case 'date':
        return `"${profile.name}" must be a valid date`;
      default:
        return `"${profile.name}" must not be null`;
    }
  });

  const pythonCode = `import pandas as pd
import re

# Load data
df = pd.read_csv('your_data.csv')

# Define validation functions
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, str(email)))

def validate_url(url):
    pattern = r'^https?:\\/\\/[^\\s/$.?#].[^\\s]*$'
    return bool(re.match(pattern, str(url)))

def validate_date(date_str):
    try:
        pd.to_datetime(date_str)
        return True
    except:
        return False

# Apply validations
validation_results = {}

${columnProfiles
  .filter((p) => ['email', 'url', 'date'].includes(p.type))
  .map(
    (p) => `
# Validate ${p.name}
if '${p.name}' in df.columns:
    validation_results['${p.name}'] = df['${p.name}'].apply(validate_${p.type})
    invalid_count = (~validation_results['${p.name}']).sum()
    print(f"${p.name}: {invalid_count} invalid entries")
`
  )
  .join('\n')}

# Export validation report
validation_df = pd.DataFrame(validation_results)
validation_df.to_csv('validation_report.csv', index=False)`;

  return {
    id: `task-validation-${Date.now()}`,
    title: 'Implement Data Validation Rules',
    description: `Create and apply validation rules for all ${columnProfiles.length} columns to ensure data quality.`,
    category: 'validation',
    severity: 'High',
    estimatedEffort: '3-4 hours',
    status: 'pending',
    relatedIssues: [],
    dependencies: [],
    tools: ['pandas', 'Great Expectations', 'Pydantic'],
    codeSnippets: [
      {
        language: 'python',
        code: pythonCode,
        description: 'Implement validation rules for different data types',
      },
    ],
    validationRules,
  };
}

function createSchemaStandardizationTask(columnProfiles: ColumnProfile[]): DataTask {
  const pythonCode = `import pandas as pd

# Load data
df = pd.read_csv('your_data.csv')

# Standardize column names (lowercase, snake_case)
df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('[^a-z0-9_]', '', regex=True)

# Convert data types
type_conversions = {
${columnProfiles
  .map((p) => {
    const pandasType =
      p.type === 'number'
        ? 'float64'
        : p.type === 'date'
          ? 'datetime64'
          : p.type === 'boolean'
            ? 'bool'
            : 'string';
    return `    '${p.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}': '${pandasType}'`;
  })
  .join(',\n')}
}

for col, dtype in type_conversions.items():
    if col in df.columns:
        try:
            if dtype == 'datetime64':
                df[col] = pd.to_datetime(df[col], errors='coerce')
            else:
                df[col] = df[col].astype(dtype)
        except Exception as e:
            print(f"Error converting {col} to {dtype}: {e}")

# Standardize string formats
string_cols = df.select_dtypes(include=['object', 'string']).columns
for col in string_cols:
    df[col] = df[col].str.strip()  # Remove whitespace
    df[col] = df[col].str.title()  # Standardize capitalization

df.to_csv('standardized_data.csv', index=False)
print("Schema standardization complete")`;

  return {
    id: `task-schema-${Date.now()}`,
    title: 'Standardize Data Schema',
    description: `Standardize column names, data types, and formats across the dataset. Ensure consistency for downstream processing.`,
    category: 'standardization',
    severity: 'Medium',
    estimatedEffort: '2-3 hours',
    status: 'pending',
    relatedIssues: [],
    dependencies: [],
    tools: ['pandas', 'schema validation libraries'],
    codeSnippets: [
      {
        language: 'python',
        code: pythonCode,
        description: 'Standardize schema, column names, and data types',
      },
    ],
    validationRules: [
      'All column names follow naming convention',
      'All data types are correctly assigned',
      'String formats are consistent',
    ],
  };
}

function assignTaskDependencies(tasks: DataTask[]) {
  // Data cleaning tasks should come first
  const cleaningTasks = tasks.filter((t) => t.category === 'data_cleaning');
  const validationTasks = tasks.filter((t) => t.category === 'validation');
  const standardizationTasks = tasks.filter((t) => t.category === 'standardization');

  // Validation depends on cleaning
  validationTasks.forEach((task) => {
    task.dependencies = cleaningTasks.map((t) => t.id);
  });

  // Standardization can run in parallel with validation but after cleaning
  standardizationTasks.forEach((task) => {
    task.dependencies = cleaningTasks.map((t) => t.id);
  });
}