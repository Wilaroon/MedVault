import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DonutChart from './charts/DonutChart.jsx';

const LEVELS = {
  critica: {
    label: 'Crítica', bg: '#FEE2E2', fg: '#991B1B', accent: '#DC2626',
    icon: 'M12 2L2 22h20L12 2z M12 9v6 M12 18h.01',
    weight: 3
  },
  moderada: {
    label: 'Moderada', bg: '#FEF3C7', fg: '#92400E', accent: '#F59E0B',
    icon: 'M12 2v10 M12 16h.01 M20.7 16.6 15.2 6.4a3.6 3.6 0 0 0-6.4 0L3.3 16.6A3.6 3.6 0 0 0 6.5 22h11a3.6 3.6 0 0 0 3.2-5.4z',
    weight: 2
  },
  informativa: {
    label: 'Informativa', bg: '#DBEAFE', fg: '#1E40AF', accent: '#3B82F6',
    icon: 'M12 8v.01 M11 12h1v4 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
    weight: 1
  }
};

const CATEGORIES = {
  clinica: { label: 'Clínica', icon: 'M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1 M8 15v7 M8 22h-3a2 2 0 0 1-2-2 M20 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z' },
  datos: { label: 'Datos', icon: 'M5 3v18 M5 21h14 M5 12h14 M5 6h14' }
};

function buildAlertas(patients) {
  const alertas = [];
  patients.forEach((p) => {
    const severas = (p.allergies || []).filter((a) => (a.sev || '').toLowerCase() === 'severa');
    if (severas.length > 0) {
      alertas.push({
        id: `A-${p.id}-alergia-sev`,
        level: 'critica',
        title: `Alergia severa: ${severas.map((a) => a.name).join(', ')}`,
        detail: `${p.name} presenta ${severas.length} alergia${severas.length > 1 ? 's' : ''} severa${severas.length > 1 ? 's' : ''}. Verificar antes de cualquier prescripción.`,
        patient: p,
        category: 'clinica',
        action: 'Ver alergias'
      });
    }

    const moderadas = (p.allergies || []).filter((a) => (a.sev || '').toLowerCase() === 'moderada');
    if (moderadas.length > 0) {
      alertas.push({
        id: `A-${p.id}-alergia-mod`,
        level: 'moderada',
        title: 'Alergias moderadas registradas',
        detail: `${p.name} tiene ${moderadas.length} alergia${moderadas.length > 1 ? 's' : ''} moderada${moderadas.length > 1 ? 's' : ''}: ${moderadas.map((a) => a.name).join(', ')}.`,
        patient: p,
        category: 'clinica',
        action: 'Ver alergias'
      });
    }

    if (!p.bloodType || p.bloodType === 'Desconocido') {
      alertas.push({
        id: `A-${p.id}-sangre`,
        level: 'moderada',
        title: 'Tipo de sangre no registrado',
        detail: `${p.name} no tiene tipo de sangre en su ficha. Actualizar para emergencias.`,
        patient: p,
        category: 'datos',
        action: 'Completar ficha'
      });
    }

    if (!p.emergency || !p.emergency.nombre) {
      alertas.push({
        id: `A-${p.id}-emerg`,
        level: 'informativa',
        title: 'Sin contacto de emergencia',
        detail: `${p.name} no tiene contacto de emergencia registrado.`,
        patient: p,
        category: 'datos',
        action: 'Agregar contacto'
      });
    }

    if (!p.phone && !p.email) {
      alertas.push({
        id: `A-${p.id}-contacto`,
        level: 'informativa',
        title: 'Sin datos de contacto',
        detail: `${p.name} no tiene teléfono ni email registrado.`,
        patient: p,
        category: 'datos',
        action: 'Completar ficha'
      });
    }
  });

  return alertas.sort((a, b) => LEVELS[b.level].weight - LEVELS[a.level].weight);
}

export default function Alertas({ patients, onOpenPatient }) {
  const [filterLevel, setFilterLevel] = useState('todas');
  const [filterCat, setFilterCat] = useState('todas');
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('severidad');
  const [resolved, setResolved] = useState(() => new Set());

  const alertas = useMemo(() => buildAlertas(patients), [patients]);
  const activas = useMemo(() => alertas.filter((a) => !resolved.has(a.id)), [alertas, resolved]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = activas.filter((a) => {
      const matchQ = !s || a.title.toLowerCase().includes(s) || a.detail.toLowerCase().includes(s) || a.patient.name.toLowerCase().includes(s);
      const matchLvl = filterLevel === 'todas' || a.level === filterLevel;
      const matchCat = filterCat === 'todas' || a.category === filterCat;
      return matchQ && matchLvl && matchCat;
    });
    if (sortBy === 'paciente') out = [...out].sort((a, b) => a.patient.name.localeCompare(b.patient.name));
    return out;
  }, [activas, q, filterLevel, filterCat, sortBy]);

  const counts = useMemo(() => ({
    todas: activas.length,
    critica: activas.filter((a) => a.level === 'critica').length,
    moderada: activas.filter((a) => a.level === 'moderada').length,
    informativa: activas.filter((a) => a.level === 'informativa').length,
    clinica: activas.filter((a) => a.category === 'clinica').length,
    datos: activas.filter((a) => a.category === 'datos').length
  }), [activas]);

  const donutData = useMemo(() => [
    { label: 'Críticas', value: counts.critica },
    { label: 'Moderadas', value: counts.moderada },
    { label: 'Informativas', value: counts.informativa }
  ], [counts]);

  const donutColors = [LEVELS.critica.accent, LEVELS.moderada.accent, LEVELS.informativa.accent];

  const topRisk = useMemo(() => {
    const byPatient = {};
    activas.forEach((a) => {
      const pid = a.patient.id;
      if (!byPatient[pid]) byPatient[pid] = { patient: a.patient, score: 0, count: 0, levels: { critica: 0, moderada: 0, informativa: 0 } };
      byPatient[pid].score += LEVELS[a.level].weight;
      byPatient[pid].count += 1;
      byPatient[pid].levels[a.level] += 1;
    });
    return Object.values(byPatient).sort((a, b) => b.score - a.score).slice(0, 5);
  }, [activas]);

  const totalRisk = activas.reduce((s, a) => s + LEVELS[a.level].weight, 0);
  const riskLevel = totalRisk === 0 ? 'seguro' : totalRisk < 5 ? 'bajo' : totalRisk < 15 ? 'medio' : 'alto';
  const riskColors = {
    seguro: { bg: '#D1FAE5', fg: '#065F46', accent: '#10B981' },
    bajo: { bg: '#DBEAFE', fg: '#1E40AF', accent: '#3B82F6' },
    medio: { bg: '#FEF3C7', fg: '#92400E', accent: '#F59E0B' },
    alto: { bg: '#FEE2E2', fg: '#991B1B', accent: '#DC2626' }
  };
  const riskCfg = riskColors[riskLevel];

  const resolve = (id) => setResolved((prev) => { const n = new Set(prev); n.add(id); return n; });
  const clearResolved = () => setResolved(new Set());

  return (
    <div style={{ padding: '28px 34px' }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '18px',
          marginBottom: '22px'
        }}
      >
        <div style={{
          background: '#fff',
          border: '1px solid #EEF2F5',
          borderRadius: '18px',
          padding: '24px 26px',
          boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '26px',
          flexWrap: 'wrap'
        }}>
          <div style={{ minWidth: 220 }}>
            <DonutChart data={donutData} centerLabel="Alertas" colors={donutColors} size={180} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Estado general
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              background: riskCfg.bg, color: riskCfg.fg,
              padding: '8px 14px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 800, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '.4px'
            }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: riskCfg.accent, boxShadow: `0 0 0 4px ${riskCfg.accent}22` }} />
              Riesgo {riskLevel}
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '12px', lineHeight: 1.5 }}>
              {counts.todas === 0
                ? 'Todos los pacientes tienen sus datos completos y sin alergias severas registradas.'
                : `Hay ${counts.todas} alerta${counts.todas > 1 ? 's' : ''} activa${counts.todas > 1 ? 's' : ''} distribuida${counts.todas > 1 ? 's' : ''} en ${topRisk.length} paciente${topRisk.length > 1 ? 's' : ''}.`}
            </div>
            {resolved.size > 0 && (
              <button
                onClick={clearResolved}
                style={{
                  marginTop: '12px',
                  background: 'none', border: 'none',
                  color: '#0D7377', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', padding: 0
                }}
              >
                ↺ Restaurar {resolved.size} alerta{resolved.size > 1 ? 's' : ''} resuelta{resolved.size > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px'
        }}>
          <MetricTile label="Críticas" value={counts.critica} cfg={LEVELS.critica} delay={0.05} />
          <MetricTile label="Moderadas" value={counts.moderada} cfg={LEVELS.moderada} delay={0.1} />
          <MetricTile label="Informativas" value={counts.informativa} cfg={LEVELS.informativa} delay={0.15} />
          <MetricTile
            label="Clínicas"
            value={counts.clinica}
            cfg={{ bg: '#E0F2FE', fg: '#0C4A6E', accent: '#0EA5E9', icon: CATEGORIES.clinica.icon }}
            delay={0.2}
          />
        </div>
      </motion.div>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '18px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <FilterChip label="Todas" count={counts.todas} active={filterLevel === 'todas'} onClick={() => setFilterLevel('todas')} />
        {Object.entries(LEVELS).map(([key, cfg]) => (
          <FilterChip key={key} label={cfg.label} count={counts[key]} active={filterLevel === key} accent={cfg.accent} onClick={() => setFilterLevel(key)} />
        ))}
        <div style={{ width: '1px', height: '24px', background: '#E4EAEF' }} />
        <FilterChip label="Toda categoría" count={counts.todas} active={filterCat === 'todas'} onClick={() => setFilterCat('todas')} muted />
        {Object.entries(CATEGORIES).map(([key, cfg]) => (
          <FilterChip key={key} label={cfg.label} count={counts[key]} active={filterCat === key} accent="#334155" onClick={() => setFilterCat(key)} muted />
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 14px', border: '1.5px solid #E4EAEF', borderRadius: '11px',
              fontSize: '12.5px', background: '#fff', color: '#0A2540', fontWeight: 600,
              cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="severidad">Ordenar: Severidad</option>
            <option value="paciente">Ordenar: Paciente A-Z</option>
          </select>
          <input
            type="text"
            placeholder="Buscar alerta o paciente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              minWidth: '240px',
              padding: '10px 14px', border: '1.5px solid #E4EAEF', borderRadius: '11px',
              fontSize: '13px', outline: 'none', background: '#fff', color: '#0A2540'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)',
        gap: '18px',
        alignItems: 'flex-start'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 && (
            <div style={{
              background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
              padding: '50px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px'
            }}>
              {activas.length === 0 ? '✓ Sin alertas activas.' : 'Sin resultados con estos filtros.'}
            </div>
          )}

          <AnimatePresence initial={false}>
            {filtered.map((a, i) => {
              const lvl = LEVELS[a.level];
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.96 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -2, boxShadow: '0 12px 26px -10px rgba(10,37,64,0.18)' }}
                  style={{
                    background: '#fff',
                    border: `1px solid ${lvl.bg}`,
                    borderLeft: `4px solid ${lvl.accent}`,
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '11px',
                    background: lvl.bg, color: lvl.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
                      <path d={lvl.icon} />
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: lvl.bg, color: lvl.fg,
                        padding: '3px 9px', borderRadius: '6px',
                        fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px'
                      }}>
                        {lvl.label}
                      </span>
                      <span style={{
                        background: '#F1F5F8', color: '#475569',
                        padding: '3px 9px', borderRadius: '6px',
                        fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px'
                      }}>
                        {CATEGORIES[a.category].label}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A2540', marginBottom: '4px' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>
                      {a.detail}
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onOpenPatient?.(a.patient.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          padding: '7px 12px', border: 'none', borderRadius: '9px',
                          background: 'linear-gradient(90deg,#0D7377,#00C9A7)', color: '#fff',
                          fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 6px 14px -6px rgba(0,201,167,0.4)'
                        }}
                      >
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.25)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 800
                        }}>
                          {a.patient.initials}
                        </div>
                        {a.action}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); resolve(a.id); }}
                        style={{
                          padding: '7px 12px', border: '1.5px solid #E4EAEF', borderRadius: '9px',
                          background: '#fff', color: '#64748B',
                          fontSize: '11.5px', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        ✓ Marcar revisado
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: '#fff',
            border: '1px solid #EEF2F5',
            borderRadius: '16px',
            padding: '20px 22px',
            boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
            position: 'sticky',
            top: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'linear-gradient(135deg,#DC2626,#F97316)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
                <path d="M12 2L2 22h20L12 2z M12 9v6 M12 18h.01" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2540' }}>Pacientes en riesgo</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ordenados por score de severidad</div>
            </div>
          </div>

          {topRisk.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              Sin pacientes en riesgo.
            </div>
          )}

          {topRisk.map((r, i) => (
            <motion.button
              key={r.patient.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
              onClick={() => onOpenPatient?.(r.patient.id)}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '10px 4px',
                borderTop: i === 0 ? 'none' : '1px solid #F1F5F8',
                background: 'none', border: 'none', borderRadius: '0',
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              <div style={{
                width: '26px', height: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, color: '#94A3B8'
              }}>
                #{i + 1}
              </div>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: r.patient.avatarBg || '#0D7377', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '12.5px', flexShrink: 0
              }}>
                {r.patient.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.patient.name}
                </div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                  {r.levels.critica > 0 && <MiniDot color={LEVELS.critica.accent} count={r.levels.critica} />}
                  {r.levels.moderada > 0 && <MiniDot color={LEVELS.moderada.accent} count={r.levels.moderada} />}
                  {r.levels.informativa > 0 && <MiniDot color={LEVELS.informativa.accent} count={r.levels.informativa} />}
                </div>
              </div>
              <div style={{
                fontSize: '11px', fontWeight: 800,
                background: '#0A2540', color: '#fff',
                padding: '3px 9px', borderRadius: '7px'
              }}>
                {r.score}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, cfg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        background: '#fff',
        border: `1px solid ${cfg.bg}`,
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '78px'
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: cfg.bg, color: cfg.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path d={cfg.icon} />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#0A2540', lineHeight: 1.1, marginTop: '2px' }}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function MiniDot({ color, count }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      background: `${color}18`, color, padding: '1px 6px',
      borderRadius: '5px', fontSize: '10px', fontWeight: 800
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      {count}
    </span>
  );
}

function FilterChip({ label, count, active, accent, muted, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 13px',
        border: active ? 'none' : '1.5px solid #E4EAEF',
        borderRadius: '10px',
        background: active ? (accent || 'linear-gradient(90deg,#0D7377,#00C9A7)') : (muted ? '#F8FAFB' : '#fff'),
        color: active ? '#fff' : '#64748B',
        fontSize: '12px', fontWeight: 700, cursor: 'pointer',
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
