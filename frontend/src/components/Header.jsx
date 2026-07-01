const wrap = {
  background: '#fff',
  borderBottom: '1px solid #E4EAEF',
  padding: '18px 34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

export default function Header({ title, subtitle, action }) {
  return (
    <header style={wrap}>
      <div>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-.4px', color: '#0A2540' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>{subtitle}</div>
        )}
      </div>
      {action}
    </header>
  );
}
