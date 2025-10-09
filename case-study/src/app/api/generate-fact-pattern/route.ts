import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/echo';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { subjects, level, focus } = await request.json();

    if (!subjects || subjects.length === 0) {
      return NextResponse.json(
        { error: 'At least one subject is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a law school professor creating an issue-spotting fact pattern for students.

REQUIREMENTS:
- Subjects: ${subjects.join(', ')}
- Level: ${level}
${focus ? `- Additional Focus: ${focus}` : ''}

Create a realistic, exam-style fact pattern (150-250 words) that:
1. Involves multiple legal issues from the specified subjects
2. Is appropriate for ${level} level students
3. Contains enough facts to spot 4-6 distinct issues
4. Uses realistic scenarios (not overly academic or theoretical)
5. Includes relevant ambiguities that make analysis interesting
6. Is clear and well-structured

Return ONLY the fact pattern text, with no additional commentary, explanations, or formatting. The text should be ready to use directly as a practice problem.`;

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt
    });

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error('Generate fact pattern error:', error);
    return NextResponse.json(
      { error: 'Failed to generate fact pattern' },
      { status: 500 }
    );
  }
}
