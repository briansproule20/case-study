import { NextRequest, NextResponse } from 'next/server';
import { openai, anthropic } from '@/echo';
import { generateText } from 'ai';
import { processFile } from '@/lib/document-processor';

// Allow longer requests for quiz generation
export const maxDuration = 60;

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const instructions = formData.get('instructions') as string || '';

    // Collect all uploaded files
    const files: File[] = [];
    let index = 0;
    while (formData.has(`file-${index}`)) {
      const file = formData.get(`file-${index}`) as File;
      if (file) {
        files.push(file);
      }
      index++;
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Process all files to extract text content
    let allText = '';

    for (const file of files) {
      try {
        const text = await processFile(file);
        allText += `\n\n--- Content from ${file.name} ---\n${text}`;
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    if (!allText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from uploaded files' },
        { status: 400 }
      );
    }

    // Generate quiz using AI
    const prompt = `You are a legal education expert tasked with creating a 10-question multiple choice quiz based on the provided legal materials.

Materials:
${allText}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Create exactly 10 multiple choice questions. Each question should:
1. Be based on the legal concepts, cases, or principles in the materials
2. Have 4 options (A, B, C, D)
3. Have exactly one correct answer
4. Include a clear explanation of why the correct answer is right and why the others are wrong

You must respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "questions": [
    {
      "id": 1,
      "question": "What is the legal principle?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is correct and why others are wrong."
    }
  ]
}

Make sure to create exactly 10 questions that cover different aspects of the materials and test understanding rather than just memorization.`;

    const { text } = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      prompt
    });

    // Parse the JSON response
    let quiz: Quiz;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      quiz = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse quiz response from AI');
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
