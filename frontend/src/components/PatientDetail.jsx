function sevColor(sev) {
  const s = (sev || '').toLowerCase();
  if (s === 'severa' || s === 'severo') return { bg: '#FEE2E2', fg: '#991B1B' };
  if (s === 'moderada' || s === 'moderado') return { bg: '#FEF3C7', fg: '#92400E' };
  return { bg: '#DBEAFE', fg: '#1E40AF' };
}

function Card({ title, children }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EEF2F5',
      borderRadius: '16px',
      padding: '18px 20px',
      boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
    }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2540', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function PatientDetail({ patient, onBack }) {
  if (!patient) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
        Paciente no encontrado.
        <button onClick={onBack} style={{ display: 'block', margin: '16px auto', padding: '10px 20px', border: '1px solid #E4EAEF', borderRadius: '10px', background: '#fff', cursor: 'pointer' }}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 34px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: '#0D7377', fontSize: '13px',
          fontWeight: 600, cursor: 'pointer', marginBottom: '18px', padding: 0
        }}
      >
        ← Volver a Pacientes
      </button>

      <div style={{
        background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
        padding: '22px 24px', marginBottom: '20px',
        boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
        display: 'flex', gap: '18px', alignItems: 'center'
      }}>
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%',
          background: patient.avatarBg || '#0D7377', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 800
        }}>
          {patient.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0A2540', letterSpacing: '-.4px' }}>{patient.name}</div>
          <div style={{ fontSize: '12.5px', color: '#94A3B8', fontFamily: 'ui-monospace,monospace', marginTop: '2px' }}>{patient.id}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', fontSize: '12px' }}>
            {patient.age != null && (
              <span style={{ background: '#F1F5F8', color: '#475569', padding: '4px 10px', borderRadius: '7px', fontWeight: 600 }}>
                {patient.age} años
              </span>
            )}
            {patient.gender && (
              <span style={{ background: '#F1F5F8', color: '#475569', padding: '4px 10px', borderRadius: '7px', fontWeight: 600 }}>
                {patient.gender}
              </span>
            )}
            {patient.bloodType && (
              <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '7px', fontWeight: 700 }}>
                🩸 {patient.bloodType}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '18px' }}>
        <Card title="Diagnóstico principal">
          <div style={{ fontSize: '15px', color: '#0A2540' }}>{patient.diag || <span style={{ color: '#94A3B8' }}>No registrado</span>}</div>
        </Card>

        <Card title="Alergias">
          {(patient.allergies || []).length === 0 && (
            <div style={{ color: '#94A3B8', fontSize: '13px' }}>Sin alergias conocidas.</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {(patient.allergies || []).map((a, i) => {
              const c = sevColor(a.sev);
              return (
                <span key={i} style={{
                  background: c.bg, color: c.fg,
                  padding: '5px 11px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700
                }}>
                  {a.name} · {a.sev}
                </span>
              );
            })}
          </div>
        </Card>

        <Card title="Contacto">
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7 }}>
            <div>📞 {patient.phone || '—'}</div>
            <div>✉️ {patient.email || '—'}</div>
            <div>📍 {patient.address || '—'}</div>
          </div>
        </Card>

        <Card title="Contacto de emergencia">
          {patient.emergency ? (
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7 }}>
              <div><strong>{patient.emergency.nombre}</strong></div>
              <div>📞 {patient.emergency.telefono}</div>
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '13px' }}>No registrado</div>
          )}
        </Card>

        <Card title="Seguro médico">
          <div style={{ fontSize: '13px', color: '#475569' }}>{patient.insurance || <span style={{ color: '#94A3B8' }}>—</span>}</div>
        </Card>

        {patient.vitals && Object.keys(patient.vitals).length > 0 && (
          <Card title="Signos vitales">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12.5px', color: '#475569' }}>
              {patient.vitals.presion && <div><span style={{ color: '#94A3B8' }}>Presión:</span> {patient.vitals.presion}</div>}
              {patient.vitals.fc && <div><span style={{ color: '#94A3B8' }}>FC:</span> {patient.vitals.fc}</div>}
              {patient.vitals.temp && <div><span style={{ color: '#94A3B8' }}>Temp:</span> {patient.vitals.temp}</div>}
              {patient.vitals.peso && <div><span style={{ color: '#94A3B8' }}>Peso:</span> {patient.vitals.peso}</div>}
            </div>
          </Card>
        )}
      </div>

      {patient.history && patient.history.length > 0 && (
        <Card title="Historial clínico">
          {patient.history.map((h, i) => (
            <div key={i} style={{
              padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #F1F5F8',
              fontSize: '13px', color: '#475569'
            }}>
              {typeof h === 'string' ? h : (
                <>
                  <div style={{ fontWeight: 600, color: '#0A2540' }}>{h.type || 'Registro'} — {h.date || ''}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{h.doctor}</div>
                  <div style={{ marginTop: 4 }}>{h.note}</div>
                </>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
