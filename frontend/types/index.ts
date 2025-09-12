export interface Company {
  name: string;
  logo?: string;
}

export interface JobRole {
  title: string;
  category: string;
}

export interface AnalysisData {
  company: string;
  jobRole: string;
  resumeText: string;
  filename: string;
}

export interface EvaluationResult {
  score: number;
  gaps: string;
  keywords: string;
  recommendations: string;
}

export interface AnalysisResult {
  finalScore: number;
  displayScore: number;
  idealResume: string;
  evaluations: Array<{
    model: string;
    evaluation: EvaluationResult;
  }>;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}