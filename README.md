# 🤖 AI Data Engineering Task Orchestrator

> A premium, enterprise-grade CSV analyzer that automatically assesses data quality, identifies issues, and generates actionable data engineering tasks with code snippets.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔍 Smart Data Analysis
- **Automatic Column Profiling**: Detects data types, patterns, and statistical distributions
- **Quality Assessment**: Comprehensive scoring across completeness, validity, consistency, accuracy, and uniqueness
- **Issue Detection**: Identifies missing values, duplicates, outliers, type mismatches, and inconsistencies

### ✅ Intelligent Task Generation
- **Prioritized Tasks**: Automatically categorizes issues by severity (Critical, High, Medium, Low)
- **Effort Estimation**: Provides realistic time estimates for each task
- **Code Snippets**: Generates ready-to-use Python and SQL code for common fixes
- **Dependency Graphs**: Maps task dependencies for optimal execution order
- **Validation Rules**: Creates data quality checks for ongoing monitoring

### 📊 Advanced Analytics
- **Statistical Profiling**: Quartiles, outliers, distributions, correlations
- **Pattern Recognition**: Detects common data patterns and formats
- **Relationship Mapping**: Identifies dependencies between columns
- **Before/After Tracking**: Monitors data quality improvements over time

### 📤 Export & Integration
- **Multiple Formats**: JSON, Markdown, GitHub Issues
- **Customizable Output**: Include/exclude code snippets, dependencies, validation rules
- **Team Collaboration**: Ready for project management tools and version control

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd ai-data-engineering-orchestrator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 💡 How to Use

1. **Upload CSV File**
   - Drag and drop your CSV file or click to browse
   - Maximum file size: 100MB
   - Local processing only - your data never leaves the browser

2. **Automatic Analysis**
   - AI-powered profiling analyzes your data in real-time
   - Uses Web Workers for performance on large datasets
   - Progress tracking shows analysis status

3. **Review Results**
   - **Overview Tab**: View overall quality score and key metrics
   - **Tasks Tab**: Browse prioritized engineering tasks with code snippets
   - **Data Preview Tab**: Examine your data with issue highlighting
   - **Statistics Tab**: Explore detailed column-level analytics
   - **Export Tab**: Download tasks in your preferred format

4. **Execute Tasks**
   - Copy generated code snippets
   - Follow validation rules
   - Track progress by updating task status

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 7
- **Data Processing**: Papa Parse + Web Workers
- **Charts**: Chart.js (ready for future visualizations)

### Key Components

```
src/
├── components/          # React UI components
│   ├── FileUpload.tsx
│   ├── QualityDashboard.tsx
│   ├── TaskList.tsx
│   ├── DataPreview.tsx
│   └── ...
├── workers/            # Web Workers for data processing
│   └── dataAnalyzer.worker.ts
├── utils/              # Utility functions
│   ├── csvParser.ts
│   ├── taskGenerator.ts
│   └── qualityScore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main application component
```

## 🎯 Use Cases

- **Data Migration Projects**: Assess source data quality before ETL
- **Data Warehouse Onboarding**: Profile new data sources
- **Quality Assurance**: Regular data quality monitoring
- **Team Onboarding**: Generate documentation for new team members
- **Compliance Audits**: Track data quality metrics over time

## 🔒 Security & Privacy

- ✅ **100% Local Processing**: All analysis happens in your browser
- ✅ **No Server Uploads**: Your data never leaves your machine
- ✅ **No Tracking**: No analytics or user tracking
- ✅ **Open Source**: Full transparency in code

## 🌟 Advanced Features (Roadmap)

- [ ] Integration with dbt, Airflow, and other data tools
- [ ] Historical analysis comparison
- [ ] ROI calculator for time saved
- [ ] Compliance checking against governance standards
- [ ] Team collaboration features
- [ ] Custom rule engines
- [ ] API for programmatic access

## 🤝 Contributing

Contributions are welcome! This is a professional-grade tool built with best practices.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with modern web technologies to deliver enterprise-grade data engineering capabilities directly in the browser.

---

**Made for Data Engineers, by Data Engineers** 💼