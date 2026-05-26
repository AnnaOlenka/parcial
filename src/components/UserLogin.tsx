import { useState } from 'react';
import type { User } from '../types';
import { IconArrowLeft } from './icons';

interface UserLoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onCreateUser: (user: User) => void;
}

function generateId() {
  return crypto.randomUUID();
}

export default function UserLogin({ users, onLogin, onCreateUser }: UserLoginProps) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'identify' | 'create'>('identify');
  const [error, setError] = useState('');

  const handleIdentify = () => {
    setError('');
    if (!documentNumber.trim()) {
      setError('Ingresa tu número de documento.');
      return;
    }
    const found = users.find(u => u.documentNumber === documentNumber.trim());
    if (found) {
      onLogin(found);
    } else {
      setMode('create');
    }
  };

  const handleCreate = () => {
    setError('');
    if (!fullName.trim()) {
      setError('Ingresa tu nombre completo.');
      return;
    }
    const user: User = {
      id: generateId(),
      fullName: fullName.trim(),
      email: '',
      documentNumber: documentNumber.trim(),
      specialty: '',
      createdAt: new Date().toISOString(),
    };
    onCreateUser(user);
    onLogin(user);
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="card">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Acceso de usuario</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Ingresa tu número de documento para continuar.
          </p>
        </div>

        {mode === 'identify' && (
          <>
            <div className="form-group">
              <label className="form-label">Número de documento</label>
              <input
                className={`form-input${error ? ' form-input--error' : ''}`}
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                placeholder="Ej: 12345678"
                onKeyDown={e => e.key === 'Enter' && handleIdentify()}
              />
              {error && <span className="form-error">{error}</span>}
            </div>
            <button className="btn btn--primary" onClick={handleIdentify} style={{ width: '100%' }}>
              Continuar
            </button>
          </>
        )}

        {mode === 'create' && (
          <>
            <div style={{
              background: '#f0fdf4', color: '#15803d',
              borderLeft: '3px solid #16a34a', padding: '10px 14px',
              borderRadius: 'var(--radius)', fontSize: '0.88rem',
            }}>
              No encontramos una cuenta con ese documento. Ingresa tu nombre para registrarte.
            </div>
            <div className="form-group">
              <label className="form-label">Número de documento</label>
              <input className="form-input" value={documentNumber} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input
                className={`form-input${error ? ' form-input--error' : ''}`}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez García"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              {error && <span className="form-error">{error}</span>}
            </div>
            <div className="form-actions">
              <button className="btn btn--secondary" onClick={() => { setMode('identify'); setError(''); }}>
                <IconArrowLeft /> Volver
              </button>
              <button className="btn btn--primary" onClick={handleCreate}>
                Registrarme e ingresar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
