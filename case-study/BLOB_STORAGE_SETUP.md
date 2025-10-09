# Vercel Blob Storage Setup Guide

This app supports automatic large file handling via Vercel Blob Storage.

## How It Works

- **Files under 4MB**: Direct upload (works immediately)
- **Files over 4MB**: Automatically uploaded to Vercel Blob Storage (transparent to user)
- **Fallback**: If blob upload fails, tries direct upload anyway

## Setup Instructions

### 1. Install Package

```bash
npm install @vercel/blob
```

### 2. Enable Blob Storage in Vercel

**Option A: Via Vercel Dashboard**
1. Go to your project in Vercel Dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Click **Create**

Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project.

**Option B: Via CLI**
```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

### 3. Redeploy

After adding the environment variable, redeploy your app:
- Push to GitHub (triggers auto-deploy), or
- Run `vercel --prod`

## Testing

### Local Development
Local dev doesn't need blob storage (no 4MB limit). To test blob storage locally:

1. Get your token from Vercel:
   ```bash
   vercel env pull .env.local
   ```

2. This will add `BLOB_READ_WRITE_TOKEN` to your `.env.local`

3. Restart dev server

### Production
Once deployed with the token:
- Upload a small file (<4MB) → Uses direct upload
- Upload a large file (>4MB) → Uses blob storage automatically
- Check Vercel logs to see which method was used

## Affected Features

The following features support large file uploads via blob storage:
- ✅ **Quizzes**: Generate quizzes from large PDFs/documents
- ✅ **Flashcards**: Create flashcards from comprehensive study materials
- ✅ **Issue Spotting**: Analyze lengthy fact patterns and legal documents
- ✅ **Document Analysis**: Process large case files and readings
- ✅ **Chat**: Upload and discuss large legal documents

## Cost

Vercel Blob Storage pricing:
- **Hobby Plan**: 500 MB included, then $0.15/GB
- **Pro Plan**: 100 GB included, then $0.15/GB

For typical law school documents (most under 10MB), costs are minimal.

## Troubleshooting

**413 Payload Too Large Error**
- Blob storage isn't set up yet
- Follow steps above to enable it

**401 Unauthorized**
- `BLOB_READ_WRITE_TOKEN` not set in Vercel
- Re-check environment variables

**Files not uploading**
- Check Vercel logs for detailed error messages
- Ensure blob storage is enabled in your Vercel project

