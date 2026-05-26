import { useState } from 'react';
import type { Exam } from './types';
import { useExams } from './hooks/useExams';
import ExamList from './components/ExamList';
import ExamEditor from './components/ExamEditor';
import './App.css';

type AppView = 'list' | 'new' | 'edit';

export default function App() {
  const { exams, saveExam, deleteExam } = useExams();
  const [view, setView] = useState<AppView>('list');
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>(undefined);

  const handleNew = () => {
    setSelectedExam(undefined);
    setView('new');
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setView('edit');
  };

  const handleSave = (exam: Exam) => {
    saveExam(exam);
    setView('list');
    setSelectedExam(undefined);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedExam(undefined);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
            <span>CertifyPro</span>
          </div>
          <nav className="app-header__nav">
            <span className="nav-label">Comite Tecnico</span>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <ExamList
            exams={exams}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={deleteExam}
          />
        )}
        {(view === 'new' || view === 'edit') && (
          <ExamEditor
            exam={selectedExam}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}
