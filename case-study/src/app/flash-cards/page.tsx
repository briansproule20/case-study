'use client';

import { useState, useRef } from 'react';
import { Paperclip, X, BookOpen, Loader2, FileText, Image, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { prepareFilesForUpload } from '@/lib/upload-helper';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

interface FlashcardDeck {
  flashcards: Flashcard[];
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

export default function FlashCardsPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  const generateFlashcards = async () => {
    if (!files || files.length === 0) {
      setError('Please upload at least one file to generate flashcards.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare files for upload (handles blob storage automatically for large files)
      const formData = await prepareFilesForUpload(files);
      formData.append('instructions', instructions);

      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to generate flashcards: ${response.statusText}`);
      }

      const data = await response.json();
      setDeck(data);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Flashcard generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDeck = () => {
    setDeck(null);
    setFiles(null);
    setInstructions('');
    setError(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const nextCard = () => {
    if (!deck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % deck.flashcards.length);
  };

  const previousCard = () => {
    if (!deck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + deck.flashcards.length) % deck.flashcards.length);
  };

  const currentCard = deck?.flashcards[currentCardIndex];

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-4 sm:p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Legal Flashcards</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Upload your legal materials and generate AI-powered flashcards to master key concepts, terms, and cases.
          </p>
        </div>

        {!deck ? (
          <div className="space-y-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Upload Study Materials
                </CardTitle>
                <CardDescription>
                  Upload legal documents, case briefs, notes, or images to generate flashcards from your materials.
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
                    id="flashcard-file-upload"
                  />
                  <label htmlFor="flashcard-file-upload">
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
                  <label className="text-sm font-medium">Flashcard Instructions (Optional)</label>
                  <Textarea
                    placeholder="Add specific instructions (e.g., 'Focus on constitutional law amendments' or 'Include case names and holdings')"
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
                  onClick={generateFlashcards}
                  disabled={!files || files.length === 0 || isGenerating}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generating Flashcards...
                    </>
                  ) : (
                    <>
                      <BookOpen className="size-4" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Better Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">1</Badge>
                    <p>Upload materials rich with legal terms, case names, statutes, and definitions for comprehensive flashcard generation.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">2</Badge>
                    <p>Include case briefs and class notes to generate flashcards covering holdings, rules, and key facts.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">3</Badge>
                    <p>Add specific instructions to focus on particular topics, legal doctrines, or types of information you want to study.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">4</Badge>
                    <p>Mix different types of documents for diverse flashcards covering definitions, cases, and legal principles.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Flashcard Display */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="size-5" />
                      Your Flashcards
                    </CardTitle>
                    <CardDescription>
                      {deck.flashcards.length} flashcards generated • Card {currentCardIndex + 1} of {deck.flashcards.length}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={resetDeck}>
                    New Deck
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Flashcard */}
                <div className="flex flex-col items-center gap-4">
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="group relative h-[300px] w-full cursor-pointer perspective-1000 sm:h-[350px]"
                  >
                    <div className={cn(
                      "relative h-full w-full transition-transform duration-500 preserve-3d",
                      isFlipped && "rotate-y-180"
                    )}>
                      {/* Front of card */}
                      <div className="absolute inset-0 backface-hidden">
                        <Card className="h-full border-2 border-primary shadow-lg transition-shadow group-hover:shadow-xl">
                          <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                            <Badge variant="secondary" className="mb-4">
                              {currentCard?.category || 'Legal Concept'}
                            </Badge>
                            <p className="text-xl font-semibold leading-relaxed sm:text-2xl">
                              {currentCard?.front}
                            </p>
                            <p className="mt-4 text-xs text-muted-foreground">
                              Click to flip
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Back of card */}
                      <div className="absolute inset-0 rotate-y-180 backface-hidden">
                        <Card className="h-full border-2 border-secondary shadow-lg transition-shadow group-hover:shadow-xl">
                          <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                            <Badge variant="outline" className="mb-4">
                              Answer
                            </Badge>
                            <p className="text-base leading-relaxed sm:text-lg">
                              {currentCard?.back}
                            </p>
                            <p className="mt-4 text-xs text-muted-foreground">
                              Click to flip
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex w-full items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={previousCard}
                      disabled={deck.flashcards.length <= 1}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="shrink-0"
                    >
                      <RotateCw className="size-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={nextCard}
                      disabled={deck.flashcards.length <= 1}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{currentCardIndex + 1} / {deck.flashcards.length}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / deck.flashcards.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* All Cards List */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold text-sm">All Cards in Deck</h3>
                  <div className="grid gap-2">
                    {deck.flashcards.map((card, index) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setCurrentCardIndex(index);
                          setIsFlipped(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                          index === currentCardIndex && "border-primary bg-primary/5"
                        )}
                      >
                        <Badge variant="outline" className="shrink-0">
                          {index + 1}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{card.front}</p>
                          <p className="text-xs text-muted-foreground">{card.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
