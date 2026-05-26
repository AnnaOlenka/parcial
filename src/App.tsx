import { useState } from 'react';
import type { Exam, ExamResult, User } from './types';
import { useExams } from './hooks/useExams';
import { useUsers } from './hooks/useUsers';
import { useExamResults } from './hooks/useExamResults';
import ExamList from './components/ExamList';
import ExamEditor from './components/ExamEditor';
import UserLogin from './components/UserLogin';
import ExamSelector from './components/ExamSelector';
import ExamTaker from './components/ExamTaker';
import ExamResultView from './components/ExamResultView';
import './App.css';

type AppMode = 'committee' | 'user';
type CommitteeView = 'list' | 'new' | 'edit';
type UserView = 'login' | 'select-exam' | 'take-exam' | 'view-result';

export default function App() {
  const { exams, saveExam, deleteExam } = useExams();
  const { users, addUser } = useUsers();
  const { results, saveResult } = useExamResults();

  const [mode, setMode] = useState<AppMode>('committee');

  // Committee state
  const [committeeView, setCommitteeView] = useState<CommitteeView>('list');
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>(undefined);

  // User state
  const [userView, setUserView] = useState<UserView>('login');
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [examToTake, setExamToTake] = useState<Exam | undefined>(undefined);
  const [viewingResult, setViewingResult] = useState<ExamResult | undefined>(undefined);

  // Committee handlers
  const handleNew = () => { setSelectedExam(undefined); setCommitteeView('new'); };
  const handleEdit = (exam: Exam) => { setSelectedExam(exam); setCommitteeView('edit'); };
  const handleSave = (exam: Exam) => { saveExam(exam); setCommitteeView('list'); setSelectedExam(undefined); };
  const handleCancel = () => { setCommitteeView('list'); setSelectedExam(undefined); };

  // User handlers
  const handleLogin = (user: User) => { setCurrentUser(user); setUserView('select-exam'); };
  const handleSelectExam = (exam: Exam) => { setExamToTake(exam); setUserView('take-exam'); };
  const handleSubmitExam = (result: ExamResult) => {
    saveResult(result);
    setViewingResult(result);
    setUserView('view-result');
  };
  const handleViewResult = (result: ExamResult) => { setViewingResult(result); setUserView('view-result'); };
  const handleBackToExams = () => { setExamToTake(undefined); setViewingResult(undefined); setUserView('select-exam'); };
  const handleLogout = () => { setCurrentUser(undefined); setExamToTake(undefined); setViewingResult(undefined); setUserView('login'); };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'committee') {
      setCommitteeView('list');
    } else {
      setUserView(currentUser ? 'select-exam' : 'login');
    }
  };

  const userResults = currentUser ? results.filter(r => r.userId === currentUser.id) : [];

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
            <div className="mode-toggle">
              <button
                className={`mode-btn${mode === 'committee' ? ' mode-btn--active' : ''}`}
                onClick={() => handleModeChange('committee')}
              >
                Comité Técnico
              </button>
              <button
                className={`mode-btn${mode === 'user' ? ' mode-btn--active' : ''}`}
                onClick={() => handleModeChange('user')}
              >
                Usuario
              </button>
            </div>
            {mode === 'user' && currentUser && (
              <button className="btn btn--ghost btn--sm" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {mode === 'committee' && (
          <>
            {committeeView === 'list' && (
              <ExamList exams={exams} onNew={handleNew} onEdit={handleEdit} onDelete={deleteExam} />
            )}
            {(committeeView === 'new' || committeeView === 'edit') && (
              <ExamEditor exam={selectedExam} onSave={handleSave} onCancel={handleCancel} />
            )}
          </>
        )}

        {mode === 'user' && (
          <>
            {userView === 'login' && (
              <UserLogin users={users} onLogin={handleLogin} onCreateUser={addUser} />
            )}
            {userView === 'select-exam' && currentUser && (
              <ExamSelector
                exams={exams}
                results={userResults}
                user={currentUser}
                onSelect={handleSelectExam}
                onViewResult={handleViewResult}
              />
            )}
            {userView === 'take-exam' && currentUser && examToTake && (
              <ExamTaker
                exam={examToTake}
                user={currentUser}
                onSubmit={handleSubmitExam}
                onCancel={handleBackToExams}
              />
            )}
            {userView === 'view-result' && currentUser && viewingResult && (
              <ExamResultView
                result={viewingResult}
                exam={exams.find(e => e.id === viewingResult.examId)!}
                user={currentUser}
                onBack={handleBackToExams}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
