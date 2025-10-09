'use client';

import { useState, useRef } from 'react';
import { Paperclip, X, Loader2, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { uploadFile, formatFileSize, type UploadResult } from '@/lib/upload-helper';
import { cn } from '@/lib/utils';

interface FileUploadWithProgressProps {
  onFileProcessed: (result: { text: string; filename: string }) => void;
  acceptedTypes?: string[];
  className?: string;
}

export function FileUploadWithProgress({
  onFileProcessed,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt'],
  className
}: FileUploadWithProgressProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      // Upload file (handles routing automatically)
      const result = await uploadFile(file);
      setUploadResult(result);
      setUploadProgress(50);

      // Extract text
      setIsProcessing(true);
      const formData = new FormData();

      if (result.method === 'blob') {
        // Large file uploaded to blob
        formData.append('blobUrl', result.blobUrl!);
        formData.append('filename', result.filename);
      } else {
        // Small file direct upload
        formData.append('file', result.file!);
      }

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to extract text: ${response.statusText}`);
      }

      const { text, filename } = await response.json();
      setUploadProgress(100);

      // Call callback with result
      onFileProcessed({ text, filename });
    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setSelectedFile(null);
      setUploadResult(null);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={isUploading || isProcessing}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input">
          <Button variant="outline" disabled={isUploading || isProcessing} asChild>
            <span>
              <Paperclip className="size-4 mr-2" />
              Choose File
            </span>
          </Button>
        </label>
        <span className="text-sm text-muted-foreground">
          {acceptedTypes.join(', ')} • Up to 50MB
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="size-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {selectedFile && (
        <div className="rounded-lg border p-3 bg-card">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="size-5" />
              ) : (
                <FileText className="size-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                {!isUploading && !isProcessing && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </span>
                {uploadResult && (
                  <Badge variant="secondary" className="text-xs">
                    {uploadResult.method === 'blob' ? 'Blob Storage' : 'Direct Upload'}
                  </Badge>
                )}
              </div>

              {(isUploading || isProcessing) && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>
                      {isUploading && !isProcessing ? 'Uploading...' : 'Processing...'}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

