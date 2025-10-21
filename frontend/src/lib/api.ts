// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  resumeScan: `${API_BASE_URL}/api/resume/scan`,
  generateQuestions: `${API_BASE_URL}/api/questions/generate`,
  matchJD: `${API_BASE_URL}/api/jd/match`,
};

// Types
export interface ATSResult {
  atsScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface ResumeScanResponse {
  source: string;
  durationMs: number;
  result: ATSResult;
}

export interface QuestionResult {
  category: string;
  question: string;
}

export interface QuestionsResponse {
  source: string;
  durationMs: number;
  questions: QuestionResult[];
}

export interface JDMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface JDMatchResponse {
  source: string;
  durationMs: number;
  result: JDMatchResult;
}

export interface ApiError {
  error: string;
  details?: string;
  raw?: string;
}

// API Functions
export const api = {
  /**
   * Check if backend is healthy
   */
  async checkHealth(): Promise<{ status: string }> {
    const response = await fetch(API_ENDPOINTS.health);
    if (!response.ok) {
      throw new Error('Backend is not responding');
    }
    return response.json();
  },

  /**
   * Scan resume and get ATS score and suggestions
   */
  async scanResume(file: File): Promise<ResumeScanResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_ENDPOINTS.resumeScan, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.details || error.error || 'Failed to scan resume');
    }

    return response.json();
  },

  /**
   * Generate interview questions based on job title, experience, and resume
   */
  async generateQuestions(data: {
    jobTitle: string;
    yoe: number;
    resumeText?: string;
  }): Promise<QuestionsResponse> {
    const response = await fetch(API_ENDPOINTS.generateQuestions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.details || error.error || 'Failed to generate questions');
    }

    return response.json();
  },

  /**
   * Match resume with job description
   */
  async matchJD(data: {
    resumeText: string;
    jdText: string;
  }): Promise<JDMatchResponse> {
    const response = await fetch(API_ENDPOINTS.matchJD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.details || error.error || 'Failed to match JD');
    }

    return response.json();
  },
};

/**
 * Extract text from uploaded file (client-side preview)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // For PDF/DOCX, we'll let the backend handle extraction
      // This is just for plain text files as a fallback
      resolve(text || '');
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Read as text (for basic preview, backend does actual parsing)
    reader.readAsText(file);
  });
}
