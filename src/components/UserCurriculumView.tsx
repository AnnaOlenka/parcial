import { useMemo } from 'react';
import type { Certificate, Exam, ExamResult, User } from '../types';
import { useCertificates } from '../hooks/useCertificates';
import { IconBookOpen } from './icons';
import { getPublicCertificateUrl } from '../lib/certificates';

interface UserCurriculumViewProps {
  user: User;
  exams: Exam[];
  results: ExamResult[];
  onBackToExams: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function UserCurriculumView({ user, exams, results, onBackToExams }: UserCurriculumViewProps) {
  const { getCertificatesByUserId, getCertificateByCode } = useCertificates();
  const certificates: Certificate[] = useMemo(() => getCertificatesByUserId(user.id), [getCertificatesByUserId, user.id]);
  const passedCertificates = certificates; // en esta app, solo guardamos certificados al aprobar

  const examById = useMemo(() => {
    const map = new Map<string, Exam>();
    for (const e of exams) map.set(e.id, e);
    return map;
  }, [exams]);

  const userResults = useMemo(() => {
    return results
      .filter(r => r.userId === user.id)
      .sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
  }, [results, user.id]);

  return (
    <div className="page" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header__icon" aria-hidden="true">
          <IconBookOpen />
        </div>
        <div>
          <h2 className="page-header__title">Currículum</h2>
          <p className="page-header__subtitle">Certificados digitales disponibles</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn--secondary btn--sm" onClick={onBackToExams}>
            Volver a exámenes
          </button>
        </div>
      </div>

      {passedCertificates.length === 0 ? (
        <div className="empty-state empty-state--full">
          <IconBookOpen />
          <h3>Sin certificados todavía</h3>
          <p>Aprueba algún examen para que el certificado aparezca aquí.</p>
          <p style={{ fontSize: '0.82rem', marginTop: 6, color: 'var(--color-text-muted)' }}>
            (Este es el requisito de visualización desde el “currículum”.)
          </p>
        </div>
      ) : (
        <div className="exam-grid">
          {passedCertificates.map(cert => (
            <div key={cert.code} className="exam-card" style={{ padding: 22 }}>
              <div className="exam-card__header">
                <span className="exam-card__type-badge badge--green" style={{ fontSize: '0.76rem' }}>
                  Certificado
                </span>
                <span className="question-item__badge" style={{ background: 'rgba(37,99,235,0.08)' }}>
                  {formatDate(cert.issuedAt)}
                </span>
              </div>

              <h3 className="exam-card__title" style={{ marginTop: 2 }}>
                {cert.examName}
              </h3>

              <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 12 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Código</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em', wordBreak: 'break-all' }}>
                  {cert.code}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                <a className="btn btn--primary btn--sm" href={cert.publicUrl} style={{ textDecoration: 'none' }}>
                  Ver certificado público
                </a>
                <a
                  className="btn btn--secondary btn--sm"
                  href={cert.pdfDataUrl}
                  download={`certificado_${cert.code}.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  Descargar PDF
                </a>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 10, wordBreak: 'break-all' }}>
                URL: {cert.publicUrl}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Historial de exámenes</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Incluye resultados y vínculos con certificados
          </p>
        </div>

        {userResults.length === 0 ? (
          <div style={{ marginTop: 12 }} className="empty-state">
            <IconBookOpen />
            <h3>Sin intentos</h3>
            <p>Rinde un examen para que aparezca tu historial.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
            {userResults.map(r => {
              const exam = examById.get(r.examId);
              const isPassed = r.passed;
              const badgeBg = isPassed ? '#dcfce7' : '#fee2e2';
              const badgeText = isPassed ? '#15803d' : 'var(--color-danger)';

              const certUrl = r.passed && r.certificateCode ? getPublicCertificateUrl(r.certificateCode) : '';
              const cert = isPassed && r.certificateCode ? getCertificateByCode(r.certificateCode) : undefined;

              return (
                <div
                  key={r.id}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: '1rem', wordBreak: 'break-word' }}>
                        {exam?.title ?? 'Examen (no encontrado)'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        {formatDate(r.completedAt)} · Puntaje: {r.score.toFixed(0)}%
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                      <span style={{ background: badgeBg, color: badgeText, padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>
                        {isPassed ? 'Aprobado' : 'Reprobado'}
                      </span>
                      {isPassed && r.certificateCode && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <a className="btn btn--primary btn--sm" href={certUrl} style={{ textDecoration: 'none' }}>
                            Ver público
                          </a>
                          {cert ? (
                            <a
                              className="btn btn--secondary btn--sm"
                              href={cert.pdfDataUrl}
                              download={`certificado_${cert.code}.pdf`}
                              style={{ textDecoration: 'none' }}
                            >
                              Descargar PDF
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                              PDF no disponible en este navegador.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isPassed && r.certificateCode && (
                    <p style={{ marginTop: 10, fontFamily: 'monospace', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--color-primary)' }}>
                      Código: {r.certificateCode}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

