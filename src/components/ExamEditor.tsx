import { useState } from 'react';
import type { Exam, Question, ExamType } from '../types';
import QuestionForm from './QuestionForm';
import { IconPlus, IconEdit, IconTrash, IconSave, IconArrowLeft, IconBookOpen } from './icons';

interface ExamEditorProps {
  exam?: Exam;
  onSave: (exam: Exam) => void;
  onCancel: () => void;
}

function generateId() {
  return crypto.randomUUID();
}

type ViewState = 'editor' | 'new_question' | 'edit_question';

export default function ExamEditor({ exam, onSave, onCancel }: ExamEditorProps) {
  const [title, setTitle] = useState(exam?.title ?? '');
  const [area, setArea] = useState(exam?.area ?? '');
  const [type, setType] = useState<ExamType>(exam?.type ?? 'multiple_choice');
  const [passingPercentage, setPassingPercentage] = useState(exam?.passingPercentage ?? 70);
  const [questions, setQuestions] = useState<Question[]>(exam?.questions ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [view, setView] = useState<ViewState>('editor');
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El titulo es requerido.';
    if (!area.trim()) errs.area = 'El area tematica es requerida.';
    if (passingPercentage < 1 || passingPercentage > 100)
      errs.passing = 'El porcentaje debe estar entre 1 y 100.';
    if (questions.length === 0) errs.questions = 'Debe agregar al menos una pregunta.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    onSave({
      id: exam?.id ?? generateId(),
      title: title.trim(),
      area: area.trim(),
      type,
      passingPercentage,
      questions,
      createdAt: exam?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(item => item.id === q.id ? q : item));
    } else {
      setQuestions(prev => [...prev, q]);
    }
    setView('editor');
    setEditingQuestion(undefined);
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setView('edit_question');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleTypeChange = (newType: ExamType) => {
    setType(newType);
    setQuestions([]);
  };

  if (view === 'new_question' || view === 'edit_question') {
    return (
      <div className="page">
        <button className="btn btn--ghost btn--sm back-btn" onClick={() => { setView('editor'); setEditingQuestion(undefined); }}>
          <IconArrowLeft /> Volver al examen
        </button>
        <QuestionForm
          examType={type}
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => { setView('editor'); setEditingQuestion(undefined); }}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__icon"><IconBookOpen /></div>
        <h2 className="page-header__title">{exam ? 'Editar examen' : 'Nuevo examen'}</h2>
      </div>

      <div className="card">
        <h3 className="card__section-title">Informacion general</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Titulo del examen *</label>
            <input
              className={`form-input${errors.title ? ' form-input--error' : ''}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Certificacion en Desarrollo Web"
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Area tematica *</label>
            <input
              className={`form-input${errors.area ? ' form-input--error' : ''}`}
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="Ej: Tecnologia, Salud, Derecho..."
            />
            {errors.area && <span className="form-error">{errors.area}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de examen</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn${type === 'multiple_choice' ? ' type-btn--active' : ''}`}
                onClick={() => handleTypeChange('multiple_choice')}
              >
                Opcion multiple
              </button>
              <button
                type="button"
                className={`type-btn${type === 'open_questions' ? ' type-btn--active' : ''}`}
                onClick={() => handleTypeChange('open_questions')}
              >
                Preguntas abiertas
              </button>
            </div>
            {questions.length > 0 && (
              <p className="form-hint form-hint--warn">
                Cambiar el tipo elimina las preguntas actuales.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Porcentaje minimo de aprobacion *</label>
            <div className="percentage-input-wrap">
              <input
                type="number"
                className={`form-input${errors.passing ? ' form-input--error' : ''}`}
                value={passingPercentage}
                onChange={e => setPassingPercentage(Number(e.target.value))}
                min={1}
                max={100}
              />
              <span className="percentage-symbol">%</span>
            </div>
            {errors.passing && <span className="form-error">{errors.passing}</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__section-title">Preguntas ({questions.length})</h3>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setView('new_question')}
          >
            <IconPlus /> Agregar pregunta
          </button>
        </div>

        {errors.questions && (
          <div className="alert alert--error">{errors.questions}</div>
        )}

        {questions.length === 0 ? (
          <div className="empty-state">
            <IconBookOpen />
            <p>No hay preguntas aun. Agrega la primera.</p>
          </div>
        ) : (
          <ol className="question-list">
            {questions.map((q, idx) => (
              <li key={q.id} className="question-item">
                <div className="question-item__content">
                  <span className="question-item__number">{idx + 1}</span>
                  <span className="question-item__text">{q.text}</span>
                  {q.type === 'multiple_choice' && (
                    <span className="question-item__badge">
                      {q.options.length} opciones
                    </span>
                  )}
                </div>
                <div className="question-item__actions">
                  <button
                    type="button"
                    className="btn-icon btn-icon--neutral"
                    onClick={() => handleEditQuestion(q)}
                    title="Editar pregunta"
                  >
                    <IconEdit />
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-icon--danger"
                    onClick={() => handleDeleteQuestion(q.id)}
                    title="Eliminar pregunta"
                  >
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="form-actions form-actions--main">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          <IconSave /> Guardar examen
        </button>
      </div>
    </div>
  );
}
