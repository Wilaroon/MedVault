import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const ACTIONS = [
  { key: 'ver', label: 'Consulta', color: '#3B82F6', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { key: 'crear', label: 'Creación', color: '#0D7377', icon: 'M12 5v14 M5 12h14' },
  { key: 'editar', label: 'Modificación', color: '#F59E0B', icon: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
  { key: 'exportar', label: 'Exportación', color: '#8B5CF6', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3' },
  { key: 'login', label: 'Inicio sesión', color: '#94A3B8', icon: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3' }
];

const USUARIOS = [
  { nombre: 'Dr. Anderson Santos', cedula: '8-888-8888', rol: 'Médico' },
  { nombre: 'Dra. Lucía Fernández', cedula: '4-321-9876', rol: 'Médico' },
  { nombre: 'Enf. María Torres', cedula: '3-720-1234', rol: 'Enfermería' },
  { nombre: 'Adm. Carlos Vega', cedula: '2-100-5678', rol: 'Administrador' }
];

function buildLog(patients) {
  const entries = [];
  const now = Date.now();
  const baseTargets = patients.length > 0
    ? patients.map((p) => ({ id: p.id, name: p.name }))
    : [{ id: 'MV-—', name: 'Sistema' }];

  for (let i = 0; i < 40; i++) {
    const action = ACTIONS[i % ACTIONS.length];
    const usuario = USUARIOS[i % USUARIOS.length];
    const target = baseTargets[i % baseTargets.length];
    const ip = `10.0.${Math.floor((i * 3) % 255)}.${Math.floor((i * 7) % 255)}`;
    const when = new Date(now - i * (1000 * 60 * (17 + (i % 40))));
    entries.push({
      id: `LOG-${100000 + i}`,
      action,
      usuario,
      target,
      ip,
      when
    });
  }
  return entries;
}

function fmtRelative(d) {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'hace segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short' });
}

function fmtFull(d) {
  return d.toLocaleString('es-PA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function Auditoria({ patients }) {
  const [filterAction, setFilterAction] = useState('todas');
  const [q, setQ] = useState('');
  const log = useMemo(() => buildLog(patients), [patients]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return log.filter((e) => {
      const matchQ = !s || e.usuario.nombre.toLowerCase().includes(s) || e.target.name.toLowerCase().includes(s) || e.ip.includes(s);
      const matchAction = filterAction === 'todas' || e.action.key === filterAction;
      return matchQ && matchAction;
    });
  }, [log, q, filterAction]);

  const counts = useMemo(() => {
    const out = { todas: log.length };
    ACTIONS.forEach((a) => { out[a.key] = log.filter((e) => e.action.key === a.key).length; });
    return out;
  }, [log]);

  const exportar = () => {
    const rows = ['ID,Fecha,Usuario,Cédula,Rol,Acción,Objetivo,IP'];
    filtered.forEach((e) => {
      rows.push([
        e.id, e.when.toISOString(),
        `"${e.usuario.nombre}"`, e.usuario.cedula, e.usuario.rol,
        e.action.label, `"${e.target.name}"`, e.ip
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '28px 34px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterChip label="Todas" count={counts.todas} active={filterAction === 'todas'} onClick={() => setFilterAction('todas')} />
        {ACTIONS.map((a) => (
          <FilterChip key={a.key} label={a.label} count={counts[a.key]} active={filterAction === a.key} color={a.color} onClick={() => setFilterAction(a.key)} />
        ))}
        <input
          type="text"
          placeholder="Buscar por usuario, objetivo o IP..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            marginLeft: 'auto', minWidth: '240px',
            padding: '10px 14px', border: '1.5px solid #E4EAEF', borderRadius: '11px',
            fontSize: '13px', outline: 'none', background: '#fff', color: '#0A2540'
          }}
        />
        <button
          onClick={exportar}
          style={{
            padding: '10px 16px', border: 'none', borderRadius: '11px',
            background: 'linear-gradient(90deg,#0D7377,#00C9A7)', color: '#fff',
            fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '7px',
            boxShadow: '0 8px 18px -6px rgba(0,201,167,0.5)'
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
        overflow: 'hidden', boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 1.4fr 1fr 1.5fr 130px 110px',
          gap: '14px',
          padding: '13px 20px',
          background: '#F8FAFB',
          borderBottom: '1px solid #EEF2F5',
          fontSize: '11px', fontWeight: 700, color: '#64748B',
          textTransform: 'uppercase', letterSpacing: '.5px'
        }}>
          <div>Fecha</div>
          <div>Usuario</div>
          <div>Acción</div>
          <div>Objetivo</div>
          <div>IP</div>
          <div style={{ textAlign: 'right' }}>ID</div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            Sin registros para este filtro.
          </div>
        )}

        {filtered.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.35) }}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1.4fr 1fr 1.5fr 130px 110px',
              gap: '14px',
              padding: '13px 20px',
              borderTop: i === 0 ? 'none' : '1px solid #F1F5F8',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0A2540' }}>{fmtRelative(e.when)}</div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{fmtFull(e.when)}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.usuario.nombre}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{e.usuario.rol} · {e.usuario.cedula}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '7px',
                background: `${e.action.color}22`, color: e.action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                  <path d={e.action.icon} />
                </svg>
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>{e.action.label}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.target.name}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'ui-monospace,monospace' }}>{e.target.id}</div>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'ui-monospace,monospace' }}>{e.ip}</div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'ui-monospace,monospace', textAlign: 'right' }}>{e.id}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '14px', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
        Registro de auditoría inmutable · Ley 81/2019 · Retención mínima 5 años
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 15px',
        border: active ? 'none' : '1.5px solid #E4EAEF',
        borderRadius: '10px',
        background: active ? (color || 'linear-gradient(90deg,#0D7377,#00C9A7)') : '#fff',
        color: active ? '#fff' : '#64748B',
        fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '7px'
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
