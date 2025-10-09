import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/lib/document-processor';
import { extractFilesFromFormData } from '@/lib/upload-helper';

export const maxDuration = 60;

// Increase body size limit for direct uploads (up to 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files (handles both direct and blob uploads)
    const files = await extractFilesFromFormData(formData);

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Process the first file
    const file = files[0];
    const text = await processFile(file);

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from file' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      text,
      filename: file.name 
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}

