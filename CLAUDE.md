# AI Data Engineering Task Orchestrator - Claude Instructions

## Project Overview
Enterprise-grade CSV analyzer with AI-powered data quality assessment and automated task generation.

## Tech Stack
- **Frontend**: React 19 + TypeScript (strict mode)
- **Build**: Vite 7
- **Styling**: Tailwind CSS 3
- **Charts**: Chart.js
- **CSV Parsing**: Papa Parse
- **AI**: OpenRouter API (Grok 2 free)
- **Processing**: Web Workers for large datasets

## Project Structure
```
src/
├── components/          # React UI components
│   ├── FileUpload.tsx
│   ├── QualityDashboard.tsx
│   ├── IssuesOverview.tsx
│   ├── IssueDetailCard.tsx
│   ├── TaskList.tsx
│   ├── TaskCard.tsx
│   ├── CodeModal.tsx
│   ├── EDAOverview.tsx
│   ├── DistributionChart.tsx
│   ├── CorrelationHeatmap.tsx
│   ├── BoxPlotChart.tsx
│   ├── DataPreview.tsx
│   ├── ColumnStatistics.tsx
│   └── ExportPanel.tsx
├── services/            # API integrations
│   └── aiExplainer.ts
├── workers/             # Web Workers
│   └── dataAnalyzer.worker.ts
├── utils/               # Helper functions
│   ├── csvParser.ts
│   ├── taskGenerator.ts
│   ├── qualityScore.ts
│   └── chartHelpers.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Main app
└── main.tsx             # Entry point
```

## Key Features

### 1. Data Analysis Engine
- Automatic column profiling and type detection
- Statistical analysis (mean, median, std dev, quartiles)
- Pattern recognition for emails, URLs, dates
- Outlier detection using IQR method
- Missing value and duplicate detection

### 2. AI-Powered Explanations
- OpenRouter API integration (Grok 2)
- Detailed issue explanations:
  - "What is this?"
  - "Why is this a problem?"
  - "How to fix?" (3-4 strategies)
  - Expected impact
- Fallback to heuristic explanations if API fails

### 3. Task Generation
- Automatic prioritization by severity
- Python & SQL code snippets
- Effort estimation
- Dependency graphs
- Validation rules

### 4. EDA Visualizations
- Distribution histograms (Chart.js)
- Correlation heatmap with color coding
- Box plots for outlier visualization
- Categorical value counts

### 5. Export Capabilities
- JSON for programmatic use
- Markdown for documentation
- GitHub Issues format for project management

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Important Notes

### Data Processing
- All processing happens in the browser (100% local)
- Uses Web Workers to prevent UI blocking
- Max file size: 100MB
- Supports CSV and TXT files

### AI Integration
- API Key: Stored in `src/services/aiExplainer.ts`
- Model: x-ai/grok-2-1212 (fast, free)
- Endpoint: OpenRouter API
- Fallback: Built-in heuristic explanations

### Code Quality
- TypeScript strict mode enabled
- React 19 with hooks
- Functional components only
- No class components
- Error boundaries implemented

## Common Tasks

### Adding New Issue Type
1. Add type to `IssueType` in `types/index.ts`
2. Update `getFallbackExplanation()` in `aiExplainer.ts`
3. Add icon mapping in `IssuesOverview.tsx`

### Adding New Chart Type
1. Create component in `components/`
2. Add helper function in `utils/chartHelpers.ts`
3. Integrate in `EDAOverview.tsx`

### Modifying AI Prompts
Edit the prompt in `explainIssueWithAI()` function in `src/services/aiExplainer.ts`

## Performance Optimizations
- Web Workers for CPU-intensive analysis
- Lazy loading for charts
- Memoization for expensive calculations
- Pagination for large datasets
- Sample-based analysis for huge files

## Security
- No data leaves the browser
- No external API calls except OpenRouter (optional)
- API key not exposed in client (should move to env var)
- Input validation on all file uploads
- Sanitized outputs

## Future Improvements
See PROJECT_SUMMARY.md for detailed roadmap.