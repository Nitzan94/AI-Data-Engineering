import { DataIssue, ColumnProfile } from '../types';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AIExplanation {
  whatIsThis: string;
  whyProblem: string;
  howToFix: string[];
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

export async function explainIssueWithAI(
  issue: DataIssue,
  columnProfile?: ColumnProfile,
  totalRows?: number
): Promise<AIExplanation> {
  const prompt = `You are a data quality expert. Analyze this data issue and provide a clear, actionable explanation.

Issue Type: ${issue.type}
Severity: ${issue.severity}
Description: ${issue.description}
${columnProfile ? `Column: ${columnProfile.name} (Type: ${columnProfile.type})` : ''}
${columnProfile ? `Null Percentage: ${columnProfile.nullPercentage.toFixed(1)}%` : ''}
${totalRows ? `Total Rows: ${totalRows}` : ''}
Affected Rows: ${issue.affectedRows.length}

Provide a JSON response with this exact structure:
{
  "whatIsThis": "A simple 1-sentence explanation of what this issue is",
  "whyProblem": "2-3 sentences explaining why this is a problem and its business impact",
  "howToFix": ["Fix strategy 1", "Fix strategy 2", "Fix strategy 3"],
  "impact": "Describe the positive impact of fixing this (e.g., 'Improves data completeness by X%')",
  "priority": "high" | "medium" | "low"
}

Be concise, practical, and business-focused. No markdown, just valid JSON.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Data Engineering Task Orchestrator',
      },
      body: JSON.stringify({
        model: 'x-ai/grok-2-1212',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const explanation = JSON.parse(jsonMatch[0]) as AIExplanation;
    return explanation;
  } catch (error) {
    console.error('AI explanation error:', error);

    // Fallback to rule-based explanations
    return getFallbackExplanation(issue, columnProfile);
  }
}

function getFallbackExplanation(
  issue: DataIssue,
  columnProfile?: ColumnProfile
): AIExplanation {
  const explanations: Record<string, AIExplanation> = {
    missing_values: {
      whatIsThis: `${issue.affectedRows.length} rows have missing values in this column`,
      whyProblem:
        'Missing data can skew analysis results, prevent accurate reporting, and indicate data collection problems. It may also cause issues in downstream processes that expect complete data.',
      howToFix: [
        'Contact data sources to fill missing values',
        'Use statistical imputation (mean/median for numbers, mode for categories)',
        'Drop rows if missing data is not critical',
        'Implement validation at data entry point',
      ],
      impact: `Fixing this will improve data completeness by ${columnProfile?.nullPercentage.toFixed(1)}%`,
      priority: columnProfile && columnProfile.nullPercentage > 50 ? 'high' : 'medium',
    },
    duplicates: {
      whatIsThis: `${issue.affectedRows.length} duplicate records found in the dataset`,
      whyProblem:
        'Duplicates can inflate metrics, cause double-counting in analyses, waste storage space, and lead to incorrect business decisions. They often indicate problems in data collection or integration processes.',
      howToFix: [
        'Define primary key columns to identify true duplicates',
        'Keep first/last occurrence based on business logic',
        'Merge duplicate records if they contain complementary information',
        'Implement uniqueness constraints at database level',
      ],
      impact: `Removing duplicates will reduce dataset size and improve accuracy`,
      priority: 'high',
    },
    outliers: {
      whatIsThis: `${issue.affectedRows.length} statistical outliers detected in numeric data`,
      whyProblem:
        'Outliers can be data entry errors, measurement errors, or legitimate extreme values. They can significantly skew statistical analyses like mean and standard deviation, leading to incorrect conclusions.',
      howToFix: [
        'Manually review outliers to determine if they are errors or valid extremes',
        'Cap outliers at reasonable bounds (e.g., IQR method)',
        'Apply winsorization to limit extreme values',
        'Document and keep outliers if they are legitimate business cases',
      ],
      impact: `Addressing outliers will improve statistical accuracy and model performance`,
      priority: 'medium',
    },
    inconsistent_format: {
      whatIsThis: 'Data values follow different formats or patterns',
      whyProblem:
        'Inconsistent formats make data hard to query, analyze, and integrate. They can cause errors in automated processes and make reporting unreliable. Standardization is essential for data quality.',
      howToFix: [
        'Define and enforce a standard format for this field',
        'Use regex patterns to validate and transform data',
        'Implement data validation rules at entry point',
        'Create data transformation pipelines for existing data',
      ],
      impact: `Standardizing formats will improve data consistency and usability`,
      priority: 'medium',
    },
    type_mismatch: {
      whatIsThis: 'Column contains mixed data types instead of uniform type',
      whyProblem:
        'Mixed types prevent proper data typing, cause errors in calculations, and make the data unreliable for analysis. This often indicates poor data validation or integration issues.',
      howToFix: [
        'Convert all values to the correct data type',
        'Identify and fix the source of incorrect types',
        'Implement strict type validation at data entry',
        'Use data quality checks in ETL pipelines',
      ],
      impact: `Fixing type mismatches enables proper data processing and analysis`,
      priority: 'high',
    },
    invalid_values: {
      whatIsThis: 'Column contains values that violate business rules or constraints',
      whyProblem:
        'Invalid values indicate data quality issues, can break business logic, and reduce trust in the data. They may represent system errors or incorrect user input.',
      howToFix: [
        'Define clear validation rules based on business requirements',
        'Replace invalid values with correct ones or nulls',
        'Implement validation at data entry and ETL stages',
        'Set up monitoring to catch future invalid entries',
      ],
      impact: `Removing invalid values will increase data reliability and trustworthiness`,
      priority: 'high',
    },
    data_quality: {
      whatIsThis: 'General data quality issue detected',
      whyProblem:
        'Data quality issues reduce confidence in analytics, lead to poor decisions, and can cause operational problems. High-quality data is essential for business success.',
      howToFix: [
        'Investigate root cause of quality issues',
        'Implement data quality monitoring',
        'Establish data governance processes',
        'Regular data audits and cleansing',
      ],
      impact: `Improving data quality will enhance overall data reliability`,
      priority: 'medium',
    },
    schema_issue: {
      whatIsThis: 'Schema structure or definition problem detected',
      whyProblem:
        'Schema issues can prevent data loading, cause application errors, and make data integration difficult. Proper schema design is fundamental for data systems.',
      howToFix: [
        'Review and update schema definitions',
        'Align schema with business requirements',
        'Document schema changes properly',
        'Use schema versioning and migration tools',
      ],
      impact: `Fixing schema issues will improve system stability and data integration`,
      priority: 'high',
    },
  };

  return (
    explanations[issue.type] || {
      whatIsThis: issue.description,
      whyProblem: 'This issue may affect data quality and analysis accuracy.',
      howToFix: ['Review the issue manually', 'Consult with data team', 'Implement appropriate fixes'],
      impact: 'Fixing this will improve overall data quality',
      priority: 'medium',
    }
  );
}