'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Loader2, FileSearch, Scale, BookOpen, ClipboardList, ListOrdered, AlertCircle, Save, Check } from 'lucide-react';
import { prepareFilesForUpload } from '@/lib/upload-helper';
import { saveArtifact, type DocumentData } from '@/lib/db';
import { useSearchParams } from 'next/navigation';

const analysisOptions = [
  {
    id: 'understand',
    label: 'Help me understand this assignment',
    icon: BookOpen,
    prompt: 'Please help me understand this assignment. Break down the key requirements, tasks, and deliverables. Explain what is being asked in clear, simple terms.',
  },
  {
    id: 'summarize',
    label: 'Summarize this document',
    icon: FileText,
    prompt: 'Please provide a comprehensive summary of this document. Include the main points, key arguments, and important details.',
  },
  {
    id: 'legal-issues',
    label: 'Identify legal issues',
    icon: Scale,
    prompt: 'Analyze this document and identify all legal issues, questions, and areas of concern. Organize them by category (e.g., contract law, tort law, constitutional law, etc.).',
  },
  {
    id: 'key-points',
    label: 'Extract key points',
    icon: ListOrdered,
    prompt: 'Extract and list the key points, holdings, and important details from this document in a structured format.',
  },
  {
    id: 'case-brief',
    label: 'Create case brief',
    icon: ClipboardList,
    prompt: 'Create a case brief following the standard format: Facts, Issues, Holdings, Reasoning, and Disposition. If this is not a case, organize the information in a similar structured format.',
  },
  {
    id: 'outline',
    label: 'Generate outline',
    icon: FileSearch,
    prompt: 'Create a detailed outline of this document, organizing the content hierarchically with main topics, subtopics, and key details.',
  },
];

export default function DocumentAnalysisPage() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved artifact if coming from saved-artifacts page
  useEffect(() => {
    const loadId = searchParams?.get('load');
    if (loadId) {
      const savedData = sessionStorage.getItem(`artifact-${loadId}`);
      if (savedData) {
        try {
          const artifact = JSON.parse(savedData);
          const data = artifact.data as DocumentData;
          setAnalysisResult(data.analysis);
          setExtractedText(data.extractedText || '');
          // Create a fake file reference for display
          const fileName = data.fileName;
          setFile(new File([], fileName, { type: 'application/pdf' }));
          setIsSaved(true);
          sessionStorage.removeItem(`artifact-${loadId}`);
        } catch (err) {
          console.error('Failed to load artifact:', err);
        }
      }
    }
  }, [searchParams]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setAnalysisResult('');
    setExtractedText('');
    setIsExtracting(true);

    try {
      // Use prepareFilesForUpload to handle blob storage for large files
      const formData = await prepareFilesForUpload([selectedFile]);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from file');
      }

      const data = await response.json();
      setExtractedText(data.text);
    } catch (err) {
      setError('Failed to process file. Please try again.');
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalysis = async (optionId: string) => {
    if (!extractedText) {
      setError('Please upload a document first');
      return;
    }

    const option = analysisOptions.find(opt => opt.id === optionId);
    if (!option) return;

    setSelectedOption(optionId);
    setIsAnalyzing(true);
    setError('');
    setAnalysisResult('');
    setIsSaved(false);

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: extractedText,
          prompt: option.prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (err) {
      setError('Failed to analyze document. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setSelectedOption(null);
    }
  };

  const handleSave = async () => {
    if (!analysisResult || !file) return;

    try {
      const title = `${file.name} - Analysis`;
      const summary = `Document analysis for ${file.name} (${(analysisResult.length / 100).toFixed(0)} words)`;

      await saveArtifact({
        type: 'document',
        title,
        summary,
        data: {
          analysis: analysisResult,
          fileName: file.name,
          extractedText,
        } as DocumentData,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save document analysis:', err);
      setError('Failed to save analysis');
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Document Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Upload legal documents, assignments, or case briefs to get insights and analysis.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a PDF, Word document, or text file to begin analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
                  {isExtracting ? (
                    <>
                      <Loader2 className="mb-4 size-12 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Processing document...</p>
                    </>
                  ) : file ? (
                    <>
                      <FileText className="mb-4 size-12 text-primary" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Click to upload a different file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-4 size-12 text-muted-foreground" />
                      <p className="font-medium">Click to upload a document</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF, Word, or text files supported
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="hidden"
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Options */}
        {extractedText && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Analysis Options</CardTitle>
              <CardDescription>
                Choose how you'd like to analyze your document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {analysisOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedOption === option.id;

                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-auto justify-start gap-2 p-4 text-left whitespace-normal"
                      onClick={() => handleAnalysis(option.id)}
                      disabled={isAnalyzing}
                    >
                      {isActive ? (
                        <Loader2 className="size-5 flex-shrink-0 animate-spin" />
                      ) : (
                        <Icon className="size-5 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-sm">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {analysisResult && (
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    Analysis of your document
                  </CardDescription>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaved}
                  variant="secondary"
                  className="gap-2"
                  size="sm"
                >
                  {isSaved ? (
                    <>
                      <Check className="size-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <Textarea
                  value={analysisResult}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!extractedText && !isExtracting && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <FileSearch className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Ready to Analyze</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Upload a document above to get started with legal analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
