import type { Exam, ExamResult, User } from '../types';
import { IconCheck, IconX, IconClipboard } from './icons';

interface ExamResultViewProps {
  result: ExamResult;
  exam: Exam;
  user: User;
  onBack: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function ExamResultView({ result, exam, user, onBack }: ExamResultViewProps) {
  const color = result.passed ? 'var(--color-success)' : 'var(--color-danger)';
  const bgColor = result.passed ? '#f0fdf4' : '#fee2e2';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="card" style={{ gap: 24, textAlign: 'center' }}>

        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto',
          background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color, transform: 'scale(2.2)', display: 'flex' }}>
            {result.passed ? <IconCheck /> : <IconX />}
          </span>
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color }}>
            {result.passed ? '¡Aprobaste!' : 'No aprobaste'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>{exam.title}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
          <div className="stat">
            <span className="stat__value" style={{ fontSize: '2rem', color }}>
              {result.score.toFixed(0)}%
            </span>
            <span className="stat__label">Tu puntaje</span>
          </div>
          <div className="stat">
            <span className="stat__value" style={{ fontSize: '2rem' }}>
              {exam.passingPercentage}%
            </span>
            <span className="stat__label">Mínimo para aprobar</span>
          </div>
        </div>

        <div style={{
          background: 'var(--color-bg)', borderRadius: 'var(--radius)',
          padding: '16px 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estudiante</p>
            <p style={{ fontWeight: 600 }}>{user.fullName}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Documento</p>
            <p style={{ fontWeight: 600 }}>{user.documentNumber}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fecha de rendición</p>
            <p style={{ fontWeight: 600 }}>{formatDate(result.completedAt)}</p>
          </div>
          {result.passed && result.certificateCode && (
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Código de certificado</p>
              <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary)', letterSpacing: '0.1em', fontSize: '1.05rem' }}>
                {result.certificateCode}
              </p>
            </div>
          )}
        </div>

        {result.passed && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius)', padding: '12px 16px',
            fontSize: '0.88rem', color: '#15803d',
          }}>
            Felicitaciones. Tu certificado estará disponible en tu perfil profesional.
          </div>
        )}

        <button className="btn btn--primary" onClick={onBack} style={{ width: '100%' }}>
          <IconClipboard /> Volver a los exámenes
        </button>
      </div>
    </div>
  );
}
