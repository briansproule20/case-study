import { streamText, type UIMessage, convertToModelMessages, type TextUIPart } from 'ai';
import { openai, anthropic } from '@/echo';
import { processDocument } from '@/lib/document-processor';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      model,
      messages,
    }: {
      messages: UIMessage[];
      model: string;
    } = await req.json();

    console.log('=== CHAT API RECEIVED ===');
    console.log('Model:', model);
    console.log('Messages count:', messages?.length);
    console.log('Received messages:', JSON.stringify(messages, null, 2));
    
    // Check each message for file parts
    messages?.forEach((msg, idx) => {
      const fileParts = msg.parts?.filter(p => p.type === 'file');
      if (fileParts && fileParts.length > 0) {
        console.log(`Message ${idx} has ${fileParts.length} file parts:`, fileParts.map((f: any) => ({
          type: f.type,
          mediaType: f.mediaType,
          filename: f.filename,
          hasUrl: !!f.url,
          urlLength: f.url?.length
        })));
      }
    });

    // Validate required parameters
    if (!model) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Messages parameter is required and must be an array',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Process messages and extract text from PDFs/Word docs
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        if (!message.parts) return message;

        const processedParts = await Promise.all(
          message.parts.map(async (part) => {
            // Handle file attachments - extract text from PDFs and Word docs
            if (part.type === 'file') {
              const mediaType = part.mediaType || '';

              // For PDFs and Word docs, extract text and convert to text part
              if (
                mediaType === 'application/pdf' ||
                mediaType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                mediaType === 'application/msword'
              ) {
                try {
                  const extractedText = await processDocument({
                    data: part.url,
                    mediaType: part.mediaType,
                    filename: part.filename,
                  });

                  // Return as text with document context
                  return {
                    type: 'text',
                    text: `[Document: ${part.filename || 'Untitled'}]\n\n${extractedText}`,
                  } as TextUIPart;
                } catch (error) {
                  console.error('Document processing error:', error);
                  // Keep the file part so it displays in chat, add error text
                  return {
                    type: 'text',
                    text: `[I can see you uploaded "${part.filename}" but I'm unable to extract text from PDF files at this time. Please copy and paste the text you'd like me to analyze.]`,
                  } as TextUIPart;
                }
              }

              // For images, keep as file part
              if (mediaType.startsWith('image/')) {
                return part;
              }

              // For text files
              if (mediaType.startsWith('text/')) {
                return part;
              }
            }

            return part;
          })
        );

        return { ...message, parts: processedParts };
      })
    );

    // Determine provider based on model name
    const isClaudeModel = model.startsWith('claude-');
    const provider = isClaudeModel ? anthropic : openai;

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(processedMessages);
    console.log('Model messages:', JSON.stringify(modelMessages, null, 2));

    const result = streamText({
      model: provider(model),
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
