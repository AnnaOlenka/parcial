import { useState, useEffect } from 'react';
import type { ExamResult } from '../types';

const STORAGE_KEY = 'exam_results';

export function useExamResults() {
  const [results, setResults] = useState<ExamResult[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  const saveResult = (result: ExamResult) => {
    setResults(prev => [...prev, result]);
  };

  const hasAttempted = (userId: string, examId: string) =>
    results.some(r => r.userId === userId && r.examId === examId);

  const getResult = (userId: string, examId: string) =>
    results.find(r => r.userId === userId && r.examId === examId);

  const getResultsByUser = (userId: string) =>
    results.filter(r => r.userId === userId);

  return { results, saveResult, hasAttempted, getResult, getResultsByUser };
}
