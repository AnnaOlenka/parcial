import { FormEvent, useMemo, useState } from 'react';
import type { Certificate, Exam, ExamResult, User } from '../types';
import { useCertificates } from '../hooks/useCertificates';
import { IconBookOpen } from './icons';
import { getPublicCertificateUrl } from '../lib/certificates';
import { getPublicCurriculumUrl } from '../lib/curriculum';

interface UserCurriculumViewProps {
  user: User;
  exams: Exam[];
  results: ExamResult[];
  currentUserId?: string;
  isPublicView?: boolean;
  onUpdateUser?: (updatedUser: User) => void;
  onBackToExams?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function UserCurriculumView({
  user,
  exams,
  results,
  currentUserId,
  isPublicView = false,
  onUpdateUser,
  onBackToExams,
}: UserCurriculumViewProps) {
  const { getCertificatesByUserId, getCertificateByCode } = useCertificates();
  const [message, setMessage] = useState('');
  const canEdit = !isPublicView && currentUserId === user.id && Boolean(onUpdateUser);

  const examById = useMemo(() => {
    const map = new Map<string, Exam>();
    for (const e of exams) map.set(e.id, e);
    return map;
  }, [exams]);

  const certificates: Certificate[] = useMemo(() => {
    return getCertificatesByUserId(user.id)
      .filter(cert => examById.has(cert.examId))
      .sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
  }, [getCertificatesByUserId, user.id, examById]);

  const publicCurriculumUrl = useMemo(
    () => getPublicCurriculumUrl(user.documentNumber),
    [user.documentNumber]
  );

  const userResults = useMemo(() => {
    return results
      .filter(r => r.userId === user.id)
      .sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
  }, [results, user.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || !onUpdateUser) return;

    const data = new FormData(event.currentTarget);
    const updatedUser: User = {
      ...user,
      experience: String(data.get('experience') ?? '').trim(),
      education: String(data.get('education') ?? '').trim(),
    };

    onUpdateUser(updatedUser);
    setMessage('Curriculum actualizado correctamente.');
  };

  return (
    <div className="page" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header__icon" aria-hidden="true">
          <IconBookOpen />
        </div>
        <div>
          <h2 className="page-header__title">Curriculum digital</h2>
          <p className="page-header__subtitle">
            {isPublicView
              ? 'Perfil publico del usuario y certificaciones obtenidas'
              : 'Gestion de perfil profesional y certificaciones'}
          </p>
        </div>
        {onBackToExams && (
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn--secondary btn--sm" onClick={onBackToExams}>
              Volver a examenes
            </button>
          </div>
        )}
      </div>

      <section className="curriculum-layout">
        <div className="card" style={{ gap: 14 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Perfil publico</h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
            URL unica:{' '}
            <a href={publicCurriculumUrl} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>
              {publicCurriculumUrl}
            </a>
          </p>

          <div style={{ display: 'grid', gap: 4 }}>
            <p style={{ fontWeight: 900, fontSize: '1.1rem' }}>{user.fullName}</p>
            <p>{user.specialty}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {user.email} · DNI {user.documentNumber}
            </p>
          </div>

          <div style={{ marginTop: 6 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>Certificaciones obtenidas</h3>
            {certificates.length === 0 ? (
              <p className="form-hint">Aun no tiene certificados aprobados.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {certificates.map(cert => {
                  const exam = examById.get(cert.examId);
                  return (
                    <article
                      key={cert.code}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius)',
                        padding: 12,
                        background: 'var(--color-bg)',
                      }}
                    >
                      <p style={{ fontWeight: 800 }}>{exam?.title ?? cert.examName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Codigo: {cert.code}
                      </p>
                      <a href={cert.publicUrl} style={{ fontSize: '0.86rem' }} target="_blank" rel="noreferrer">
                        Ver certificado publico
                      </a>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ gap: 14 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900 }}>
            {canEdit ? 'Edicion controlada del curriculum' : 'Experiencia y formacion academica'}
          </h3>

          {canEdit ? (
            <form className="form-group" onSubmit={handleSubmit}>
              <label className="form-label" htmlFor="experience">
                Experiencia laboral
              </label>
              <textarea
                id="experience"
                name="experience"
                className="form-textarea"
                rows={5}
                defaultValue={user.experience ?? ''}
                placeholder="Ej: Desarrollador web freelance, soporte tecnico, proyectos universitarios"
              />

              <label className="form-label" htmlFor="education">
                Formacion academica
              </label>
              <textarea
                id="education"
                name="education"
                className="form-textarea"
                rows={5}
                defaultValue={user.education ?? ''}
                placeholder="Ej: Ingenieria de Sistemas, cursos de desarrollo web y certificaciones"
              />

              <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                <button className="btn btn--primary" type="submit">
                  Guardar curriculum
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius)', padding: 12, border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Experiencia laboral</p>
                <p style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
                  {user.experience?.trim() || 'Sin informacion registrada.'}
                </p>
              </div>
              <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius)', padding: 12, border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Formacion academica</p>
                <p style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
                  {user.education?.trim() || 'Sin informacion registrada.'}
                </p>
              </div>
            </div>
          )}

          {message && (
            <p className="alert" style={{ background: '#dcfce7', color: '#166534', borderLeft: '3px solid #16a34a' }}>
              {message}
            </p>
          )}
        </div>
      </section>

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

