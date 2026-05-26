import { useMemo, useState } from 'react';
import type { Certificate } from '../types';
import { useCertificates } from '../hooks/useCertificates';
import { IconArrowLeft, IconClipboard, IconX } from './icons';

interface PublicCertificateViewProps {
  code: string;
  onBack: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function PublicCertificateView({ code, onBack }: PublicCertificateViewProps) {
  const { certificateByCode } = useCertificates();
  const certificate: Certificate | undefined = useMemo(() => certificateByCode.get(code), [certificateByCode, code]);
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(() => {
    if (certificate?.publicUrl) return certificate.publicUrl;
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/certificado/${encodeURIComponent(code)}`;
  }, [certificate, code]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Si el navegador no permite copiar, no bloqueamos el flujo.
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="page">
      <div className="card" style={{ gap: 16 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-header__icon" aria-hidden="true">
            <span style={{ fontWeight: 900 }}>✓</span>
          </div>
          <div>
            <h2 className="page-header__title">Certificado Público</h2>
            <p className="page-header__subtitle">Validación simulada mediante el navegador</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button className="btn btn--secondary btn--sm" onClick={onBack}>
              <IconArrowLeft /> Volver
            </button>
          </div>
        </div>

        {!certificate ? (
          <div style={{ background: '#fee2e2', borderRadius: 'var(--radius)', padding: 14, border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ color: '#dc2626', fontSize: 18, marginTop: 2 }} aria-hidden="true">
                <IconX />
              </span>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 6 }}>Código inválido</h3>
                <p style={{ color: '#991b1b', fontSize: '0.9rem' }}>
                  Este código no coincide con ningún certificado persistido en el `localStorage` del navegador. (Simulación)
                </p>
                <p style={{ marginTop: 10, color: '#991b1b', fontFamily: 'monospace' }}>
                  Código consultado: {code}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Nombre</p>
                <p style={{ fontWeight: 800 }}>{certificate.userName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Examen</p>
                <p style={{ fontWeight: 800 }}>{certificate.examName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fecha de emisión</p>
                <p style={{ fontWeight: 700 }}>{formatDate(certificate.issuedAt)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Código único / hash</p>
                <p style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                  {certificate.code}
                </p>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>URL pública</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.88rem', wordBreak: 'break-all' }}>{publicUrl}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <button className="btn btn--secondary btn--sm" onClick={handleCopyUrl} type="button">
                    <IconClipboard /> {copied ? 'Copiado' : 'Copiar URL'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <a
                className="btn btn--primary btn--sm"
                href={certificate.pdfDataUrl}
                download={`certificado_${certificate.code}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                Descargar PDF
              </a>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Validación: el sistema verificó la existencia del código persistido (localStorage).
              </p>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <iframe
                src={certificate.pdfDataUrl}
                title="Certificado PDF"
                style={{ width: '100%', height: 560, border: 'none', display: 'block' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

