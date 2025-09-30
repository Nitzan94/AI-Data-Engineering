import React, { useCallback, useState } from 'react';
import { parseCSVFile, validateCSVFile } from '../utils/csvParser';
import { CSVData } from '../types';

interface FileUploadProps {
  onFileUpload: (data: CSVData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      const validation = validateCSVFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setIsProcessing(false);
        return;
      }

      try {
        const csvData = await parseCSVFile(file);
        onFileUpload(csvData);
      } catch (err) {
        setError('Failed to parse CSV file. Please check the file format.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold"
            >
              {isProcessing ? 'Processing...' : 'Click to upload'}
            </label>
            <span className="text-gray-600"> or drag and drop</span>
          </div>

          <p className="text-sm text-gray-500">CSV or TXT files up to 100MB</p>
        </div>

        {isProcessing && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};