const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  marginBottom: '32px'
};

function StatCard({ label, value, accent, iconPath }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EEF2F5',
      borderRadius: '16px',
      padding: '20px 22px',
      boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <div>
        <div style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '30px', fontWeight: 800, color: '#0A2540', marginTop: '6px', letterSpacing: '-.5px' }}>
          {value}
        </div>
      </div>
      <div style={{
        width: '42px', height: '42px', borderRadius: '11px',
        background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff'
      }}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d={iconPath} />
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard({ patients }) {
  const total = patients.length;
  const alergicos = patients.filter((p) => (p.allergies || []).length > 0).length;
  const stats = [
    { label: 'Pacientes', value: total, accent: 'linear-gradient(135deg,#0D7377,#00C9A7)', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0' },
    { label: 'Consultas hoy', value: 0, accent: 'linear-gradient(135deg,#3B82F6,#60A5FA)', d: 'M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M9 12h6 M9 16h4' },
    { label: 'Alertas activas', value: alergicos, accent: 'linear-gradient(135deg,#F59E0B,#F97316)', d: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01' },
    { label: 'Labs pendientes', value: 0, accent: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', d: 'M9 2v6l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V2 M9 2h6' }
  ];

  return (
    <div style={{ padding: '28px 34px' }}>
      <div style={gridStyle}>
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} accent={s.accent} iconPath={s.d} />
        ))}
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #EEF2F5',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A2540', marginBottom: '14px' }}>
          Pacientes recientes
        </div>
        {patients.length === 0 && (
          <div style={{ padding: '30px 0', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            No hay pacientes registrados aún. Ve a la sección Pacientes para crear el primero.
          </div>
        )}
        {patients.slice(0, 5).map((p) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 4px', borderTop: '1px solid #F1F5F8'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: p.avatarBg || '#0D7377', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '13px'
            }}>
              {p.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A2540' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>{p.diag || 'Sin diagnóstico'}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{p.lastVisit || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
