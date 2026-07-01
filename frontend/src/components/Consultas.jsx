import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOTIVOS = [
  'Control mensual',
  'Consulta general',
  'Seguimiento tratamiento',
  'Renovación de receta',
  'Chequeo cardiológico',
  'Evaluación laboratorio',
  'Consulta preventiva'
];

const DOCTORES = [
  'Dr. Anderson Santos',
  'Dra. Lucía Fernández',
  'Dr. Carlos Vega',
  'Dra. Ana Ríos'
];

const ESTADOS = [
  { key: 'programada', label: 'Programada', bg: '#DBEAFE', fg: '#1E40AF' },
  { key: 'completada', label: 'Completada', bg: '#D1FAE5', fg: '#065F46' },
  { key: 'cancelada', label: 'Cancelada', bg: '#FEE2E2', fg: '#991B1B' },
  { key: 'pendiente', label: 'Pendiente', bg: '#FEF3C7', fg: '#92400E' }
];

function buildConsultas(patients) {
  if (!patients.length) return [];
  const now = new Date();
  const consultas = [];
  patients.forEach((p, idx) => {
    const offset = ((idx * 7) % 30) - 15;
    const fecha = new Date(now);
    fecha.setDate(now.getDate() + offset);
    const hora = 8 + (idx % 9);
    const estadoIdx = offset < 0 ? 1 : offset === 0 ? 3 : 0;
    consultas.push({
      id: `C-${1000 + idx}`,
      pacienteId: p.id,
      pacienteName: p.name,
      pacienteInitials: p.initials,
      pacienteAvatarBg: p.avatarBg,
      doctor: DOCTORES[idx % DOCTORES.length],
      motivo: MOTIVOS[idx % MOTIVOS.length],
      diag: p.diag,
      fecha,
      hora: `${String(hora).padStart(2, '0')}:${idx % 2 === 0 ? '00' : '30'}`,
      estado: ESTADOS[estadoIdx].key
    });
  });
  return consultas.sort((a, b) => a.fecha - b.fecha);
}

function fmtDate(d) {
  return d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function estadoStyle(key) {
  const e = ESTADOS.find((x) => x.key === key) || ESTADOS[0];
  return { bg: e.bg, fg: e.fg, label: e.label };
}

export default function Consultas({ patients }) {
  const [filter, setFilter] = useState('todas');
  const [q, setQ] = useState('');
  const consultas = useMemo(() => buildConsultas(patients), [patients]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return consultas.filter((c) => {
      const matchQ = !s || c.pacienteName.toLowerCase().includes(s) || c.motivo.toLowerCase().includes(s) || c.doctor.toLowerCase().includes(s);
      const matchFilter = filter === 'todas' || c.estado === filter;
      return matchQ && matchFilter;
    });
  }, [consultas, q, filter]);

  const counts = useMemo(() => {
    const out = { todas: consultas.length };
    ESTADOS.forEach((e) => { out[e.key] = consultas.filter((c) => c.estado === e.key).length; });
    return out;
  }, [consultas]);

  return (
    <div style={{ padding: '28px 34px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <FilterChip label="Todas" count={counts.todas} active={filter === 'todas'} onClick={() => setFilter('todas')} />
        {ESTADOS.map((e) => (
          <FilterChip key={e.key} label={e.label} count={counts[e.key]} active={filter === e.key} bg={e.bg} fg={e.fg} onClick={() => setFilter(e.key)} />
        ))}
        <input
          type="text"
          placeholder="Buscar por paciente, motivo o doctor..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            marginLeft: 'auto', minWidth: '260px',
            padding: '10px 14px', border: '1.5px solid #E4EAEF', borderRadius: '11px',
            fontSize: '13px', outline: 'none', background: '#fff', color: '#0A2540'
          }}
        />
      </div>

      {filtered.length === 0 && (
        <div style={{
          background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
          padding: '50px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px'
        }}>
          {patients.length === 0 ? 'Registra pacientes para ver consultas.' : 'Sin consultas para este filtro.'}
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
        overflow: 'hidden', boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
      }}>
        <AnimatePresence initial={false}>
          {filtered.map((c, i) => {
            const est = estadoStyle(c.estado);
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1.5fr 1fr 110px',
                  gap: '14px',
                  alignItems: 'center',
                  padding: '14px 20px',
                  borderTop: i === 0 ? 'none' : '1px solid #F1F5F8'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    {c.fecha.toLocaleDateString('es-PA', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0A2540', lineHeight: 1 }}>
                    {c.fecha.getDate()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0D7377', fontWeight: 700, marginTop: '2px' }}>
                    {c.hora}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: c.pacienteAvatarBg || '#0D7377', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12.5px', flexShrink: 0
                  }}>
                    {c.pacienteInitials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.pacienteName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'ui-monospace,monospace' }}>{c.pacienteId}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0A2540' }}>{c.motivo}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{c.diag || 'Sin diagnóstico registrado'}</div>
                </div>

                <div style={{ fontSize: '12px', color: '#475569' }}>{c.doctor}</div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: est.bg, color: est.fg,
                    padding: '5px 11px', borderRadius: '8px',
                    fontSize: '11.5px', fontWeight: 700
                  }}>
                    {est.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, bg, fg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 15px',
        border: active ? 'none' : '1.5px solid #E4EAEF',
        borderRadius: '10px',
        background: active ? (bg || 'linear-gradient(90deg,#0D7377,#00C9A7)') : '#fff',
        color: active ? (fg || '#fff') : '#64748B',
        fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '7px',
        boxShadow: active ? '0 6px 16px -6px rgba(0,201,167,0.4)' : 'none'
      }}
    >
      {label}
      <span style={{
        background: active ? 'rgba(255,255,255,0.25)' : '#F1F5F8',
        padding: '1px 7px', borderRadius: '6px',
        fontSize: '10.5px', fontWeight: 800
      }}>{count}</span>
    </button>
  );
}
