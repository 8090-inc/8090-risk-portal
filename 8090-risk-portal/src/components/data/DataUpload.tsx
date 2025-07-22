import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, AlertCircle, CheckCircle, X, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface DataUploadProps {
  onDataImport: (data: { message: string }) => void;
  onClose: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  details?: {
    risksImported?: number;
    controlsImported?: number;
    errors?: string[];
  };
}

export const DataUpload: React.FC<DataUploadProps> = ({ onDataImport, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/upload/excel', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return {
        success: true,
        message: 'File uploaded successfully',
        details: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const excelFile = droppedFiles.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFile) {
      setFile(excelFile);
      setIsUploading(true);
      const result = await uploadFile(excelFile);
      setUploadResult(result);
      setIsUploading(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsUploading(true);
      const result = await uploadFile(selectedFile);
      setUploadResult(result);
      setIsUploading(false);
    }
  }, []);

  const handleImport = () => {
    if (uploadResult?.success) {
      onDataImport({ message: uploadResult.message });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Import Excel Data</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging 
                ? "border-8090-primary bg-8090-primary/5" 
                : "border-slate-300 hover:border-slate-400"
            )}
          >
            <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-2">
              Drag and drop your Excel file here, or
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={isUploading}
                className="cursor-pointer"
              >
                Browse Files
              </Button>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                <span className="font-medium">Selected file:</span> {file.name}
              </p>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-blue-600 mr-2 animate-pulse" />
                <p className="text-sm text-blue-700">Uploading and processing file...</p>
              </div>
            </div>
          )}

          {uploadResult && (
            <div className={cn(
              "mt-4 p-4 rounded-lg",
              uploadResult.success ? "bg-green-50" : "bg-red-50"
            )}>
              <div className="flex items-start">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    uploadResult.success ? "text-green-800" : "text-red-800"
                  )}>
                    {uploadResult.message}
                  </p>
                  {uploadResult.details && (
                    <div className="mt-2 text-sm text-slate-600">
                      {uploadResult.details.risksImported && (
                        <p>Risks imported: {uploadResult.details.risksImported}</p>
                      )}
                      {uploadResult.details.controlsImported && (
                        <p>Controls imported: {uploadResult.details.controlsImported}</p>
                      )}
                      {uploadResult.details.errors && uploadResult.details.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-red-700">Errors:</p>
                          <ul className="list-disc list-inside">
                            {uploadResult.details.errors.map((error, index) => (
                              <li key={index} className="text-red-600">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {uploadResult?.success && (
              <Button variant="primary" onClick={handleImport}>
                Complete Import
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};