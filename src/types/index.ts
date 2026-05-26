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
