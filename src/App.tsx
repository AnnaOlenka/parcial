import { useEffect, useState } from 'react';
import type { Exam, ExamResult, User } from './types';
import { useExams } from './hooks/useExams';
import { useUsers } from './hooks/useUsers';
import { useExamResults } from './hooks/useExamResults';
import { useCertificates } from './hooks/useCertificates';
import ExamList from './components/ExamList';
import ExamEditor from './components/ExamEditor';
import UserLogin from './components/UserLogin';
import ExamSelector from './components/ExamSelector';
import ExamTaker from './components/ExamTaker';
import ExamResultView from './components/ExamResultView';
import PublicCertificateView from './components/PublicCertificateView';
import UserCurriculumView from './components/UserCurriculumView';
import UsersDirectoryView from './components/UsersDirectoryView';
import { generateCertificatePdfDataUrl, getPublicCertificateUrl } from './lib/certificates';
import './App.css';

type AppMode = 'committee' | 'user';
type CommitteeView = 'list' | 'new' | 'edit' | 'users';
type UserView = 'login' | 'select-exam' | 'take-exam' | 'view-result' | 'curriculum';

export default function App() {
  const { exams, saveExam, deleteExam } = useExams();
  const { users, addUser, updateUser, getUserByDocument } = useUsers();
  const { results, saveResult } = useExamResults();
  const { certificates, saveCertificate, getCertificateByCode } = useCertificates();

  const [mode, setMode] = useState<AppMode>('committee');

  // Committee state
  const [committeeView, setCommitteeView] = useState<CommitteeView>('list');
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>(undefined);

  // User state
  const [userView, setUserView] = useState<UserView>('login');
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [examToTake, setExamToTake] = useState<Exam | undefined>(undefined);
  const [viewingResult, setViewingResult] = useState<ExamResult | undefined>(undefined);

  // Vista pública del certificado vía `hash`: #/certificado/{code}
  const [publicCertificateCode, setPublicCertificateCode] = useState<string | null>(null);
  const [publicCurriculumDocument, setPublicCurriculumDocument] = useState<string | null>(null);

  const parsePublicCertificateCode = () => {
    const hash = window.location.hash || '';
    const certificateMatch = hash.match(/^#\/certificado\/(.+)$/);
    if (certificateMatch) {
      setPublicCertificateCode(decodeURIComponent(certificateMatch[1]));
      setPublicCurriculumDocument(null);
      return;
    }

    const curriculumMatch = hash.match(/^#\/perfil\/(.+)$/);
    if (curriculumMatch) {
      setPublicCurriculumDocument(decodeURIComponent(curriculumMatch[1]));
      setPublicCertificateCode(null);
      return;
    }

    setPublicCertificateCode(null);
    setPublicCurriculumDocument(null);
  };

  // Sin `react-router`, simulamos el acceso público con `window.location.hash`.
  useEffect(() => {
    parsePublicCertificateCode();
    window.addEventListener('hashchange', parsePublicCertificateCode);
    return () => window.removeEventListener('hashchange', parsePublicCertificateCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Committee handlers
  const handleNew = () => { setSelectedExam(undefined); setCommitteeView('new'); };
  const handleEdit = (exam: Exam) => { setSelectedExam(exam); setCommitteeView('edit'); };
  const handleSave = (exam: Exam) => { saveExam(exam); setCommitteeView('list'); setSelectedExam(undefined); };
  const handleCancel = () => { setCommitteeView('list'); setSelectedExam(undefined); };

  // User handlers
  const handleLogin = (user: User) => { setCurrentUser(user); setUserView('select-exam'); };
  const handleSelectExam = (exam: Exam) => { setExamToTake(exam); setUserView('take-exam'); };

  const ensureCertificateForResult = (result: ExamResult) => {
    if (!result.passed || !result.certificateCode) return;
    const already = getCertificateByCode(result.certificateCode);
    if (already) return;

    const exam = exams.find(e => e.id === result.examId);
    const user = users.find(u => u.id === result.userId);
    if (!exam || !user) return;

    const publicUrl = getPublicCertificateUrl(result.certificateCode);
    const pdfDataUrl = generateCertificatePdfDataUrl({
      userName: user.fullName,
      examName: exam.title,
      issuedAt: result.completedAt,
      code: result.certificateCode,
      publicUrl,
    });

    saveCertificate({
      code: result.certificateCode,
      userId: user.id,
      examId: exam.id,
      userName: user.fullName,
      examName: exam.title,
      issuedAt: result.completedAt,
      publicUrl,
      pdfDataUrl,
    });
  };

  const handleSubmitExam = (result: ExamResult) => {
    saveResult(result);
    setViewingResult(result);
    setUserView('view-result');
    ensureCertificateForResult(result);
  };

  const handleViewResult = (result: ExamResult) => {
    setViewingResult(result);
    setUserView('view-result');
    ensureCertificateForResult(result);
  };
  const handleBackToExams = () => { setExamToTake(undefined); setViewingResult(undefined); setUserView('select-exam'); };
  const handleLogout = () => { setCurrentUser(undefined); setExamToTake(undefined); setViewingResult(undefined); setUserView('login'); };
  const handleUpdateCurrentUser = (updatedUser: User) => {
    updateUser(updatedUser);
    setCurrentUser(prev => (prev && prev.id === updatedUser.id ? updatedUser : prev));
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'committee') {
      setCommitteeView('list');
    } else {
      setUserView(currentUser ? 'select-exam' : 'login');
    }
  };

  const handleBackToExamsManagement = () => setCommitteeView('list');

  const userResults = currentUser ? results.filter(r => r.userId === currentUser.id) : [];
  const publicCurriculumUser = publicCurriculumDocument
    ? getUserByDocument(publicCurriculumDocument)
    : undefined;

  return (
    <div className="app">
      {publicCertificateCode ? (
        <PublicCertificateView
          code={publicCertificateCode}
          onBack={() => {
            window.location.hash = '';
            setPublicCertificateCode(null);
          }}
        />
      ) : publicCurriculumDocument ? (
        publicCurriculumUser ? (
          <UserCurriculumView
            user={publicCurriculumUser}
            exams={exams}
            results={results}
            currentUserId={currentUser?.id}
            isPublicView
            onBackToExams={() => {
              window.location.hash = '';
              setPublicCurriculumDocument(null);
            }}
          />
        ) : (
          <main className="app-main">
            <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Perfil publico no encontrado</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                No existe ningun usuario con el documento indicado en la URL publica.
              </p>
              <div>
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => {
                    window.location.hash = '';
                    setPublicCurriculumDocument(null);
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </main>
        )
      ) : (
      <>
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
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => setUserView('curriculum')}
                  style={{ fontSize: '0.8rem' }}
                  type="button"
                >
                  Currículum
                </button>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout} style={{ fontSize: '0.8rem' }} type="button">
                  Cerrar sesión
                </button>
              </div>
            )}

            {mode === 'committee' && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {committeeView === 'users' ? (
                  <button className="btn btn--secondary btn--sm" onClick={handleBackToExamsManagement} type="button">
                    Volver a exámenes
                  </button>
                ) : (
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => setCommitteeView('users')}
                    type="button"
                  >
                    Usuarios
                  </button>
                )}
              </div>
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
            {committeeView === 'users' && (
              <UsersDirectoryView
                users={users}
                exams={exams}
                results={results}
                certificates={certificates}
                onBackToExams={handleBackToExamsManagement}
              />
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
            {userView === 'curriculum' && currentUser && (
              <UserCurriculumView
                user={currentUser}
                exams={exams}
                results={results}
                currentUserId={currentUser.id}
                onUpdateUser={handleUpdateCurrentUser}
                onBackToExams={handleBackToExams}
              />
            )}
          </>
        )}
      </main>
      </>
      )}
    </div>
  );
}
