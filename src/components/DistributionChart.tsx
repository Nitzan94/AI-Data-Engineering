import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ColumnProfile, CSVData } from '../types';
import { createDistributionData } from '../utils/chartHelpers';

Chart.register(...registerables);

interface DistributionChartProps {
  columnProfile: ColumnProfile;
  csvData: CSVData;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  columnProfile,
  csvData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chartData = createDistributionData(columnProfile, csvData);
    if (!chartData) return;

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Distribution of ${columnProfile.name}`,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Frequency: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Value Range',
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Frequency',
            },
            beginAtZero: true,
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [columnProfile, csvData]);

  if (columnProfile.type !== 'number') {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Distribution chart is only available for numeric columns</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};