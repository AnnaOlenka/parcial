import { useMemo } from 'react';
import type { Certificate, Exam, ExamResult, User } from '../types';
import { getPublicCertificateUrl } from '../lib/certificates';
import { getPublicCurriculumUrl } from '../lib/curriculum';
import { IconBookOpen, IconClipboard } from './icons';

interface UsersDirectoryViewProps {
  users: User[];
  exams: Exam[];
  results: ExamResult[];
  certificates: Certificate[];
  onBackToExams: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function UsersDirectoryView({
  users,
  exams,
  results,
  certificates,
  onBackToExams,
}: UsersDirectoryViewProps) {
  const examById = useMemo(() => {
    const map = new Map<string, Exam>();
    for (const e of exams) map.set(e.id, e);
    return map;
  }, [exams]);

  return (
    <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header__icon" aria-hidden="true">
          <IconClipboard />
        </div>
        <div>
          <h2 className="page-header__title">Usuarios registrados</h2>
          <p className="page-header__subtitle">Validaciones, duplicados y asociación con exámenes/certificados</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn--secondary btn--sm" onClick={onBackToExams} type="button">
            Volver a exámenes
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state empty-state--full">
          <IconBookOpen />
          <h3>No hay usuarios registrados</h3>
          <p>Registra un usuario desde la sección de Usuario para comenzar.</p>
        </div>
      ) : (
        <div className="exam-grid">
          {users.map(user => {
            const userResults = results.filter(r => r.userId === user.id);
            const userCertificates = certificates.filter(c => c.userId === user.id);
            const passedCodes = new Set(userCertificates.map(c => c.code));

            const sortedResults = [...userResults].sort(
              (a, b) => +new Date(b.completedAt) - +new Date(a.completedAt)
            );

            return (
              <div key={user.id} className="exam-card" style={{ padding: 22 }}>
                <div className="exam-card__header">
                  <span className="exam-card__type-badge badge--green" style={{ fontSize: '0.76rem' }}>
                    {user.specialty ? user.specialty : 'Sin especialidad'}
                  </span>
                  <span className="question-item__badge" style={{ background: 'rgba(37,99,235,0.08)' }}>
                    {user.documentNumber}
                  </span>
                </div>

                <h3 className="exam-card__title">{user.fullName}</h3>
                <p className="exam-card__area">{user.email ? user.email : 'Sin correo'}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
                  Perfil publico:{' '}
                  <a href={getPublicCurriculumUrl(user.documentNumber)} target="_blank" rel="noreferrer">
                    {getPublicCurriculumUrl(user.documentNumber)}
                  </a>
                </p>

                <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 12 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Exámenes rendidos
                    </p>
                    {sortedResults.length === 0 ? (
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                        Sin intentos todavía.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                        {sortedResults.slice(0, 4).map(r => {
                          const exam = examById.get(r.examId);
                          const isPassed = r.passed;
                          const badgeBg = isPassed ? '#dcfce7' : '#fee2e2';
                          const badgeText = isPassed ? '#15803d' : 'var(--color-danger)';

                          const certUrl =
                            isPassed && r.certificateCode
                              ? getPublicCertificateUrl(r.certificateCode)
                              : '';

                          return (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 800, fontSize: '0.93rem', lineHeight: 1.25, wordBreak: 'break-word' }}>
                                  {exam?.title ?? 'Examen (no encontrado)'}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                                  {formatDate(r.completedAt)} · {r.score.toFixed(0)}%
                                </p>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                <span style={{ background: badgeBg, color: badgeText, padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>
                                  {isPassed ? 'Aprobado' : 'Reprobado'}
                                </span>
                                {isPassed && r.certificateCode && passedCodes.has(r.certificateCode) && (
                                  <a className="btn btn--primary btn--sm" href={certUrl} style={{ textDecoration: 'none' }}>
                                    Ver público
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {sortedResults.length > 4 && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            Mostrando 4 de {sortedResults.length} intentos.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 12 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Certificados
                    </p>
                    {userCertificates.length === 0 ? (
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                        Sin certificados en este navegador.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                        {userCertificates
                          .slice()
                          .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt))
                          .slice(0, 3)
                          .map(c => (
                            <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 800, wordBreak: 'break-word' }}>
                                  {c.examName}
                                </p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                                  {formatDate(c.issuedAt)} · <span style={{ fontFamily: 'monospace' }}>{c.code}</span>
                                </p>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <a className="btn btn--secondary btn--sm" href={c.publicUrl} style={{ textDecoration: 'none' }}>
                                  Ver público
                                </a>
                                <a
                                  className="btn btn--primary btn--sm"
                                  href={c.pdfDataUrl}
                                  download={`certificado_${c.code}.pdf`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  PDF
                                </a>
                              </div>
                            </div>
                          ))}
                        {userCertificates.length > 3 && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            Mostrando 3 de {userCertificates.length} certificados.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

