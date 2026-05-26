export function getPublicCurriculumUrl(documentNumber: string) {
  // Usamos rutas por hash para navegación pública sin backend.
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/perfil/${encodeURIComponent(documentNumber)}`;
}
