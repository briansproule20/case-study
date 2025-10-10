'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Paperclip, Send, FileText, BookOpen, Target, Loader2, X, ChevronDown, ChevronRight, Download, Save, Check } from 'lucide-react';
import { saveArtifact, type IssueSpottingData } from '@/lib/db';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { prepareFilesForUpload } from '@/lib/upload-helper';
import type { FactPattern, SessionConfig, LLMMessage, IssueNode, EvaluationReport } from '@/lib/types';
import { EvalModal } from '@/app/issue-spotting/components/EvalModal';
import { IssueTree } from '@/app/issue-spotting/components/IssueTree';
import { Response } from '@/components/ai-elements/response';

const SUBJECTS = ['Torts', 'Contracts', 'Crim', 'ConLaw', 'Property', 'CivPro'] as const;
const LEVELS = ['1L', '2L', '3L', 'Bar', 'Advanced'] as const;

const SAMPLE_FACT_PATTERN = `Alice speeds through a red light while texting and hits Bob, who is jaywalking outside a bar at night. Bob had been drinking. The city's traffic camera was malfunctioning. Bob suffers a broken leg; his employer fires him for missing work.`;

function IssueSpottingContent() {
  const searchParams = useSearchParams();
  // State
  const [factPattern, setFactPattern] = useState<FactPattern | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [config, setConfig] = useState<SessionConfig>({
    subjects: ['Torts'],
    level: '1L',
    focus: ''
  });
  const [messages, setMessages] = useState<Array<LLMMessage & { id: string }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [issueMap, setIssueMap] = useState<IssueNode[] | null>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved artifact if coming from saved-artifacts page
  useEffect(() => {
    const loadId = searchParams?.get('load');
    if (loadId) {
      const savedData = sessionStorage.getItem(`artifact-${loadId}`);
      if (savedData) {
        try {
          const artifact = JSON.parse(savedData);
          const data = artifact.data as IssueSpottingData;
          setFactPattern({ sourceType: 'paste', text: data.factPattern });
          setConfig({ subjects: ['Torts'], level: '1L', focus: data.topic || '' });
          setIsSaved(true);
          sessionStorage.removeItem(`artifact-${loadId}`);
        } catch (err) {
          console.error('Failed to load artifact:', err);
        }
      }
    }
  }, [searchParams]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Prepare file for upload (handles blob storage automatically for large files)
      const formData = await prepareFilesForUpload([file]);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to extract text');

      const { text, filename } = await response.json();
      setFactPattern({
        sourceType: 'upload',
        text,
        filename
      });
      setPastedText(''); // Clear pasted text
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to extract text from file');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle paste
  const handleUsePastedText = () => {
    if (!pastedText.trim()) return;
    setFactPattern({
      sourceType: 'paste',
      text: pastedText
    });
  };

  // Load sample - generate fact pattern based on session setup
  const handleLoadSample = async () => {
    if (config.subjects.length === 0) {
      alert('Please select at least one subject first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-fact-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: config.subjects,
          level: config.level,
          focus: config.focus
        })
      });

      if (!response.ok) throw new Error('Failed to generate fact pattern');

      const { text } = await response.json();
      setPastedText(text);
      setFactPattern({
        sourceType: 'paste',
        text
      });
    } catch (error) {
      console.error('Generate sample error:', error);
      alert('Failed to generate fact pattern. Using default sample.');
      // Fallback to default sample
      setPastedText(SAMPLE_FACT_PATTERN);
      setFactPattern({
        sourceType: 'paste',
        text: SAMPLE_FACT_PATTERN
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start session
  const handleStartSession = async () => {
    if (!factPattern) {
      alert('Please upload or paste a fact pattern first');
      return;
    }

    setSessionStarted(true);
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factPattern,
          config,
          history: []
        })
      });

      if (!response.ok) throw new Error('Failed to start session');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          content += decoder.decode(value, { stream: true });

          // Update message with streaming content
          const assistantMsg: LLMMessage & { id: string } = {
            id: 'assistant-0',
            role: 'assistant',
            content
          };

          setMessages([assistantMsg]);

          // Scroll to bottom
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
        }
      }
    } catch (error) {
      console.error('Start session error:', error);
      alert('Failed to start coaching session');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !factPattern || isLoading) return;

    const userMsg: LLMMessage & { id: string } = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage
    };

    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const history = messages.map(({ role, content }) => ({ role, content }));
      history.push({ role: userMsg.role, content: userMsg.content });

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factPattern,
          config,
          history
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';
      const assistantId = `assistant-${Date.now()}`;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          content += decoder.decode(value, { stream: true });

          // Update message with streaming content
          setMessages(prev => {
            const withoutLastAssistant = prev.filter(m => m.id !== assistantId);
            return [
              ...withoutLastAssistant,
              {
                id: assistantId,
                role: 'assistant',
                content
              }
            ];
          });

          // Scroll to bottom
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear session
  const handleClearSession = () => {
    setSessionStarted(false);
    setMessages([]);
    setCurrentMessage('');
    setIssueMap(null);
    setFactPattern(null);
    setPastedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export issue map function
  const handleExportIssueMap = () => {
    if (!issueMap) return;
    const blob = new Blob([JSON.stringify(issueMap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issue-map-${Date.now()}.json`;
    a.click();
  };

  // Save session function
  const handleSave = async () => {
    if (!factPattern || messages.length === 0) return;

    try {
      const title = `Issue Spotting - ${config.subjects.join(', ')} (${config.level})`;
      const summary = `${factPattern.text.slice(0, 100)}... - ${messages.length} message${messages.length !== 1 ? 's' : ''}`;

      // Extract key issues from messages
      const issues = messages
        .filter(m => m.role === 'assistant')
        .map(m => ({
          issue: 'Issue analysis',
          rule: '',
          analysis: m.content.slice(0, 200),
        }));

      await saveArtifact({
        type: 'issue-spotting',
        title,
        summary,
        data: {
          factPattern: factPattern.text,
          issues,
          topic: config.subjects.join(', '),
        } as IssueSpottingData,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save issue spotting session:', err);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Issue-Spotting Practice</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Upload a fact pattern to identify issues, build IRAC analysis, and evaluate your answers.
        </p>
      </div>

      {!sessionStarted ? (
        // Setup Phase
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Fact Pattern Input */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Fact Pattern
              </CardTitle>
              <CardDescription>
                Upload a file (PDF, DOCX, TXT), paste your fact pattern below, or generate one using the session setup tags and Load Sample button
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fact-pattern-upload"
                />
                <label htmlFor="fact-pattern-upload">
                  <Button variant="outline" disabled={isLoading} asChild>
                    <span>
                      <Paperclip className="size-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                </label>
                <Button variant="outline" onClick={handleLoadSample} disabled={isLoading || config.subjects.length === 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Load Sample'
                  )}
                </Button>
              </div>

              <Textarea
                placeholder="Or paste your fact pattern here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="min-h-[200px]"
              />

              {pastedText && !factPattern && (
                <Button onClick={handleUsePastedText}>
                  Use Pasted Text
                </Button>
              )}

              {factPattern && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                      {factPattern.sourceType === 'upload' ? 'Uploaded' : 'Pasted'}
                    </Badge>
                    {factPattern.filename && (
                      <span className="text-sm text-muted-foreground">{factPattern.filename}</span>
                    )}
                  </div>
                  <ScrollArea className="h-[100px]">
                    <p className="text-sm whitespace-pre-wrap">{factPattern.text}</p>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Configuration */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Session Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subjects (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(subject => (
                    <Badge
                      key={subject}
                      variant={config.subjects.includes(subject) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          subjects: prev.subjects.includes(subject)
                            ? prev.subjects.filter(s => s !== subject)
                            : [...prev.subjects, subject]
                        }));
                      }}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <div className="flex gap-2">
                  {LEVELS.map(level => (
                    <Badge
                      key={level}
                      variant={config.level === level ? 'default' : 'outline'}
                      className="cursor-pointer flex-1 justify-center"
                      onClick={() => setConfig(prev => ({ ...prev, level }))}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Focus & Constraints</label>
                <Textarea
                  placeholder="e.g., 'Emphasize negligence defenses, ignore damages calculation'"
                  value={config.focus}
                  onChange={(e) => setConfig(prev => ({ ...prev, focus: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleStartSession}
                disabled={!factPattern || isLoading || config.subjects.length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <BookOpen className="size-4 mr-2" />
                    Start Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Session Phase
        <div className="grid gap-6 lg:grid-cols-4 flex-1 min-h-0">
          {/* Left: Chat */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Issue-Spotting Assistant
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaved || messages.length === 0}
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
                        Save
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowEvalModal(true)}>
                    Evaluate Answer
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearSession}>
                    Clear Session
                  </Button>
                </div>
              </div>
              <CardDescription>
                {config.subjects.join(', ')} • {config.level} Level
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-lg p-4",
                        msg.role === 'user' ? 'bg-primary/10 ml-12' : 'bg-muted mr-12'
                      )}
                    >
                      <div className="text-xs font-semibold mb-2 uppercase text-muted-foreground">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <Response>{msg.content}</Response>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="rounded-lg p-4 bg-muted mr-12">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2 flex-shrink-0">
                <Textarea
                  placeholder="Ask a question or share your analysis..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px]"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !currentMessage.trim()}>
                  <Send className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Issue Map */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Issue Map</CardTitle>
                {issueMap && (
                  <Button variant="ghost" size="sm" onClick={handleExportIssueMap}>
                    <Download className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {issueMap ? (
                <ScrollArea className="h-full">
                  <IssueTree nodes={issueMap} />
                </ScrollArea>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  Issue map will appear here during analysis
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvalModal && factPattern && (
        <EvalModal
          factPattern={factPattern}
          config={config}
          onClose={() => setShowEvalModal(false)}
        />
      )}
    </div>
  );
}

export default function IssueSpottingPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center p-6">
        <Target className="size-12 text-muted-foreground animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <IssueSpottingContent />
    </Suspense>
  );
}
