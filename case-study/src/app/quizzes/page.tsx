'use client';

import { useState, useRef } from 'react';
import { Paperclip, X, Brain, Loader2, BookOpen, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Quiz {
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

const acceptedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown'
];

export default function QuizzesPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    if (!files) return;
    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    setFiles(dt.files.length > 0 ? dt.files : null);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  const generateQuiz = async () => {
    if (!files || files.length === 0) {
      setError('Please upload at least one file to generate a quiz.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });
      formData.append('instructions', instructions);

      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.statusText}`);
      }

      const data = await response.json();
      setQuiz(data);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setFiles(null);
    setInstructions('');
    setError(null);
    setUserAnswers({});
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    if (!quiz) return { correct: 0, total: 0 };
    let correct = 0;
    quiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: quiz.questions.length };
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-4 sm:p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Legal Knowledge Quiz</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Upload your legal materials and generate a 10-question quiz to test your understanding.
          </p>
        </div>

        {!quiz ? (
          <div className="space-y-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Upload Study Materials
                </CardTitle>
                <CardDescription>
                  Upload legal documents, case briefs, notes, or images to generate a quiz from your materials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept={acceptedFileTypes.join(',')}
                    multiple
                    className="hidden"
                    id="quiz-file-upload"
                  />
                  <label htmlFor="quiz-file-upload">
                    <Button variant="outline" className="cursor-pointer gap-2" asChild>
                      <span>
                        <Paperclip className="size-4" />
                        Choose Files
                      </span>
                    </Button>
                  </label>
                  <span className="text-sm text-muted-foreground">
                    PDF, Word docs, text files, and images
                  </span>
                </div>

                {files && files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Files:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(files).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {file.type.startsWith('image/') ? (
                              <Image className="size-4" />
                            ) : (
                              <FileText className="size-4" />
                            )}
                            <span className="max-w-[150px] truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quiz Instructions (Optional)</label>
                  <Textarea
                    placeholder="Add any specific instructions for the quiz generation (e.g., 'Focus on constitutional law principles' or 'Include questions about contract formation')"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  onClick={generateQuiz}
                  disabled={!files || files.length === 0 || isGenerating}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="size-4" />
                      Generate 10-Question Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Better Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">1</Badge>
                    <p>Upload comprehensive materials including case briefs, notes, and outlines for better quiz coverage.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">2</Badge>
                    <p>Add specific instructions to focus on particular topics or question types you want to practice.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">3</Badge>
                    <p>Include a mix of document types (PDFs, Word docs, images) for varied question generation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quiz Results */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="size-5" />
                      Your Quiz
                    </CardTitle>
                    <CardDescription>
                      Answer all 10 questions then submit to see your score
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!showResults && Object.keys(userAnswers).length === quiz.questions.length && (
                      <Button onClick={() => setShowResults(true)} className="gap-2">
                        Submit Quiz
                      </Button>
                    )}
                    <Button variant="outline" onClick={resetQuiz}>
                      New Quiz
                    </Button>
                  </div>
                </div>
                {showResults && (
                  <div className="mt-4 rounded-lg border border-primary bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <Brain className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          Score: {calculateScore().correct} / {calculateScore().total}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((calculateScore().correct / calculateScore().total) * 100)}% correct
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = userAnswers[question.id];
                    const isAnswered = userAnswer !== undefined;
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <Card 
                        key={question.id} 
                        className={cn(
                          "border-l-4 transition-colors",
                          !isAnswered && "border-l-muted",
                          isAnswered && !showResults && "border-l-primary",
                          showResults && isCorrect && "border-l-green-500",
                          showResults && !isCorrect && "border-l-red-500"
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="mb-2">
                              Question {index + 1}
                            </Badge>
                            {showResults && (
                              <Badge variant={isCorrect ? "default" : "destructive"} className="bg-opacity-10">
                                {isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg leading-relaxed">
                            {question.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => {
                              const isSelected = userAnswer === optionIndex;
                              const isCorrectAnswer = optionIndex === question.correctAnswer;
                              
                              return (
                                <div
                                  key={optionIndex}
                                  onClick={() => !showResults && handleAnswerSelect(question.id, optionIndex)}
                                  className={cn(
                                    "flex items-center space-x-3 rounded-lg border p-3 transition-colors",
                                    !showResults && "cursor-pointer hover:bg-muted/50",
                                    showResults && "cursor-default",
                                    isSelected && !showResults && "border-primary bg-primary/5",
                                    showResults && isSelected && isCorrect && "border-green-500 bg-green-50",
                                    showResults && isSelected && !isCorrect && "border-red-500 bg-red-50",
                                    showResults && !isSelected && isCorrectAnswer && "border-green-500 bg-green-50"
                                  )}
                                >
                                  <div className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                    isSelected && !showResults && "border-primary",
                                    !isSelected && !showResults && "border-muted-foreground",
                                    showResults && isCorrectAnswer && "border-green-500",
                                    showResults && isSelected && !isCorrect && "border-red-500"
                                  )}>
                                    <div className={cn(
                                      "h-2.5 w-2.5 rounded-full transition-all",
                                      isSelected && !showResults && "bg-primary",
                                      showResults && isCorrectAnswer && "bg-green-500",
                                      showResults && isSelected && !isCorrect && "bg-red-500"
                                    )} />
                                  </div>
                                  <span className="flex-1">{option}</span>
                                </div>
                              );
                            })}
            </div>
                          {showResults && (
                            <div className={cn(
                              "rounded-lg p-3 border",
                              isCorrect ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                            )}>
                              <p className="text-sm font-medium mb-1">
                                {isCorrect ? "Great job! " : ""}Explanation:
                              </p>
                              <p className="text-sm">{question.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
