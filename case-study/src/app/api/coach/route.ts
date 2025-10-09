import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/echo';
import { generateText } from 'ai';
import type { FactPattern, SessionConfig, LLMMessage } from '@/lib/types';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { factPattern, config, history = [] }: {
      factPattern: FactPattern;
      config: SessionConfig;
      history?: LLMMessage[];
    } = body;

    // Build system prompt for coach
    const systemPrompt = `You are an expert law school exam coach specializing in issue spotting and IRAC analysis.

ROLE & BEHAVIOR:
- Help students identify legal issues, sub-issues, elements, and defenses from fact patterns
- Use the Socratic method: ask clarifying questions and give hints rather than full answers (unless the student explicitly asks "just tell me")
- Organize analysis by: Claim → Elements → Defenses → Remedies
- Provide IRAC skeletons (1-3 lines per section) for each major issue
- Keep responses concise, friendly, and exam-practical
- Never invent facts; highlight missing facts as questions
- If a student shares a draft, provide inline annotations of strengths and weaknesses

ISSUE MAP FORMAT:
When presenting issues, structure them as:
- Major Issues (most legally significant)
  - Sub-issues (elements to analyze)
  - Defenses (if applicable)
  - Minor/edge issues (mark as "minor")

CONSTRAINTS FOR THIS SESSION:
- Subjects: ${config.subjects.join(', ')}
- Level: ${config.level}
- Focus: ${config.focus || 'General issue spotting'}

IMPORTANT:
- Respect the subject and level constraints
- Mark low-probability issues as "minor"
- Provide practical exam-writing advice
- Cite rules/tests accurately`;

    const userPrompt = `FACT PATTERN:
<<<
${factPattern.text}
>>>

${history.length > 0 ? `Previous conversation context is in the message history.` : 'This is the start of our issue-spotting session. Please provide an initial analysis with an Issue Map and IRAC scaffolds for the major issues.'}`;

    // Build message history
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userPrompt }
    ];

    const { text } = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    });

    // Try to extract issue map if present (look for structured format)
    let issueMap = null;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        issueMap = JSON.parse(jsonMatch[1]);
      } catch {
        // No valid JSON, that's fine
      }
    }

    return NextResponse.json({
      replyMarkdown: text,
      issueMap
    });
  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coach response' },
      { status: 500 }
    );
  }
}

