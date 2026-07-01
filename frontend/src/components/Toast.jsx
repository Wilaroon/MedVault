export default function Toast({ message, kind = 'success' }) {
  if (!message) return null;
  const bg = kind === 'error'
    ? 'linear-gradient(90deg,#DC2626,#EF4444)'
    : 'linear-gradient(90deg,#0D7377,#00C9A7)';
  return (
    <div style={{
      position: 'fixed', right: '24px', bottom: '24px',
      background: bg, color: '#fff',
      padding: '13px 20px', borderRadius: '12px',
      boxShadow: '0 12px 28px -8px rgba(10,37,64,0.35)',
      fontSize: '13.5px', fontWeight: 600,
      animation: 'toastIn .25s ease',
      zIndex: 1000, maxWidth: '360px'
    }}>
      {message}
    </div>
  );
}
