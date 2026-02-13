export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  createdAt: Date;
  subscription: 'free' | 'pro' | 'enterprise';
  analysesCount: number;
  resumeLimit: number;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  extractedText: string;
  uploadedAt: Date;
  isActive: boolean;
  analysesCount: number;
  metadata: ResumeMetadata;
}

export interface ResumeMetadata {
  wordCount: number;
  characterCount: number;
  bulletPoints: number;
  sections: string[];
  lastAnalyzed?: Date;
}

export interface Analysis {
  id: string;
  userId: string;
  resumeId: string;
  jobDescription: string;
  scores: ATSScores;
  keywords: KeywordAnalysis;
  recommendations: AIRecommendations;
  createdAt: Date;
  userFeedback?: UserFeedback;
}

export interface ATSScores {
  overall: number;
  keyword: number;
  semantic: number;
  format: number;
  impact: number;
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  total: number;
  matchedCount: number;
  keywordDensity: Record<string, number>;
}

export interface AIRecommendations {
  improvements: string[];
  bulletRewrites: string[];
  missingSkills: string[];
  summary: string;
  tips: string[];
  raw?: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  company?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  analysesCount: number;
  metadata: JobDescriptionMetadata;
}

export interface JobDescriptionMetadata {
  wordCount: number;
  characterCount: number;
  extractedKeywords: string[];
}

export interface UserFeedback {
  rating: number;
  comment?: string;
  helpful: boolean;
  submittedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'analysis' | 'system' | 'promotion';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface SubscriptionFeatures {
  analysesPerMonth: number;
  resumeStorage: number;
  aiRecommendations: boolean;
  exportReports: boolean;
  prioritySupport: boolean;
  teamAccounts?: number;
  apiAccess?: boolean;
}