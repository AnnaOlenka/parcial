import { useEffect, useMemo, useState } from 'react';
import type { Certificate } from '../types';

const STORAGE_KEY = 'certificates';

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Certificate[]) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
  }, [certificates]);

  const saveCertificate = (certificate: Certificate) => {
    setCertificates(prev => {
      const exists = prev.some(c => c.code === certificate.code);
      if (exists) return prev.map(c => (c.code === certificate.code ? certificate : c));
      return [...prev, certificate];
    });
  };

  const getCertificateByCode = (code: string) =>
    certificates.find(c => c.code === code);

  const getCertificatesByUserId = (userId: string) =>
    certificates.filter(c => c.userId === userId);

  // Useful for looking up quickly in UI lists.
  const certificateByCode = useMemo(() => {
    const map = new Map<string, Certificate>();
    for (const c of certificates) map.set(c.code, c);
    return map;
  }, [certificates]);

  return { certificates, saveCertificate, getCertificateByCode, getCertificatesByUserId, certificateByCode };
}

