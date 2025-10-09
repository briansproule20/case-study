// /lib/types.ts - Type definitions for Issue-Spotting Practice

export type Subject = 'Torts' | 'Contracts' | 'Crim' | 'ConLaw' | 'Property' | 'CivPro';

export interface SessionConfig {
  subjects: Subject[];
  level: '1L' | '2L' | '3L' | 'Bar' | 'Advanced';
  focus: string; // "Emphasize negligence defenses, ignore damages calculation."
}

export interface FactPattern {
  sourceType: 'upload' | 'paste';
  text: string;           // normalized text extracted from upload or pasted
  filename?: string;
}

export interface IssueNode {
  title: string;          // e.g. "Negligence"
  type: 'Issue' | 'SubIssue' | 'Element' | 'Defense';
  children?: IssueNode[];
  notes?: string;
}

export interface EvaluationScores {
  coverage: number;       // 0-100
  organization: number;   // 0-100
  ruleAccuracy: number;   // 0-100
  applicationQuality: number; // 0-100
  overSpottingPenalty: number; // 0-100 (higher = worse)
  writingClarity: number; // 0-100
  overall: number;        // computed
}

export interface EvaluationFinding {
  issue: string;
  status: 'missed' | 'partially_spotted' | 'spotted';
  comment: string;
}

export interface EvaluationReport {
  rubricVersion: string;
  subjects: Subject[];
  level: '1L' | 'Bar' | 'Advanced';
  expectedIssues: IssueNode[];
  findings: EvaluationFinding[];
  scores: EvaluationScores;
  prioritizedAdvice: string[]; // bullet points
  suggestedIRACOrder: string[]; // ordered list of issue titles
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

