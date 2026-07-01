import { useState } from 'react';

const wrapStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #F4F7F8 0%, #E8F1F2 100%)',
  padding: '20px'
};

const cardStyle = {
  background: '#fff',
  borderRadius: '20px',
  padding: '44px 44px 34px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 30px 60px -20px rgba(10,37,64,0.20), 0 12px 24px -12px rgba(10,37,64,0.10)',
  animation: 'slideUp .5s ease'
};

const headerBand = {
  height: '8px',
  borderRadius: '4px',
  background: 'linear-gradient(90deg, #0D7377, #00C9A7)',
  marginBottom: '28px'
};

const logoRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '28px'
};

const logoBox = {
  width: '52px',
  height: '52px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #0D7377, #00C9A7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 20px -6px rgba(0,201,167,0.5)'
};

const labelStyle = {
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '7px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #E4EAEF',
  borderRadius: '11px',
  fontSize: '14px',
  outline: 'none',
  color: '#0A2540',
  background: '#F8FAFB',
  transition: 'all .18s ease',
  marginBottom: '16px'
};

const buttonStyle = {
  width: '100%',
  padding: '13px',
  border: 'none',
  borderRadius: '11px',
  background: 'linear-gradient(90deg, #0D7377, #00C9A7)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 10px 22px -6px rgba(0,201,167,0.5)',
  transition: 'all .2s ease',
  marginTop: '6px'
};

export default function Login({ onLogin }) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Médico');

  const submit = (e) => {
    e.preventDefault();
    onLogin({ cedula: cedula || '8-888-8888', rol });
  };

  return (
    <div style={wrapStyle}>
      <form style={cardStyle} onSubmit={submit}>
        <div style={headerBand} />

        <div style={logoRow}>
          <div style={logoBox}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
              <path d="M12 3l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V6l8-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '-.5px' }}>MedVault</div>
            <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
              Historiales Clínicos Electrónicos
            </div>
          </div>
        </div>

        <label style={labelStyle}>Cédula o ID de usuario</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="8-888-8888"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />

        <label style={labelStyle}>Contraseña</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label style={labelStyle}>Rol</label>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option>Médico</option>
          <option>Enfermería</option>
          <option>Administrador</option>
        </select>

        <button type="submit" style={buttonStyle}>Iniciar Sesión</button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px', color: '#94A3B8', fontSize: '11.5px' }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Acceso protegido por Ley 81/2019
        </div>
      </form>
    </div>
  );
}
