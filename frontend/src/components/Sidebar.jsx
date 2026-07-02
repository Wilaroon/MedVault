const ALL_NAV = [
  { key: 'dashboard', label: 'Dashboard', roles: ['admin', 'medico', 'enfermeria'], d: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
  { key: 'pacientes', label: 'Pacientes', roles: ['admin', 'medico', 'enfermeria'], d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'consultas', label: 'Consultas', roles: ['admin'], d: 'M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M9 12h6 M9 16h4' },
  { key: 'alertas', label: 'Alertas', roles: ['admin'], d: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01' },
  { key: 'auditoria', label: 'Auditoría', roles: ['admin'], d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h5 M9 17h4' },
  { key: 'usuarios', label: 'Usuarios', roles: ['admin'], d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' }
];

const ROL_LABELS = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermeria: 'Enfermería'
};

const asideStyle = {
  width: '240px',
  minWidth: '240px',
  background: '#fff',
  borderRight: '1px solid #E4EAEF',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'sticky',
  top: 0
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
  padding: '22px 22px 18px',
  borderBottom: '1px solid #EEF2F5'
};

const logoBox = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #0D7377, #00C9A7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 6px 14px -4px rgba(0,201,167,0.5)'
};

function itemStyle(active) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    padding: '11px 15px',
    margin: '3px 14px',
    borderRadius: '11px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all .2s ease',
    color: active ? '#fff' : '#8295AB',
    background: active ? 'linear-gradient(90deg, #0D7377, #00C9A7)' : 'transparent',
    boxShadow: active ? '0 8px 18px -6px rgba(0,201,167,0.5)' : 'none',
    transform: active ? 'translateX(3px)' : 'none',
    border: 'none',
    width: 'calc(100% - 28px)',
    textAlign: 'left',
    fontFamily: 'inherit'
  };
}

export default function Sidebar({ screen, onNavigate, user, onLogout }) {
  const rol = user?.rol || 'medico';
  const visibleNav = ALL_NAV.filter((n) => n.roles.includes(rol));

  return (
    <aside style={asideStyle}>
      <div style={brandStyle}>
        <div style={logoBox}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M12 3l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-.3px' }}>MedVault</div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500 }}>Historias Clínicas</div>
        </div>
      </div>

      <nav style={{ paddingTop: '14px', flex: 1 }}>
        {visibleNav.map((n) => {
          const active = n.key === screen || (n.key === 'pacientes' && screen === 'detail');
          return (
            <button key={n.key} style={itemStyle(active)} onClick={() => onNavigate(n.key)}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                <path d={n.d} />
              </svg>
              {n.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '14px 18px', borderTop: '1px solid #EEF2F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0A2540, #12406B)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '13px'
          }}>
            {(user?.nombre || 'MV').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nombre || 'Usuario'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
              {ROL_LABELS[rol]} · {user?.cedula || '—'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '8px 12px',
            border: '1.5px solid #E4EAEF', borderRadius: '9px',
            background: '#fff', color: '#64748B',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
          }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
