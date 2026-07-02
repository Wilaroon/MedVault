import { motion } from 'framer-motion';

const DEFAULT_COLORS = ['#0D7377', '#00C9A7', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#94A3B8'];

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({ data, size = 180, thickness = 22, colors = DEFAULT_COLORS, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF2F5" strokeWidth={thickness} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="13" fill="#94A3B8" fontWeight="600">
            Sin datos
          </text>
        </svg>
        <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>—</div>
      </div>
    );
  }

  let acc = 0;
  const arcs = data.map((d, i) => {
    const startAngle = (acc / total) * 360;
    acc += d.value;
    const endAngle = (acc / total) * 360;
    return { d, i, startAngle, endAngle, color: colors[i % colors.length] };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F8" strokeWidth={thickness} />
        {arcs.map(({ d, i, startAngle, endAngle, color }) => {
          const isFull = endAngle - startAngle >= 359.9;
          if (isFull) {
            return (
              <motion.circle
                key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke={color} strokeWidth={thickness}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            );
          }
          const arcLen = ((endAngle - startAngle) / 360) * circumference;
          return (
            <motion.path
              key={i}
              d={describeArc(cx, cy, r, startAngle, endAngle)}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${arcLen}` }}
              animate={{ strokeDasharray: `${arcLen} 0` }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
            />
          );
        })}
        <motion.text
          x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="central"
          fontSize="22" fontWeight="800" fill="#0A2540"
          initial={{ opacity: 0, y: cy - 2 }}
          animate={{ opacity: 1, y: cy - 6 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {total}
        </motion.text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#94A3B8" fontWeight="600">
          {centerLabel || 'Total'}
        </text>
      </svg>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px', minWidth: '120px' }}>
        {arcs.map(({ d, i, color }) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color }} />
            <span style={{ color: '#475569', flex: 1 }}>{d.label}</span>
            <span style={{ color: '#0A2540', fontWeight: 700 }}>{d.value}</span>
            <span style={{ color: '#94A3B8', fontSize: '11px' }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
