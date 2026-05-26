import { useState } from 'react';
import type { Question, Option, ExamType } from '../types';
import { IconPlus, IconTrash, IconCheck, IconX } from './icons';

interface QuestionFormProps {
  examType: ExamType;
  question?: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

function generateId() {
  return crypto.randomUUID();
}

export default function QuestionForm({ examType, question, onSave, onCancel }: QuestionFormProps) {
  const [text, setText] = useState(question?.text ?? '');
  const [options, setOptions] = useState<Option[]>(
    question?.options ?? (examType === 'multiple_choice'
      ? [
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: false },
        ]
      : [])
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!text.trim()) errs.text = 'El enunciado de la pregunta es requerido.';
    if (examType === 'multiple_choice') {
      if (options.length < 2) errs.options = 'Debe haber al menos 2 opciones.';
      const hasCorrect = options.some(o => o.isCorrect);
      if (!hasCorrect) errs.correct = 'Debe marcar al menos una opcion correcta.';
      const emptyOption = options.some(o => !o.text.trim());
      if (emptyOption) errs.optionText = 'Todas las opciones deben tener texto.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: question?.id ?? generateId(),
      text: text.trim(),
      type: examType,
      options,
    });
  };

  const addOption = () => {
    setOptions(prev => [...prev, { id: generateId(), text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const updateOption = (id: string, field: keyof Option, value: string | boolean) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const toggleCorrect = (id: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o));
  };

  return (
    <div className="question-form">
      <h4 className="question-form__title">{question ? 'Editar pregunta' : 'Nueva pregunta'}</h4>

      <div className="form-group">
        <label className="form-label">Enunciado</label>
        <textarea
          className={`form-textarea${errors.text ? ' form-textarea--error' : ''}`}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe el enunciado de la pregunta..."
          rows={3}
        />
        {errors.text && <span className="form-error">{errors.text}</span>}
      </div>

      {examType === 'multiple_choice' && (
        <div className="form-group">
          <label className="form-label">Opciones de respuesta</label>
          <p className="form-hint">Marca la casilla verde para indicar la(s) respuesta(s) correcta(s).</p>
          {errors.options && <span className="form-error">{errors.options}</span>}
          {errors.correct && <span className="form-error">{errors.correct}</span>}
          {errors.optionText && <span className="form-error">{errors.optionText}</span>}
          <div className="options-list">
            {options.map((opt, idx) => (
              <div key={opt.id} className="option-row">
                <span className="option-index">{idx + 1}</span>
                <input
                  className="form-input option-input"
                  value={opt.text}
                  onChange={e => updateOption(opt.id, 'text', e.target.value)}
                  placeholder={`Opcion ${idx + 1}`}
                />
                <button
                  type="button"
                  className={`btn-icon${opt.isCorrect ? ' btn-icon--correct' : ' btn-icon--neutral'}`}
                  onClick={() => toggleCorrect(opt.id)}
                  title={opt.isCorrect ? 'Correcta' : 'Marcar como correcta'}
                >
                  <IconCheck />
                </button>
                <button
                  type="button"
                  className="btn-icon btn-icon--danger"
                  onClick={() => removeOption(opt.id)}
                  title="Eliminar opcion"
                  disabled={options.length <= 2}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addOption}>
            <IconPlus /> Agregar opcion
          </button>
        </div>
      )}

      {examType === 'open_questions' && (
        <div className="form-group">
          <p className="form-hint">
            Esta es una pregunta abierta. Los usuarios escribiran su respuesta libremente.
          </p>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          <IconX /> Cancelar
        </button>
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          <IconCheck /> Guardar pregunta
        </button>
      </div>
    </div>
  );
}
