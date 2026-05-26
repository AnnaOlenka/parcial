import { useState, useEffect } from 'react';
import type { Exam } from '../types';

const STORAGE_KEY = 'exams';

export function useExams() {
  const [exams, setExams] = useState<Exam[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }, [exams]);

  const saveExam = (exam: Exam) => {
    setExams(prev => {
      const exists = prev.find(e => e.id === exam.id);
      if (exists) {
        return prev.map(e => e.id === exam.id ? { ...exam, updatedAt: new Date().toISOString() } : e);
      }
      return [...prev, exam];
    });
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  return { exams, saveExam, deleteExam };
}
