import type { Exam, ExamResult, User } from '../types';
import { IconClipboard } from './icons';

interface ExamSelectorProps {
  exams: Exam[];
  results: ExamResult[];
  user: User;
  onSelect: (exam: Exam) => void;
  onViewResult: (result: ExamResult) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ExamSelector({ exams, results, user, onSelect, onViewResult }: ExamSelectorProps) {
  const getResult = (examId: string) =>
    results.find(r => r.userId === user.id && r.examId === examId);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__icon"><IconClipboard /></div>
        <div>
          <h2 className="page-header__title">Exámenes disponibles</h2>
          <p className="page-header__subtitle">Bienvenido, {user.fullName}</p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="empty-state empty-state--full">
          <IconClipboard />
          <h3>No hay exámenes disponibles</h3>
          <p>El comité técnico aún no ha publicado exámenes.</p>
        </div>
      ) : (
        <div className="exam-grid">
          {exams.map(exam => {
            const result = getResult(exam.id);
            const attempted = !!result;

            return (
              <div key={exam.id} className="exam-card">
                <div className="exam-card__header">
                  <span className={`exam-card__type-badge ${exam.type === 'multiple_choice' ? 'badge--blue' : 'badge--purple'}`}>
                    {exam.type === 'multiple_choice' ? 'Opción múltiple' : 'Preguntas abiertas'}
                  </span>
                  {attempted && (
                    <span className={`exam-card__type-badge ${result.passed ? 'badge--green' : 'badge--red'}`}>
                      {result.passed ? 'Aprobado' : 'Desaprobado'}
                    </span>
                  )}
                </div>

                <h3 className="exam-card__title">{exam.title}</h3>
                <p className="exam-card__area">{exam.area}</p>

                <div className="exam-card__stats">
                  <div className="stat">
                    <span className="stat__value">{exam.questions.length}</span>
                    <span className="stat__label">Preguntas</span>
                  </div>
                  <div className="stat">
                    <span className="stat__value">{exam.passingPercentage}%</span>
                    <span className="stat__label">Para aprobar</span>
                  </div>
                  {attempted && (
                    <div className="stat">
                      <span className="stat__value" style={{ color: result.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {result.score.toFixed(0)}%
                      </span>
                      <span className="stat__label">Tu puntaje</span>
                    </div>
                  )}
                </div>

                <div className="exam-card__footer">
                  {attempted ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="exam-card__date">Rendido: {formatDate(result.completedAt)}</span>
                      <button className="btn btn--secondary btn--sm" onClick={() => onViewResult(result)}>
                        Ver resultado
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn--primary btn--sm" style={{ width: '100%' }} onClick={() => onSelect(exam)}>
                      Rendir examen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
