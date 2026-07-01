import { useState, useMemo } from 'react';

export default function Pacientes({ patients, loading, onOpenPatient, onNewPatient, onRefresh }) {
  const [q, setQ] = useState('');
  const [onlyAllergic, setOnlyAllergic] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return patients.filter((p) => {
      const matches = !s || p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s) || (p.diag || '').toLowerCase().includes(s);
      const allergicOK = !onlyAllergic || (p.allergies || []).length > 0;
      return matches && allergicOK;
    });
  }, [patients, q, onlyAllergic]);

  return (
    <div style={{ padding: '28px 34px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, cédula o diagnóstico..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1.5px solid #E4EAEF',
            borderRadius: '11px',
            fontSize: '14px',
            outline: 'none',
            background: '#fff',
            color: '#0A2540'
          }}
        />
        <button
          onClick={() => setOnlyAllergic((v) => !v)}
          style={{
            padding: '11px 16px',
            border: onlyAllergic ? 'none' : '1.5px solid #E4EAEF',
            borderRadius: '11px',
            background: onlyAllergic ? 'linear-gradient(90deg,#F59E0B,#F97316)' : '#fff',
            color: onlyAllergic ? '#fff' : '#64748B',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {onlyAllergic ? '✓ Con alergias' : 'Solo con alergias'}
        </button>
        <button
          onClick={onRefresh}
          title="Recargar"
          style={{
            padding: '11px 14px',
            border: '1.5px solid #E4EAEF',
            borderRadius: '11px',
            background: '#fff',
            color: '#64748B',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ⟳
        </button>
        <button
          onClick={onNewPatient}
          style={{
            padding: '11px 18px',
            border: 'none',
            borderRadius: '11px',
            background: 'linear-gradient(90deg,#0D7377,#00C9A7)',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 18px -6px rgba(0,201,167,0.5)'
          }}
        >
          + Nuevo paciente
        </button>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
          Cargando pacientes…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
          padding: '50px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px'
        }}>
          {patients.length === 0 ? 'Aún no hay pacientes. Registra el primero con "Nuevo paciente".' : 'Sin resultados para ese filtro.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpenPatient(p.id)}
            style={{
              background: '#fff',
              border: '1px solid #EEF2F5',
              borderRadius: '16px',
              padding: '18px 20px',
              cursor: 'pointer',
              transition: 'transform .18s, box-shadow .18s',
              boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 26px -8px rgba(10,37,64,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 14px -6px rgba(10,37,64,0.06)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: p.avatarBg || '#0D7377', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '15px'
              }}>
                {p.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0A2540' }}>{p.name}</div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', fontFamily: 'ui-monospace,monospace' }}>{p.id}</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
              {p.diag || <span style={{ color: '#94A3B8' }}>Sin diagnóstico</span>}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
              {p.age != null && (
                <span style={{ background: '#F1F5F8', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  {p.age} años
                </span>
              )}
              {p.gender && (
                <span style={{ background: '#F1F5F8', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  {p.gender}
                </span>
              )}
              {(p.allergies || []).length > 0 && (
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  ⚠ {p.allergies.length} alergia{p.allergies.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
