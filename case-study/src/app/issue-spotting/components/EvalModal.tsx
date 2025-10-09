'use client';

import { useState } from 'react';
import { X, Loader2, Download, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FactPattern, SessionConfig, EvaluationReport } from '@/lib/types';

interface EvalModalProps {
  factPattern: FactPattern;
  config: SessionConfig;
  onClose: () => void;
}

export function EvalModal({ factPattern, config, onClose }: EvalModalProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      alert('Please enter your answer');
      return;
    }

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factPattern,
          config,
          userAnswer
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const { report: evalReport } = await response.json();
      setReport(evalReport);
    } catch (error) {
      console.error('Evaluation error:', error);
      alert('Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${Date.now()}.json`;
    a.click();
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    
    const md = `# Issue-Spotting Evaluation Report

**Date:** ${new Date().toLocaleDateString()}
**Subjects:** ${report.subjects.join(', ')}
**Level:** ${report.level}
**Rubric Version:** ${report.rubricVersion}

## Overall Score: ${report.scores.overall}/100

### Score Breakdown
- **Coverage:** ${report.scores.coverage}/100
- **Organization:** ${report.scores.organization}/100
- **Rule Accuracy:** ${report.scores.ruleAccuracy}/100
- **Application Quality:** ${report.scores.applicationQuality}/100
- **Writing Clarity:** ${report.scores.writingClarity}/100
- **Over-Spotting Penalty:** ${report.scores.overSpottingPenalty}/100 ${report.scores.overSpottingPenalty > 40 ? '⚠️' : '✓'}

## Findings

${report.findings.map(f => `### ${f.issue}
**Status:** ${f.status}
${f.comment}
`).join('\n')}

## Prioritized Advice

${report.prioritizedAdvice.map((advice, idx) => `${idx + 1}. ${advice}`).join('\n')}

## Suggested IRAC Order

${report.suggestedIRACOrder.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n')}

## Expected Issues

${JSON.stringify(report.expectedIssues, null, 2)}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${Date.now()}.md`;
    a.click();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'spotted':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'partially_spotted':
        return <MinusCircle className="size-4 text-yellow-600" />;
      case 'missed':
        return <AlertCircle className="size-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Evaluate Your Answer</CardTitle>
              <CardDescription>
                Submit your issue-spotting answer for objective evaluation
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
          {!report ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Answer</label>
                <Textarea
                  placeholder="Paste your complete issue-spotting answer here..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleEvaluate}
                disabled={isEvaluating || !userAnswer.trim()}
                className="w-full"
                size="lg"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  'Evaluate My Answer'
                )}
              </Button>
            </>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-4">
                {/* Overall Score */}
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
                  <div className="text-4xl font-bold mb-2 text-primary">
                    {report.scores.overall}/100
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>

                {/* Score Breakdown */}
                <div>
                  <h3 className="font-semibold mb-3">Score Breakdown</h3>
                  <div className="grid gap-2">
                    {Object.entries(report.scores).map(([key, value]) => {
                      if (key === 'overall') return null;
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      const isPenalty = key === 'overSpottingPenalty';
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <span className="text-sm font-medium">{label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all",
                                  isPenalty 
                                    ? value > 40 ? "bg-red-500" : "bg-green-500"
                                    : value >= 70 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className={cn("text-sm font-bold w-12 text-right", getScoreColor(value))}>
                              {value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <h3 className="font-semibold mb-3">Findings</h3>
                  <div className="space-y-2">
                    {report.findings.map((finding, idx) => (
                      <div key={idx} className="rounded-lg border p-3 bg-card">
                        <div className="flex items-start gap-2 mb-2">
                          {getStatusIcon(finding.status)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{finding.issue}</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {finding.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{finding.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prioritized Advice */}
                <div>
                  <h3 className="font-semibold mb-3">Prioritized Advice</h3>
                  <div className="space-y-2">
                    {report.prioritizedAdvice.map((advice, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <Badge variant="secondary" className="shrink-0 mt-0.5">{idx + 1}</Badge>
                        <span>{advice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested IRAC Order */}
                <div>
                  <h3 className="font-semibold mb-3">Suggested IRAC Order</h3>
                  <ol className="space-y-2 list-decimal list-inside text-sm">
                    {report.suggestedIRACOrder.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ol>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleExportJSON} variant="outline" className="flex-1">
                    <Download className="size-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button onClick={handleExportMarkdown} variant="outline" className="flex-1">
                    <Download className="size-4 mr-2" />
                    Export Markdown
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

