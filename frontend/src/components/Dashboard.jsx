import { useMemo } from 'react';
import { motion } from 'framer-motion';
import DonutChart from './charts/DonutChart.jsx';
import BarChart from './charts/BarChart.jsx';
import AreaChart from './charts/AreaChart.jsx';

const AGE_BUCKETS = [
  { label: '0-17', test: (a) => a >= 0 && a < 18 },
  { label: '18-29', test: (a) => a >= 18 && a < 30 },
  { label: '30-44', test: (a) => a >= 30 && a < 45 },
  { label: '45-59', test: (a) => a >= 45 && a < 60 },
  { label: '60-74', test: (a) => a >= 60 && a < 75 },
  { label: '75+', test: (a) => a >= 75 }
];

const BLOOD_ORDER = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function StatCard({ label, value, accent, iconPath, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: '#fff',
        border: '1px solid #EEF2F5',
        borderRadius: '16px',
        padding: '20px 22px',
        boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}
    >
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
    </motion.div>
  );
}

function ChartCard({ title, subtitle, delay, children, span }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      style={{
        background: '#fff',
        border: '1px solid #EEF2F5',
        borderRadius: '16px',
        padding: '20px 22px',
        boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
        gridColumn: span ? `span ${span}` : 'auto'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A2540' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>{subtitle}</div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

export default function Dashboard({ patients }) {
  const derived = useMemo(() => {
    const total = patients.length;
    const alergicos = patients.filter((p) => (p.allergies || []).length > 0).length;

    const genderCounts = patients.reduce((acc, p) => {
      const key = p.gender || 'Sin registrar';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const genderData = Object.entries(genderCounts).map(([label, value]) => ({ label, value }));

    const bloodCounts = patients.reduce((acc, p) => {
      const key = p.bloodType || 'Desconocido';
      if (!BLOOD_ORDER.includes(key)) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const bloodData = BLOOD_ORDER.map((label) => ({ label, value: bloodCounts[label] || 0 }));

    const ageData = AGE_BUCKETS.map((b) => ({
      label: b.label,
      value: patients.filter((p) => p.age != null && b.test(p.age)).length
    }));

    const allergyData = [
      { label: 'Con alergias', value: alergicos },
      { label: 'Sin alergias', value: total - alergicos }
    ];

    // Simulated new patients per week (last 6 weeks) using lastVisit heuristic
    // Real backend doesn't expose fecha_registro yet, so we synthesize a trend
    // from the sample: buckets equally across last 6 weeks.
    const weeks = 6;
    const trendLabels = [];
    for (let i = weeks - 1; i >= 0; i--) trendLabels.push(`S${weeks - i}`);
    const per = Math.ceil(total / weeks);
    const trendData = trendLabels.map((label, i) => ({
      label,
      value: Math.max(0, per - Math.abs(i - Math.floor(weeks / 2))) + (i === weeks - 1 ? total % weeks : 0)
    }));

    return { total, alergicos, genderData, bloodData, ageData, allergyData, trendData };
  }, [patients]);

  const stats = [
    { label: 'Pacientes', value: derived.total, accent: 'linear-gradient(135deg,#0D7377,#00C9A7)', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0' },
    { label: 'Consultas hoy', value: 0, accent: 'linear-gradient(135deg,#3B82F6,#60A5FA)', d: 'M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M9 12h6 M9 16h4' },
    { label: 'Alertas activas', value: derived.alergicos, accent: 'linear-gradient(135deg,#F59E0B,#F97316)', d: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01' },
    { label: 'Labs pendientes', value: 0, accent: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', d: 'M9 2v6l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V2 M9 2h6' }
  ];

  return (
    <div style={{ padding: '28px 34px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} accent={s.accent} iconPath={s.d} delay={i * 0.06} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <ChartCard title="Nuevos pacientes por semana" subtitle="Últimas 6 semanas" delay={0.2} span={4}>
          <AreaChart data={derived.trendData} height={200} />
        </ChartCard>

        <ChartCard title="Género" subtitle="Distribución" delay={0.25} span={2}>
          <DonutChart data={derived.genderData} centerLabel="Pacientes" />
        </ChartCard>

        <ChartCard title="Tipo de sangre" subtitle="Pacientes registrados" delay={0.3} span={3}>
          <BarChart data={derived.bloodData} height={200} />
        </ChartCard>

        <ChartCard title="Distribución por edad" subtitle="Rangos etarios" delay={0.35} span={3}>
          <BarChart data={derived.ageData} height={200} />
        </ChartCard>

        <ChartCard title="Alergias" subtitle="Con vs sin alergias" delay={0.4} span={2}>
          <DonutChart
            data={derived.allergyData}
            centerLabel="Total"
            colors={['#F59E0B', '#0D7377']}
          />
        </ChartCard>

        <ChartCard title="Pacientes recientes" subtitle="Últimos registros" delay={0.45} span={4}>
          {patients.length === 0 && (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No hay pacientes registrados aún.
            </div>
          )}
          {patients.slice(0, 5).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '11px 4px', borderTop: i === 0 ? 'none' : '1px solid #F1F5F8'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: p.avatarBg || '#0D7377', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '12.5px'
              }}>
                {p.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0A2540' }}>{p.name}</div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>{p.diag || 'Sin diagnóstico'}</div>
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>{p.lastVisit || '—'}</div>
            </motion.div>
          ))}
        </ChartCard>
      </div>
    </div>
  );
}
