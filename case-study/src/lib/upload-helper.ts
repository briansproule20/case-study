// Helper for handling file uploads with automatic routing based on size
// Transparent: tries direct upload first, falls back to blob if needed

const DIRECT_UPLOAD_LIMIT = 4 * 1024 * 1024; // 4MB - Vercel limit

/**
 * Smart file upload that automatically handles large files via blob storage
 * This is a drop-in replacement for direct FormData uploads
 * 
 * Usage: Just pass files to this and append the result to your FormData
 */
export async function prepareFilesForUpload(files: FileList | File[]): Promise<FormData> {
  const formData = new FormData();
  const fileArray = Array.from(files);

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];

    // For large files, use blob storage (browser only, not SSR)
    if (file.size > DIRECT_UPLOAD_LIMIT && typeof window !== 'undefined') {

      try {
        // Upload to blob storage
        const blobFormData = new FormData();
        blobFormData.append('file', file);

        const response = await fetch('/api/blob-upload', {
          method: 'POST',
          body: blobFormData
        });

        if (!response.ok) {
          throw new Error(`Blob upload failed: ${response.statusText}`);
        }

        const { url } = await response.json();

        // Add blob URL instead of file
        formData.append(`blob-${i}`, url);
        formData.append(`blob-${i}-filename`, file.name);
        formData.append(`blob-${i}-type`, file.type);
      } catch (error) {
        console.error('Blob upload failed:', error);
        // Throw error for large files instead of falling back to direct upload
        // This prevents 413 errors on the main API route
        throw new Error(`File "${file.name}" is too large (${formatFileSize(file.size)}). Failed to upload to blob storage.`);
      }
    } else {
      // Direct upload for small files
      formData.append(`file-${i}`, file);
    }
  }

  return formData;
}

/**
 * Helper to extract files from FormData (handles both blob URLs and direct files)
 * Use this in API routes to get consistent file handling
 */
export async function extractFilesFromFormData(formData: FormData): Promise<File[]> {
  const files: File[] = [];
  let index = 0;

  while (true) {
    const file = formData.get(`file-${index}`) as File | null;
    const blobUrl = formData.get(`blob-${index}`) as string | null;

    if (!file && !blobUrl) break;

    if (blobUrl) {
      // Fetch from blob storage
      const filename = formData.get(`blob-${index}-filename`) as string;
      const type = formData.get(`blob-${index}-type`) as string;

      const response = await fetch(blobUrl);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type });
      const fileObj = new File([blob], filename, { type });
      files.push(fileObj);
    } else if (file) {
      files.push(file);
    }

    index++;
  }

  return files;
}

/**
 * Gets file size display string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

