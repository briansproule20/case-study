import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/echo';
import { generateText } from 'ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { text, prompt } = await request.json();

    if (!text || !prompt) {
      return NextResponse.json(
        { error: 'Text and prompt are required' },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${prompt}\n\nDocument content:\n\n${text}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ analysis: result.text });
  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}
