import { motion } from 'framer-motion';

export default function AreaChart({ data, height = 200 }) {
  const width = 640;
  const padTop = 18;
  const padBottom = 30;
  const padLeft = 34;
  const padRight = 14;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0 || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
        Sin datos suficientes
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const points = data.map((d, i) => ({
    x: padLeft + i * stepX,
    y: padTop + chartH - (d.value / max) * chartH,
    d
  }));

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00C9A7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((f, i) => {
        const y = padTop + chartH * (1 - f);
        return (
          <g key={i}>
            <line x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke="#F1F5F8" strokeWidth="1" />
            <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#94A3B8" fontWeight="600">
              {Math.round(max * f)}
            </text>
          </g>
        );
      })}

      <motion.path
        d={areaPath}
        fill="url(#areaGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      />

      <motion.path
        d={linePath}
        fill="none"
        stroke="#0D7377"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {points.map((p, i) => (
        <g key={i}>
          <motion.circle
            cx={p.x} cy={p.y} r="4"
            fill="#fff" stroke="#0D7377" strokeWidth="2.2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 + i * 0.08, duration: 0.3 }}
          />
          <text
            x={p.x} y={height - 10}
            textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="600"
          >
            {p.d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
