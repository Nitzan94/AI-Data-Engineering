import Papa from 'papaparse';
import { CSVData } from '../types';

export const parseCSVFile = (file: File): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, any>[];

        const csvData: CSVData = {
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          fileSize: file.size,
          fileName: file.name,
        };

        resolve(csvData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const validateCSVFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const validExtensions = ['.csv', '.txt'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 100MB limit',
    };
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a CSV file',
    };
  }

  return { valid: true };
};