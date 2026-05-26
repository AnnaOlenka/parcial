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

function isValidEmail(email: string) {
  // Validación simple (suficiente para ejercicio).
  return /^\S+@\S+\.\S+$/.test(email);
}

export default function UserLogin({ users, onLogin, onCreateUser }: UserLoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login (autenticación)
  const [loginDocumentNumber, setLoginDocumentNumber] = useState('');

  // Registro
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [specialty, setSpecialty] = useState('');

  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const doc = loginDocumentNumber.trim();
    if (!doc) {
      setError('Ingresa tu número de documento.');
      return;
    }
    const found = users.find(u => u.documentNumber === doc);
    if (!found) {
      setError('No existe una cuenta con ese documento. Regístrate para continuar.');
      return;
    }
    onLogin(found);
  };

  const handleRegister = () => {
    setError('');

    const doc = documentNumber.trim();
    const name = fullName.trim();
    const mail = email.trim();
    const spec = specialty.trim();

    if (!name) {
      setError('Ingresa tu nombre completo.');
      return;
    }
    if (!mail || !isValidEmail(mail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!doc) {
      setError('Ingresa tu número de documento.');
      return;
    }
    if (!/^\d+$/.test(doc)) {
      setError('El número de documento debe contener solo dígitos.');
      return;
    }
    if (!spec) {
      setError('Ingresa tu especialidad.');
      return;
    }
    const alreadyExists = users.some(u => u.documentNumber === doc);
    if (alreadyExists) {
      setError('Ese número de documento ya está registrado. Usa otro o inicia sesión.');
      return;
    }

    const user: User = {
      id: generateId(),
      fullName: name,
      email: mail,
      documentNumber: doc,
      specialty: spec,
      createdAt: new Date().toISOString(),
    };

    onCreateUser(user);
    onLogin(user);
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="card">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {mode === 'login' ? 'Acceso de usuario' : 'Registro de usuario'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {mode === 'login'
              ? 'Ingresa tu número de documento para continuar.'
              : 'Completa los datos para crear tu cuenta.'}
          </p>
        </div>

        {mode === 'login' && (
          <>
            <div className="form-group">
              <label className="form-label">Número de documento</label>
              <input
                className={`form-input${error ? ' form-input--error' : ''}`}
                value={loginDocumentNumber}
                onChange={e => setLoginDocumentNumber(e.target.value)}
                placeholder="Ej: 12345678"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              {error && <span className="form-error">{error}</span>}
            </div>
            <button className="btn btn--primary" onClick={handleLogin} style={{ width: '100%' }}>
              Continuar
            </button>

            <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              ¿No tienes cuenta?{' '}
              <button
                className="btn btn--ghost btn--sm"
                style={{ padding: 0, fontSize: '0.85rem' }}
                onClick={() => {
                  setError('');
                  setMode('register');
                  setDocumentNumber(loginDocumentNumber.trim());
                }}
                type="button"
              >
                Regístrate aquí
              </button>
            </div>
          </>
        )}

        {mode === 'register' && (
          <>
            <div style={{
              background: '#f0fdf4', color: '#15803d',
              borderLeft: '3px solid #16a34a', padding: '10px 14px',
              borderRadius: 'var(--radius)', fontSize: '0.88rem',
            }}>
              Crea tu cuenta con documento único.
            </div>

            {error && <span className="form-error" style={{ marginTop: 6 }}>{error}</span>}

            <div className="form-group">
              <label className="form-label">Número de documento</label>
              <input
                className="form-input"
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value)}
                placeholder="Ej: 12345678"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez García"
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico *</label>
              <input
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidad *</label>
              <input
                className="form-input"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                placeholder="Ej: Desarrollo Web"
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setLoginDocumentNumber(documentNumber.trim());
                }}
              >
                <IconArrowLeft /> Volver
              </button>
              <button className="btn btn--primary" onClick={handleRegister}>
                Registrarme e ingresar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
