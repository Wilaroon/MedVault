import { motion } from 'framer-motion';

export default function BarChart({ data, height = 180, valueColor = '#0A2540' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = Math.max(280, data.length * 60);
  const padTop = 24;
  const padBottom = 28;
  const padLeft = 8;
  const padRight = 8;
  const chartH = height - padTop - padBottom;
  const bw = (width - padLeft - padRight) / data.length;
  const barW = Math.min(46, bw * 0.62);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px' }}>
        Sin datos suficientes
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C9A7" />
          <stop offset="100%" stopColor="#0D7377" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line
          key={i}
          x1={padLeft} x2={width - padRight}
          y1={padTop + chartH * (1 - f)} y2={padTop + chartH * (1 - f)}
          stroke="#F1F5F8" strokeWidth="1"
        />
      ))}

      {data.map((d, i) => {
        const h = (d.value / max) * chartH;
        const x = padLeft + i * bw + (bw - barW) / 2;
        const y = padTop + chartH - h;
        return (
          <g key={i}>
            <motion.rect
              x={x}
              width={barW}
              rx="6"
              fill="url(#barGrad)"
              initial={{ y: padTop + chartH, height: 0 }}
              animate={{ y, height: h }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <title>{d.label}: {d.value}</title>
            </motion.rect>
            {d.value > 0 && (
              <motion.text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle" fontSize="11" fontWeight="700" fill={valueColor}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              >
                {d.value}
              </motion.text>
            )}
            <text
              x={padLeft + i * bw + bw / 2}
              y={height - 10}
              textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="600"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
