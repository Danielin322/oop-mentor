
export enum Role {
  INTERVIEWER = 'interviewer',
  CANDIDATE = 'candidate',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isThinking: boolean;
  error: string | null;
}

export type ActiveTab = 'interview' | 'cards' | 'practice' | 'progress';

export interface StudyCard {
  id: string;
  term: string;
  definition: string;
  example: string;
}

export type Language = 'C#' | 'Java' | 'Python' | 'C++';

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  language: Language;
}

export interface CodeEvaluation {
  isCorrect: boolean;
  feedback: string;
  improvements?: string;
}

export interface UserProgress {
  completedChallenges: number;
  correctSolutions: number;
  interviewResponses: number;
  lastActive: string;
}
