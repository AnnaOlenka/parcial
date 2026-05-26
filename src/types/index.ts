export type ExamType = 'multiple_choice' | 'open_questions';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: ExamType;
  options: Option[];
  correctAnswer?: string;
}

export interface Exam {
  id: string;
  title: string;
  area: string;
  type: ExamType;
  passingPercentage: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  documentNumber: string;
  specialty: string;
  createdAt: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  answers: UserAnswer[];
  score: number;
  passed: boolean;
  completedAt: string;
  certificateCode: string;
}
