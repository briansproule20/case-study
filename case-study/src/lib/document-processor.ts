import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Attempting PDF extraction with pdf2json...');
    console.log('Buffer size:', buffer.length);
    
    const pdfParser = new PDFParser();
    
    let extractedText = '';
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF parsing error:', errData.parserError);
      reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
    });
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        // Extract text from all pages
        const pages = pdfData.Pages || [];
        const textParts: string[] = [];
        
        for (const page of pages) {
          const texts = page.Texts || [];
          for (const text of texts) {
            const decodedText = decodeURIComponent(text.R[0].T);
            textParts.push(decodedText);
          }
          textParts.push('\n\n'); // Add page break
        }
        
        extractedText = textParts.join(' ');
        console.log('PDF extraction successful, text length:', extractedText.length);
        resolve(extractedText);
      } catch (error) {
        console.error('PDF data processing error:', error);
        reject(new Error(`Failed to process PDF data: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
    
    // Parse the buffer
    pdfParser.parseBuffer(buffer);
  });
}

export async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

export async function processDocument(
  file: { data: string; mediaType: string; filename?: string }
): Promise<string> {
  console.log('Processing document:', {
    filename: file.filename,
    mediaType: file.mediaType,
    dataLength: file.data?.length,
    dataStart: file.data?.substring(0, 50)
  });

  // Convert base64 data URL to buffer
  const base64Data = file.data.split(',')[1] || file.data;
  const buffer = Buffer.from(base64Data, 'base64');

  console.log('Buffer created:', { bufferLength: buffer.length });

  if (file.mediaType === 'application/pdf') {
    return await extractTextFromPDF(buffer);
  } else if (
    file.mediaType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mediaType === 'application/msword'
  ) {
    return await extractTextFromWord(buffer);
  }

  throw new Error(`Unsupported document type: ${file.mediaType}`);
}
