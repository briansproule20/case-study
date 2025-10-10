import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// This route provides upload tokens for client-side uploads to Vercel Blob
// This avoids the 413 error by uploading directly from the client to blob storage
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // You can add validation here if needed
        // For example, check file extension, size limits, etc.
        console.log(`Generating upload token for: ${pathname}`);

        return {
          allowedContentTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
          ],
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.pathname);
        // You can add post-upload logic here if needed
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload token' },
      { status: 500 }
    );
  }
}

