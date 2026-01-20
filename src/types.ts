export type AnalysisResult = {
  success: true;
  conclusion: string;
  notes: string[];
  recommendation: string;
} | {
  success: false;
  error: string;
  shouldRetry: boolean;
};

export type SavedResult = {
  id: string;
  timestamp: number;
  imagePreview: string;
  conclusion: string;
  notes: string[];
  recommendation: string;
};
