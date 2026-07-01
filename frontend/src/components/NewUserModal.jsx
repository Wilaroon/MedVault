import { useState, useEffect } from 'react';
import { api } from '../api.js';

const emptyForm = { cedula: '', nombre: '', rol: 'medico', password: '' };

const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(10,37,64,0.45)',
  backdropFilter: 'blur(3px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100, padding: '20px', animation: 'fadeIn .18s ease'
};

const modalStyle = {
  background: '#fff', borderRadius: '18px',
  width: '100%', maxWidth: '440px',
  boxShadow: '0 30px 60px -20px rgba(10,37,64,0.30)',
  animation: 'modalIn .22s ease'
};

function inputStyle(error) {
  return {
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${error ? '#DC2626' : '#E4EAEF'}`,
    borderRadius: '10px',
    fontSize: '13.5px',
    outline: 'none',
    color: '#0A2540',
    background: '#F8FAFB'
  };
}

export default function NewUserModal({ open, onClose, onCreated, onToast }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setForm(emptyForm); setErrors({}); setSubmitting(false); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: false }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.cedula.trim()) errs.cedula = true;
    if (!form.nombre.trim() || form.nombre.trim().length < 2) errs.nombre = true;
    if (!form.password || form.password.length < 6) errs.password = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setSubmitting(true);
      const created = await api.createUsuario({
        cedula: form.cedula.trim(),
        nombre: form.nombre.trim(),
        rol: form.rol,
        password: form.password
      });
      onToast?.({ message: `Usuario ${created.nombre} creado`, kind: 'success' });
      onCreated?.();
      onClose();
    } catch (err) {
      onToast?.({ message: 'Error: ' + err.message, kind: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <form style={modalStyle} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0A2540' }}>Nuevo usuario</div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94A3B8', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            <span style={{ fontSize: '12px', fontWeight: 600, color: errors.cedula ? '#DC2626' : '#475569', display: 'block', marginBottom: '5px' }}>
              Cédula {errors.cedula && '*'}
            </span>
            <input style={inputStyle(errors.cedula)} placeholder="8-888-8888" value={form.cedula} onChange={(e) => setField('cedula', e.target.value)} />
          </label>

          <label>
            <span style={{ fontSize: '12px', fontWeight: 600, color: errors.nombre ? '#DC2626' : '#475569', display: 'block', marginBottom: '5px' }}>
              Nombre completo {errors.nombre && '*'}
            </span>
            <input style={inputStyle(errors.nombre)} placeholder="Dr. Juan Pérez" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} />
          </label>

          <label>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>
              Rol
            </span>
            <select style={{ ...inputStyle(false), cursor: 'pointer' }} value={form.rol} onChange={(e) => setField('rol', e.target.value)}>
              <option value="admin">Administrador</option>
              <option value="medico">Médico</option>
              <option value="enfermeria">Enfermería</option>
            </select>
          </label>

          <label>
            <span style={{ fontSize: '12px', fontWeight: 600, color: errors.password ? '#DC2626' : '#475569', display: 'block', marginBottom: '5px' }}>
              Contraseña (mínimo 6 caracteres) {errors.password && '*'}
            </span>
            <input type="password" style={inputStyle(errors.password)} placeholder="••••••••" value={form.password} onChange={(e) => setField('password', e.target.value)} />
          </label>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #EEF2F5', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{
            padding: '11px 20px', border: '1.5px solid #E4EAEF', borderRadius: '11px',
            background: '#fff', color: '#64748B', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
          }}>Cancelar</button>
          <button type="submit" disabled={submitting} style={{
            padding: '11px 22px', border: 'none', borderRadius: '11px',
            background: submitting ? '#94A3B8' : 'linear-gradient(90deg,#0D7377,#00C9A7)',
            color: '#fff', fontSize: '13.5px', fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 8px 20px -6px rgba(0,201,167,0.5)'
          }}>
            {submitting ? 'Creando…' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
