'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Paperclip, X, Brain, Loader2, BookOpen, FileText, Image, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveArtifact, type QuizData } from '@/lib/db';
import { useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { prepareFilesForUpload } from '@/lib/upload-helper';

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

const QUESTION_COUNTS = [5, 10, 15, 20] as const;

function QuizzesContent() {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<FileList | null>(null);
  const [instructions, setInstructions] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved artifact if coming from saved-artifacts page
  useEffect(() => {
    const loadId = searchParams?.get('load');
    if (loadId) {
      const savedData = sessionStorage.getItem(`artifact-${loadId}`);
      if (savedData) {
        try {
          const artifact = JSON.parse(savedData);
          const data = artifact.data as QuizData;
          setQuiz({ questions: data.questions });
          setInstructions(data.instructions || '');
          setFileNames(data.fileNames || []);
          if (data.userAnswers) {
            setUserAnswers(data.userAnswers);
            setAnsweredQuestions(new Set(Object.keys(data.userAnswers).map(Number)));
          }
          setIsSaved(true);
          sessionStorage.removeItem(`artifact-${loadId}`);
        } catch (err) {
          console.error('Failed to load artifact:', err);
        }
      }
    }
  }, [searchParams]);

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
    setIsSaved(false);

    try {
      // Store file names for saving later
      const names = Array.from(files).map(f => f.name);
      setFileNames(names);

      // Prepare files for upload (handles blob storage automatically for large files)
      const formData = await prepareFilesForUpload(files);
      formData.append('instructions', instructions);
      formData.append('questionCount', questionCount.toString());

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

  const handleSave = async () => {
    if (!quiz) return;

    try {
      const score = calculateScore();
      const title = fileNames.length > 0
        ? `${fileNames[0]} - ${quiz.questions.length} Questions`
        : `Quiz - ${quiz.questions.length} Questions`;

      const summary = allQuestionsAnswered
        ? `Completed with ${score.correct}/${score.total} correct (${Math.round((score.correct / score.total) * 100)}%)`
        : `${quiz.questions.length} question quiz, ${answeredQuestions.size} answered`;

      await saveArtifact({
        type: 'quiz',
        title,
        summary,
        data: {
          questions: quiz.questions,
          userAnswers,
          score: score.correct,
          completed: allQuestionsAnswered,
          instructions,
          fileNames,
        } as QuizData,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setError('Failed to save quiz');
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setFiles(null);
    setInstructions('');
    setError(null);
    setUserAnswers({});
    setAnsweredQuestions(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    // Don't allow changing answer after it's been submitted
    if (answeredQuestions.has(questionId)) return;

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));

    // Mark question as answered (shows immediate feedback)
    setAnsweredQuestions(prev => new Set(prev).add(questionId));
  };

  const allQuestionsAnswered = quiz ? answeredQuestions.size === quiz.questions.length : false;

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
                  <label className="text-sm font-medium">Number of Questions</label>
                  <div className="grid grid-cols-4 gap-2">
                    {QUESTION_COUNTS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={cn(
                          "rounded-lg border-2 py-3 text-center font-semibold transition-all",
                          "hover:border-primary/50 hover:bg-muted/50",
                          "active:scale-95",
                          questionCount === count
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-muted bg-background text-foreground"
                        )}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

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
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generating {questionCount}-Question Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="size-4" />
                      Generate {questionCount}-Question Quiz
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
            {/* Quiz Header with Progress */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="size-5" />
                      Your Quiz
                    </CardTitle>
                    <CardDescription>
                      Select an answer to see immediate feedback and learn as you go
                    </CardDescription>
                    {/* Progress Indicator */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(answeredQuestions.size / quiz.questions.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {answeredQuestions.size} / {quiz.questions.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:self-start">
                    <Button
                      onClick={handleSave}
                      disabled={isSaved}
                      variant="secondary"
                      className="gap-2"
                    >
                      {isSaved ? (
                        <>
                          <Check className="size-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          Save Quiz
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetQuiz}>
                      New Quiz
                    </Button>
                  </div>
                </div>

                {/* Final Score - Shows when all questions answered */}
                {allQuestionsAnswered && (
                  <div className="mt-4 rounded-lg border-2 border-primary bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <Brain className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          Final Score: {calculateScore().correct} / {calculateScore().total}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((calculateScore().correct / calculateScore().total) * 100)}% correct
                          {calculateScore().correct === calculateScore().total && " - Perfect score! 🎉"}
                          {calculateScore().correct >= calculateScore().total * 0.8 && calculateScore().correct < calculateScore().total && " - Great job!"}
                          {calculateScore().correct >= calculateScore().total * 0.6 && calculateScore().correct < calculateScore().total * 0.8 && " - Good effort!"}
                          {calculateScore().correct < calculateScore().total * 0.6 && " - Keep studying!"}
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
                    const isAnswered = answeredQuestions.has(question.id);
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <Card
                        key={question.id}
                        className={cn(
                          "border-l-4 transition-all duration-300",
                          !isAnswered && "border-l-muted",
                          isAnswered && isCorrect && "border-l-green-500 shadow-sm",
                          isAnswered && !isCorrect && "border-l-red-500 shadow-sm"
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="mb-2">
                              Question {index + 1}
                            </Badge>
                            {isAnswered && (
                              <Badge
                                variant={isCorrect ? "default" : "destructive"}
                                className={cn(
                                  "transition-all",
                                  isCorrect ? "bg-green-500" : "bg-red-500"
                                )}
                              >
                                {isCorrect ? "✓ Correct" : "✗ Incorrect"}
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
                                  onClick={() => handleAnswerSelect(question.id, optionIndex)}
                                  className={cn(
                                    "flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200",
                                    !isAnswered && "cursor-pointer hover:bg-muted/50 hover:border-primary/50",
                                    isAnswered && "cursor-default",
                                    isSelected && !isAnswered && "border-primary bg-primary/5",
                                    isAnswered && isSelected && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/20",
                                    isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/20",
                                    isAnswered && !isSelected && isCorrectAnswer && "border-green-500 bg-green-50 dark:bg-green-950/20"
                                  )}
                                >
                                  <div className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                                    isSelected && !isAnswered && "border-primary",
                                    !isSelected && !isAnswered && "border-muted-foreground",
                                    isAnswered && isCorrectAnswer && "border-green-500 bg-green-500",
                                    isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-500"
                                  )}>
                                    {isAnswered && isCorrectAnswer && (
                                      <span className="text-white text-xs">✓</span>
                                    )}
                                    {isAnswered && isSelected && !isCorrect && (
                                      <span className="text-white text-xs">✗</span>
                                    )}
                                    {!isAnswered && isSelected && (
                                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  <span className="flex-1">{option}</span>
                                </div>
                              );
                            })}
            </div>
                          {/* Show explanation immediately after answering */}
                          {isAnswered && (
                            <div className={cn(
                              "rounded-lg p-4 border-2 animate-in slide-in-from-top-2 duration-300",
                              isCorrect
                                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                                : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                            )}>
                              <p className="text-sm font-semibold mb-2">
                                {isCorrect ? "🎉 Correct!" : "📚 Learn from this:"}
                              </p>
                              <p className="text-sm leading-relaxed">{question.explanation}</p>
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

export default function QuizzesPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center p-6">
        <Brain className="size-12 text-muted-foreground animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <QuizzesContent />
    </Suspense>
  );
}
