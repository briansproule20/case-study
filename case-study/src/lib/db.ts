import Dexie, { type Table } from 'dexie';

// Artifact types
export type ArtifactType = 'flashcard' | 'quiz' | 'chat' | 'document' | 'issue-spotting';

// Base artifact interface
export interface SavedArtifact {
  id?: number;
  type: ArtifactType;
  title: string;
  summary: string;
  createdAt: Date;
  data: unknown; // Type-specific data
}

// Type-specific data interfaces
export interface FlashcardData {
  flashcards: Array<{
    id: number;
    front: string;
    back: string;
    category: string;
  }>;
  instructions?: string;
  fileNames?: string[];
}

export interface QuizData {
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
  }>;
  userAnswers?: Record<number, number>;
  score?: number;
  completed?: boolean;
  instructions?: string;
  fileNames?: string[];
}

export interface ChatData {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  context?: string;
}

export interface DocumentData {
  analysis: string;
  fileName: string;
  extractedText?: string;
}

export interface IssueSpottingData {
  factPattern: string;
  issues: Array<{
    issue: string;
    rule: string;
    analysis: string;
  }>;
  topic?: string;
}

// User preferences interface
export interface UserPreferences {
  id?: number;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  updatedAt: Date;
}

// Database class
export class CaseStudyDB extends Dexie {
  artifacts!: Table<SavedArtifact, number>;
  preferences!: Table<UserPreferences, number>;

  constructor() {
    super('case-study-db');
    this.version(1).stores({
      artifacts: '++id, type, createdAt',
    });
    this.version(2).stores({
      artifacts: '++id, type, createdAt',
      preferences: '++id, updatedAt',
    });
    // Version 3: Add darkMode field to preferences (Dexie handles this automatically)
    this.version(3).stores({
      artifacts: '++id, type, createdAt',
      preferences: '++id, updatedAt',
    }).upgrade(async (tx) => {
      // Update existing preferences to include darkMode field
      const prefs = await tx.table('preferences').toArray();
      for (const pref of prefs) {
        await tx.table('preferences').update(pref.id!, { darkMode: false });
      }
    });
  }
}

// Export a singleton instance
export const db = new CaseStudyDB();

// Helper functions
export const saveArtifact = async (artifact: Omit<SavedArtifact, 'id' | 'createdAt'>) => {
  return await db.artifacts.add({
    ...artifact,
    createdAt: new Date(),
  });
};

export const getAllArtifacts = async () => {
  return await db.artifacts.orderBy('createdAt').reverse().toArray();
};

export const getArtifactsByType = async (type: ArtifactType) => {
  return await db.artifacts.where('type').equals(type).reverse().sortBy('createdAt');
};

export const deleteArtifact = async (id: number) => {
  return await db.artifacts.delete(id);
};

export const getArtifact = async (id: number) => {
  return await db.artifacts.get(id);
};

// User preferences helpers
export const saveUserPreferences = async (primaryColor: string, secondaryColor: string, darkMode?: boolean) => {
  // Get existing preferences to preserve darkMode if not provided
  const existing = await getUserPreferences();
  const currentDarkMode = darkMode !== undefined ? darkMode : (existing?.darkMode ?? false);

  // Delete all existing preferences and save new one
  await db.preferences.clear();
  return await db.preferences.add({
    primaryColor,
    secondaryColor,
    darkMode: currentDarkMode,
    updatedAt: new Date(),
  });
};

export const getUserPreferences = async () => {
  const prefs = await db.preferences.toArray();
  return prefs.length > 0 ? prefs[0] : null;
};

export const saveDarkModePreference = async (darkMode: boolean) => {
  const existing = await getUserPreferences();
  await db.preferences.clear();
  return await db.preferences.add({
    primaryColor: existing?.primaryColor ?? '#6B7280',
    secondaryColor: existing?.secondaryColor ?? '#475569',
    darkMode,
    updatedAt: new Date(),
  });
};

export const getUserDarkModePreference = async () => {
  const prefs = await getUserPreferences();
  return prefs?.darkMode ?? null;
};

// Storage quota helpers
export const getStorageEstimate = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
    };
  }
  return null;
};
