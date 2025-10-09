import { NextRequest, NextResponse } from 'next/server';
import { openai, anthropic } from '@/echo';
import { generateText } from 'ai';
import { processFile } from '@/lib/document-processor';

// Allow longer requests for flashcard generation
export const maxDuration = 60;

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
}

interface FlashcardDeck {
  flashcards: Flashcard[];
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

    // Generate flashcards using AI with a specialized legal education prompt
    const prompt = `You are a legal education expert specializing in creating effective flashcards for law students. Your task is to analyze the provided legal materials and create high-quality flashcards that will help students master key legal concepts.

Materials:
${allText}

${instructions ? `Additional Instructions: ${instructions}` : ''}

Create comprehensive flashcards covering:
1. **Legal Terms & Definitions**: Key legal terminology, Latin phrases, and their precise meanings
2. **Case Law**: Important case names, holdings, rules of law, and distinguishing facts
3. **Legal Doctrines & Principles**: Core legal theories, tests, and frameworks
4. **Statutes & Rules**: Key statutory provisions, amendments, and regulatory requirements
5. **Legal Analysis Elements**: Elements of claims, defenses, exceptions, and burdens of proof

Guidelines for creating flashcards:
- **Front of card**: Should be a clear, focused question or term (e.g., "What is the rule from Miranda v. Arizona?" or "Define: Habeas Corpus")
- **Back of card**: Should provide a concise, accurate answer with essential details
- **Category**: Label each card with its legal area (e.g., "Constitutional Law", "Contracts", "Torts", "Criminal Law", "Case Law", "Legal Terms")
- Focus on testable knowledge and practical application
- Include case citations where relevant
- Make cards specific enough to be useful but not overly complex
- Prioritize foundational concepts and frequently tested material

Create 20-25 flashcards. You must respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "flashcards": [
    {
      "id": 1,
      "front": "What is the holding in Marbury v. Madison?",
      "back": "The Supreme Court has the power of judicial review to declare laws unconstitutional. This established the principle that the judiciary can review and nullify government actions that violate the Constitution.",
      "category": "Constitutional Law"
    }
  ]
}

Ensure each flashcard is substantive, accurate, and focused on the most important legal concepts from the materials.`;

    const { text } = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      prompt
    });

    // Parse the JSON response
    let deck: FlashcardDeck;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      deck = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse flashcard JSON:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse flashcard response from AI');
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}

