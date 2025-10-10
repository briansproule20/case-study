'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, MessageSquare, FileText, AlertCircle, Trash2, Eye, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db, deleteArtifact, type SavedArtifact, type ArtifactType } from '@/lib/db';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const artifactIcons: Record<ArtifactType, React.ReactNode> = {
  flashcard: <BookOpen className="size-5" />,
  quiz: <FileText className="size-5" />,
  chat: <MessageSquare className="size-5" />,
  document: <FileText className="size-5" />,
  'issue-spotting': <AlertCircle className="size-5" />,
};

const artifactLabels: Record<ArtifactType, string> = {
  flashcard: 'Flashcard Deck',
  quiz: 'Quiz',
  chat: 'Chat Session',
  document: 'Document Analysis',
  'issue-spotting': 'Issue Spotting',
};

const artifactColors: Record<ArtifactType, string> = {
  flashcard: 'bg-blue-500/10 text-blue-700 border-blue-200',
  quiz: 'bg-purple-500/10 text-purple-700 border-purple-200',
  chat: 'bg-green-500/10 text-green-700 border-green-200',
  document: 'bg-orange-500/10 text-orange-700 border-orange-200',
  'issue-spotting': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
};

export default function SavedArtifactsPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<ArtifactType | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Use Dexie's live query for reactive updates
  const artifacts = useLiveQuery(
    () => db.artifacts.orderBy('createdAt').reverse().toArray(),
    []
  );

  const filteredArtifacts = artifacts?.filter(
    (artifact) => filterType === 'all' || artifact.type === filterType
  );

  const handleDelete = async (id: number) => {
    await deleteArtifact(id);
    setDeleteConfirm(null);
  };

  const handleOpen = (artifact: SavedArtifact) => {
    // Store the artifact data in sessionStorage for the target page to load
    if (artifact.id) {
      sessionStorage.setItem(`artifact-${artifact.id}`, JSON.stringify(artifact));
    }

    // Navigate to the appropriate page based on type
    switch (artifact.type) {
      case 'flashcard':
        router.push(`/flash-cards?load=${artifact.id}`);
        break;
      case 'quiz':
        router.push(`/quizzes?load=${artifact.id}`);
        break;
      case 'chat':
        // Chats open in a view-only modal instead of the main chat page
        router.push(`/saved-artifacts/view-chat?id=${artifact.id}`);
        break;
      case 'document':
        router.push(`/document-analysis?load=${artifact.id}`);
        break;
      case 'issue-spotting':
        router.push(`/issue-spotting?load=${artifact.id}`);
        break;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const filterOptions: Array<{ value: ArtifactType | 'all'; label: string }> = [
    { value: 'all', label: 'All Artifacts' },
    { value: 'flashcard', label: 'Flashcards' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'chat', label: 'Chats' },
    { value: 'document', label: 'Documents' },
    { value: 'issue-spotting', label: 'Issue Spotting' },
  ];

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Saved Artifacts</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Access all your saved flashcards, quizzes, chats, and analyses in one place.
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterType(option.value)}
              className={cn(
                "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                "hover:border-primary/50 hover:bg-muted/50",
                filterType === option.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-muted bg-background text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Artifacts Grid */}
      {!filteredArtifacts || filteredArtifacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="size-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved artifacts yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Start creating flashcards, quizzes, or analyses and save them to access here later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArtifacts.map((artifact) => (
            <Card key={artifact.id} className="group relative overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-lg p-2 border', artifactColors[artifact.type])}>
                      {artifactIcons[artifact.type]}
                    </div>
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-xs mb-1">
                        {artifactLabels[artifact.type]}
                      </Badge>
                      <CardTitle className="text-base line-clamp-1">{artifact.title}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-3">
                  <CardDescription className="text-sm line-clamp-2 min-h-[40px]">{artifact.summary}</CardDescription>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    <span>{formatDate(artifact.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto">
                  <Button
                    size="sm"
                    onClick={() => handleOpen(artifact)}
                    className="flex-1 gap-2"
                  >
                    <Eye className="size-3" />
                    Open
                  </Button>
                  {deleteConfirm === artifact.id ? (
                    <div className="flex gap-1 flex-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => artifact.id && handleDelete(artifact.id)}
                        className="flex-1 text-xs"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => artifact.id && setDeleteConfirm(artifact.id)}
                      className="px-3"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Storage Info */}
      {artifacts && artifacts.length > 0 && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">Total Saved Artifacts</p>
              <p className="text-2xl font-bold">{artifacts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Stored locally in your browser</p>
              <p className="text-xs text-muted-foreground">Data syncs across tabs automatically</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
