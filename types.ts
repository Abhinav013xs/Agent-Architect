export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'model';
  content: string; // Markdown content
  images?: string[]; // Base64 strings
  isThinking?: boolean;
}

export interface AnalysisRequest {
  code?: string;
  images?: string[]; // Base64
  prompt?: string;
}

export enum ViewMode {
  CODE = 'CODE',
  IMAGE = 'IMAGE'
}
