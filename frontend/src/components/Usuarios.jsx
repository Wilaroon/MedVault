import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import NewUserModal from './NewUserModal.jsx';

const ROL_CFG = {
  admin: { label: 'Administrador', bg: '#FEE2E2', fg: '#991B1B', accent: '#DC2626' },
  medico: { label: 'Médico', bg: '#D1FAE5', fg: '#065F46', accent: '#10B981' },
  enfermeria: { label: 'Enfermería', bg: '#DBEAFE', fg: '#1E40AF', accent: '#3B82F6' }
};

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function Usuarios({ currentUser, onToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      onToast?.({ message: 'Error cargando usuarios: ' + err.message, kind: 'error' });
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const toggleActivo = async (u) => {
    try {
      await api.updateUsuario(u.id, { activo: !u.activo });
      onToast?.({ message: `Usuario ${u.activo ? 'desactivado' : 'activado'}`, kind: 'success' });
      load();
    } catch (err) {
      onToast?.({ message: 'Error: ' + err.message, kind: 'error' });
    }
  };

  const counts = usuarios.reduce((acc, u) => {
    acc[u.rol] = (acc[u.rol] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    acc.activos = (acc.activos || 0) + (u.activo ? 1 : 0);
    return acc;
  }, {});

  return (
    <div style={{ padding: '28px 34px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <SummaryCard label="Total usuarios" value={counts.total || 0} accent="linear-gradient(135deg,#0A2540,#334155)" delay={0} />
        <SummaryCard label="Activos" value={counts.activos || 0} accent="linear-gradient(135deg,#0D7377,#00C9A7)" delay={0.05} />
        <SummaryCard label="Administradores" value={counts.admin || 0} accent={`linear-gradient(135deg,${ROL_CFG.admin.accent},#F97316)`} delay={0.1} />
        <SummaryCard label="Médicos + Enfermería" value={(counts.medico || 0) + (counts.enfermeria || 0)} accent={`linear-gradient(135deg,${ROL_CFG.medico.accent},${ROL_CFG.enfermeria.accent})`} delay={0.15} />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          {loading ? 'Cargando…' : `${usuarios.length} usuario${usuarios.length === 1 ? '' : 's'} registrado${usuarios.length === 1 ? '' : 's'}`}
        </div>
        <button
          onClick={load}
          style={{
            padding: '9px 13px', border: '1.5px solid #E4EAEF', borderRadius: '10px',
            background: '#fff', color: '#64748B', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          ⟳ Recargar
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            marginLeft: 'auto',
            padding: '10px 18px', border: 'none', borderRadius: '11px',
            background: 'linear-gradient(90deg,#0D7377,#00C9A7)', color: '#fff',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 18px -6px rgba(0,201,167,0.5)'
          }}
        >
          + Nuevo usuario
        </button>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #EEF2F5', borderRadius: '16px',
        overflow: 'hidden', boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 130px 140px 140px',
          gap: '14px', padding: '13px 20px',
          background: '#F8FAFB', borderBottom: '1px solid #EEF2F5',
          fontSize: '11px', fontWeight: 700, color: '#64748B',
          textTransform: 'uppercase', letterSpacing: '.5px'
        }}>
          <div>Usuario</div>
          <div>Cédula</div>
          <div>Rol</div>
          <div>Registrado</div>
          <div style={{ textAlign: 'right' }}>Estado</div>
        </div>

        {usuarios.length === 0 && !loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            No hay usuarios registrados.
          </div>
        )}

        {usuarios.map((u, i) => {
          const rol = ROL_CFG[u.rol] || { label: u.rol, bg: '#F1F5F8', fg: '#475569' };
          const isMe = currentUser?.id === u.id;
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 130px 140px 140px',
                gap: '14px', padding: '13px 20px',
                borderTop: i === 0 ? 'none' : '1px solid #F1F5F8',
                alignItems: 'center', opacity: u.activo ? 1 : 0.5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: rol.accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '12.5px', flexShrink: 0
                }}>
                  {u.nombre.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.nombre} {isMe && <span style={{ fontSize: '10.5px', color: '#0D7377', fontWeight: 700, marginLeft: '5px' }}>(tú)</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>ID #{u.id}</div>
                </div>
              </div>

              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '12.5px', color: '#475569' }}>
                {u.cedula}
              </div>

              <div>
                <span style={{
                  background: rol.bg, color: rol.fg,
                  padding: '4px 10px', borderRadius: '7px',
                  fontSize: '11.5px', fontWeight: 700
                }}>
                  {rol.label}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B' }}>{fmtDate(u.fecha_creacion)}</div>

              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => !isMe && toggleActivo(u)}
                  disabled={isMe}
                  title={isMe ? 'No puedes cambiar tu propio estado' : ''}
                  style={{
                    padding: '5px 11px', borderRadius: '7px',
                    border: 'none',
                    background: u.activo ? '#D1FAE5' : '#FEE2E2',
                    color: u.activo ? '#065F46' : '#991B1B',
                    fontSize: '11.5px', fontWeight: 700,
                    cursor: isMe ? 'not-allowed' : 'pointer',
                    opacity: isMe ? 0.6 : 1
                  }}
                >
                  {u.activo ? '● Activo' : '○ Inactivo'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <NewUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
        onToast={onToast}
      />
    </div>
  );
}

function SummaryCard({ label, value, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        background: '#fff',
        border: '1px solid #EEF2F5',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: '0 4px 14px -6px rgba(10,37,64,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div>
        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0A2540', marginTop: '2px' }}>
          {value}
        </div>
      </div>
      <div style={{
        width: '32px', height: '32px', borderRadius: '9px',
        background: accent
      }} />
    </motion.div>
  );
}
