import { useState } from 'react';
import type { Exam, ExamResult, User, UserAnswer } from '../types';
import { IconArrowLeft, IconCheck } from './icons';

interface ExamTakerProps {
  exam: Exam;
  user: User;
  onSubmit: (result: ExamResult) => void;
  onCancel: () => void;
}

function generateId() {
  return crypto.randomUUID();
}

function generateCertificateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function ExamTaker({ exam, user, onSubmit, onCancel }: ExamTakerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errorQuestions, setErrorQuestions] = useState<string[]>([]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setErrorQuestions(prev => prev.filter(id => id !== questionId));
  };

  const handleOpenAnswer = (questionId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
    if (text.trim()) {
      setErrorQuestions(prev => prev.filter(id => id !== questionId));
    }
  };

  const validate = () => {
    const unanswered = exam.questions
      .filter(q => !answers[q.id] || !answers[q.id].trim())
      .map(q => q.id);
    setErrorQuestions(unanswered);
    return unanswered.length === 0;
  };

  const calculateScore = (userAnswers: UserAnswer[]): number => {
    if (exam.type === 'open_questions') return 100;
    let correct = 0;
    for (const ua of userAnswers) {
      const question = exam.questions.find(q => q.id === ua.questionId);
      if (!question) continue;
      const selected = question.options.find(o => o.id === ua.answer);
      if (selected?.isCorrect) correct++;
    }
    return exam.questions.length > 0 ? (correct / exam.questions.length) * 100 : 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const userAnswers: UserAnswer[] = exam.questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }));

    const score = calculateScore(userAnswers);
    const passed = score >= exam.passingPercentage;

    const result: ExamResult = {
      id: generateId(),
      examId: exam.id,
      userId: user.id,
      answers: userAnswers,
      score,
      passed,
      completedAt: new Date().toISOString(),
      certificateCode: passed ? generateCertificateCode() : '',
    };

    onSubmit(result);
  };

  const allAnswered = exam.questions.every(q => answers[q.id] && answers[q.id].trim());

  return (
    <div className="page">
      <button className="btn btn--ghost btn--sm back-btn" onClick={onCancel}>
        <IconArrowLeft /> Volver a exámenes
      </button>

      <div className="page-header">
        <div>
          <h2 className="page-header__title">{exam.title}</h2>
          <p className="page-header__subtitle">
            {exam.area} · {exam.questions.length} preguntas · Aprobación mínima: {exam.passingPercentage}%
          </p>
        </div>
      </div>

      {errorQuestions.length > 0 && (
        <div className="alert alert--error">
          Debes responder todas las preguntas antes de enviar.
        </div>
      )}

      {exam.questions.map((question, idx) => {
        const hasError = errorQuestions.includes(question.id);
        return (
          <div
            key={question.id}
            className="card"
            style={hasError ? { borderColor: 'var(--color-danger)', borderWidth: 2 } : {}}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span className="question-item__number">{idx + 1}</span>
              <p style={{ fontWeight: 600, fontSize: '0.97rem', flex: 1, lineHeight: 1.5 }}>
                {question.text}
              </p>
            </div>

            {question.type === 'multiple_choice' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {question.options.map((option, oIdx) => {
                  const selected = answers[question.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                        padding: '10px 14px', borderRadius: 'var(--radius)',
                        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: selected ? 'rgba(37,99,235,0.06)' : 'var(--color-bg)',
                        transition: 'border-color 0.15s, background 0.15s',
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        value={option.id}
                        checked={selected}
                        onChange={() => handleOptionSelect(question.id, option.id)}
                        style={{ accentColor: 'var(--color-primary)', flexShrink: 0 }}
                      />
                      <span style={{ fontWeight: selected ? 600 : 400 }}>
                        <strong style={{ color: 'var(--color-text-muted)', marginRight: 6 }}>
                          {String.fromCharCode(65 + oIdx)}.
                        </strong>
                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                className={`form-textarea${hasError ? ' form-textarea--error' : ''}`}
                rows={4}
                placeholder="Escribe tu respuesta aquí..."
                value={answers[question.id] ?? ''}
                onChange={e => handleOpenAnswer(question.id, e.target.value)}
              />
            )}
          </div>
        );
      })}

      <div className="form-actions form-actions--main">
        <button className="btn btn--secondary" onClick={onCancel}>Cancelar</button>
        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          style={!allAnswered ? { opacity: 0.65 } : {}}
        >
          <IconCheck /> Enviar examen
        </button>
      </div>
    </div>
  );
}
