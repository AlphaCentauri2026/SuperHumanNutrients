'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Loader2,
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  total: number;
  successes: string[];
  errors: string[];
  sampleData: Record<string, string>[];
}

export default function CSVImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Starting upload...');
    setStartTime(Date.now());
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/food-groups/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        setUploadStatus('Import completed successfully!');
        setUploadProgress(100);
      } else {
        setUploadStatus('Import failed');
        setUploadProgress(0);
      }
    } catch {
      setImportResult({
        success: false,
        message: 'Upload failed',
        imported: 0,
        total: 0,
        successes: [],
        errors: ['Network error occurred'],
        sampleData: [],
      });
      setUploadStatus('Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,category,description,caloriesPer100g,proteinPer100g,carbsPer100g,fatPer100g,fiberPer100g,nutrients,benefits,subcategory,seasonality,glycemicIndex
Apple,fruits,"Sweet, crisp fruit rich in fiber and antioxidants",52,0.3,14,0.2,2.4,"Vitamin C;Potassium;Fiber","Heart health;Digestive health;Immune support",pome fruits,fall,36
Banana,fruits,"Yellow fruit high in potassium and natural sugars",89,1.1,23,0.3,2.6,"Potassium;Vitamin B6;Fiber","Energy boost;Heart health;Muscle function",tropical fruits,year-round,51`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'foods_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setImportResult(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('');
    setStartTime(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return '';
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Food Database
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How to Import:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the template below to see the required format</li>
            <li>Prepare your CSV file with the exact column headers</li>
            <li>Drag and drop your CSV file or click to browse</li>
            <li>Click &quot;Import Foods&quot; to add them to your database</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">CSV Template</h4>
            <p className="text-sm text-gray-600">
              Download the template to see the required format
            </p>
          </div>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <FileText className="w-8 h-8" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? 'Importing...' : 'Import Foods'}
                </Button>
                <Button onClick={clearResults} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drag and drop your CSV file here
                </p>
                <p className="text-gray-500">or</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-2"
                >
                  Browse Files
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{uploadStatus}</span>
              <span className="text-gray-500">{getElapsedTime()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border ${
                importResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <h4
                  className={`font-medium ${
                    importResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {importResult.success
                    ? 'Import Successful!'
                    : 'Import Failed'}
                </h4>
              </div>
              <p
                className={`text-sm ${
                  importResult.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {importResult.message}
              </p>
              {importResult.success && (
                <div className="mt-2 text-sm text-green-600">
                  <p>
                    Imported: {importResult.imported} / {importResult.total}{' '}
                    foods
                  </p>
                </div>
              )}
            </div>

            {/* Successes */}
            {importResult.successes.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">
                  Successfully Imported:
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResult.successes.map((success, index) => (
                    <div
                      key={index}
                      className="text-sm text-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {success}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-sm text-red-700 flex items-center gap-2"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Data Preview */}
            {importResult.sampleData && importResult.sampleData.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Sample Imported Data:
                </h4>
                <div className="space-y-2">
                  {importResult.sampleData.map((food, index) => (
                    <div
                      key={index}
                      className="text-sm bg-white p-2 rounded border"
                    >
                      <div className="font-medium">{food.name}</div>
                      <div className="text-gray-600">
                        {food.category} • {food.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={clearResults} variant="outline" className="w-full">
              Import Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
