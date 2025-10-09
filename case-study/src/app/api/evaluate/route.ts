import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/echo';
import { generateText } from 'ai';
import type { FactPattern, SessionConfig, EvaluationReport } from '@/lib/types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { factPattern, config, userAnswer }: {
      factPattern: FactPattern;
      config: SessionConfig;
      userAnswer: string;
    } = body;

    // Build system prompt for evaluator with rubric
    const systemPrompt = `You are an objective grader for law school issue-spotting exams.

ROLE:
- Evaluate student answers against expected issues from the fact pattern
- Use a consistent rubric based on the subject(s) and level
- Output ONLY valid JSON matching this TypeScript interface:

interface EvaluationReport {
  rubricVersion: string;
  subjects: string[];
  level: string;
  expectedIssues: Array<{
    title: string;
    type: 'Issue' | 'SubIssue' | 'Element' | 'Defense';
    children?: any[];
    notes?: string;
  }>;
  findings: Array<{
    issue: string;
    status: 'missed' | 'partially_spotted' | 'spotted';
    comment: string;
  }>;
  scores: {
    coverage: number;
    organization: number;
    ruleAccuracy: number;
    applicationQuality: number;
    overSpottingPenalty: number;
    writingClarity: number;
    overall: number;
  };
  prioritizedAdvice: string[];
  suggestedIRACOrder: string[];
}

RUBRIC (scores 0-100):

1. COVERAGE: % of expected major + minor issues identified
   - 90-100: All major issues + most minor issues
   - 70-89: All major issues, some minor ones
   - 50-69: Most major issues
   - 30-49: Some major issues
   - 0-29: Few or no issues identified

2. ORGANIZATION: Logical structure, headings, flow
   - 90-100: Clear headings, logical IRAC order, excellent flow
   - 70-89: Good structure with minor gaps
   - 50-69: Basic organization, some confusion
   - 30-49: Poor structure, hard to follow
   - 0-29: No clear organization

3. RULE ACCURACY: Correct statement of law/tests
   - 90-100: All rules stated correctly and precisely
   - 70-89: Most rules correct, minor errors
   - 50-69: Some rules correct, some errors
   - 30-49: Frequent rule errors
   - 0-29: Rules mostly incorrect or missing

4. APPLICATION QUALITY: Fact weaving and analysis depth
   - 90-100: Excellent fact-to-element mapping, nuanced analysis
   - 70-89: Good fact application, mostly thorough
   - 50-69: Basic application, some conclusory statements
   - 30-49: Weak application, very conclusory
   - 0-29: Little to no fact application

5. OVER-SPOTTING PENALTY: Frivolous or unsupported issues
   - 0-20: No over-spotting (good)
   - 21-40: Minor over-spotting of edge issues (acceptable if marked "minor")
   - 41-60: Moderate over-spotting
   - 61-80: Significant over-spotting
   - 81-100: Severe over-spotting (bad)

6. WRITING CLARITY: Exam-style prose, readability
   - 90-100: Clear, concise, professional
   - 70-89: Generally clear, minor issues
   - 50-69: Adequate but verbose or unclear in places
   - 30-49: Often unclear or disorganized
   - 0-29: Very unclear or illegible

OVERALL = weighted average (Coverage 30%, Organization 15%, Rule 20%, Application 25%, Writing 10%) - OverSpottingPenalty adjustment

EXPECTED ISSUES BY SUBJECT (use as checklist):

TORTS (1L/Bar):
- Negligence: duty, breach, actual causation, proximate causation, damages
- Negligence per se (if statute mentioned)
- Strict liability: abnormally dangerous activities, wild animals
- Intentional torts: battery, assault, IIED, NIED, false imprisonment, trespass to land/chattel
- Defenses: contributory/comparative negligence, assumption of risk, consent
- Vicarious liability, joint & several liability
- Damages: compensatory, punitive (if recklessness)

CONTRACTS (1L/Bar):
- Formation: offer, acceptance, consideration, mutual assent
- Defenses to formation: mistake, fraud, duress, undue influence, unconscionability
- Statute of Frauds
- Performance: conditions, substantial performance, breach
- Remedies: expectation, reliance, restitution, specific performance
- Third-party beneficiaries, assignment, delegation
- UCC Article 2 (if goods involved)

CRIMINAL LAW (1L/Bar):
- Elements: actus reus, mens rea, causation, concurrence
- Specific intent vs. general intent vs. strict liability crimes
- Homicide: murder (degrees), felony murder, manslaughter
- Theft crimes: larceny, robbery, burglary, embezzlement
- Inchoate crimes: attempt, conspiracy, solicitation
- Defenses: self-defense, insanity, intoxication, duress, necessity
- Accomplice liability

CONSTITUTIONAL LAW (1L/Bar):
- Judicial review, standing, mootness, ripeness
- Commerce Clause, taxing/spending power
- Due Process (substantive & procedural)
- Equal Protection: levels of scrutiny
- First Amendment: speech, religion clauses
- Takings Clause
- State action requirement

PROPERTY (1L/Bar):
- Estates: fee simple, life estate, future interests
- Concurrent ownership: joint tenancy, tenancy in common
- Landlord-tenant: types, duties, remedies
- Easements, covenants, servitudes
- Adverse possession
- Recording acts: notice, race, race-notice

CIVIL PROCEDURE (1L/Bar):
- Personal jurisdiction: minimum contacts, long-arm statutes
- Subject matter jurisdiction: federal question, diversity
- Venue, forum non conveniens
- Pleading standards: notice pleading, plausibility (Twombly/Iqbal)
- Joinder: parties, claims
- Discovery disputes
- Summary judgment standard
- Appeals

IMPORTANT:
- Don't penalize reasonable edge issues if student labels them "possible" or "minor"
- Prioritize advice on the biggest gaps first
- Suggest a logical IRAC order (major claims first, then defenses, then remedies)`;

    const userPrompt = `You are grading an issue-spotting answer.

FACT PATTERN:
<<<
${factPattern.text}
>>>

SUBJECTS: ${config.subjects.join(', ')}
LEVEL: ${config.level}
FOCUS: ${config.focus || 'General issue spotting'}

USER ANSWER:
<<<
${userAnswer}
>>>

Return ONLY valid JSON matching the EvaluationReport interface. No markdown, no code blocks, just raw JSON.`;

    const { text } = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    // Parse JSON response
    let report: EvaluationReport;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      report = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse evaluation JSON:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse evaluation response from AI');
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Evaluate API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate evaluation' },
      { status: 500 }
    );
  }
}

