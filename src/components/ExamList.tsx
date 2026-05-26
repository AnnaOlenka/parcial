import type { Exam } from '../types';
import { IconEdit, IconTrash, IconPlus, IconClipboard } from './icons';

interface ExamListProps {
  exams: Exam[];
  onNew: () => void;
  onEdit: (exam: Exam) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ExamList({ exams, onNew, onEdit, onDelete }: ExamListProps) {
  const handleDelete = (exam: Exam) => {
    if (window.confirm(`Eliminar el examen "${exam.title}"? Esta accion no se puede deshacer.`)) {
      onDelete(exam.id);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__icon"><IconClipboard /></div>
        <div>
          <h2 className="page-header__title">Gestion de examenes</h2>
          <p className="page-header__subtitle">Comite tecnico</p>
        </div>
        <button className="btn btn--primary" onClick={onNew}>
          <IconPlus /> Nuevo examen
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="empty-state empty-state--full">
          <IconClipboard />
          <h3>No hay examenes creados</h3>
          <p>Crea el primer examen para comenzar.</p>
          <button className="btn btn--primary" onClick={onNew}>
            <IconPlus /> Crear examen
          </button>
        </div>
      ) : (
        <div className="exam-grid">
          {exams.map(exam => (
            <div key={exam.id} className="exam-card">
              <div className="exam-card__header">
                <span className={`exam-card__type-badge${exam.type === 'multiple_choice' ? ' badge--blue' : ' badge--purple'}`}>
                  {exam.type === 'multiple_choice' ? 'Opcion multiple' : 'Preguntas abiertas'}
                </span>
                <div className="exam-card__actions">
                  <button
                    className="btn-icon btn-icon--neutral"
                    onClick={() => onEdit(exam)}
                    title="Editar examen"
                  >
                    <IconEdit />
                  </button>
                  <button
                    className="btn-icon btn-icon--danger"
                    onClick={() => handleDelete(exam)}
                    title="Eliminar examen"
                  >
                    <IconTrash />
                  </button>
                </div>
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
                  <span className="stat__label">Aprobacion</span>
                </div>
              </div>

              <div className="exam-card__footer">
                <span className="exam-card__date">Actualizado: {formatDate(exam.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
