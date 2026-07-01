import { useState, useEffect } from 'react';
import { api } from '../api.js';

const emptyForm = {
  nombre: '', cedula: '', nacimiento: '', genero: 'Masculino',
  telefono: '', email: '', direccion: '',
  emerNombre: '', emerTel: '',
  sangre: 'Desconocido', alergias: '', antecedentes: '', seguro: ''
};

function parseAllergies(str) {
  if (!str || !str.trim()) return [];
  return str.split(',').map((s) => s.trim()).filter(Boolean).map((part) => {
    const m = part.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
    if (m) {
      const sev = m[2].trim().toLowerCase();
      return { name: m[1].trim(), sev: sev || 'moderada' };
    }
    return { name: part, sev: 'moderada' };
  });
}

const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(10,37,64,0.45)',
  backdropFilter: 'blur(3px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100, padding: '20px', animation: 'fadeIn .18s ease'
};

const modalStyle = {
  background: '#fff', borderRadius: '18px',
  width: '100%', maxWidth: '640px',
  maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 30px 60px -20px rgba(10,37,64,0.30)',
  animation: 'modalIn .22s ease'
};

function Field({ label, error, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: error ? '#DC2626' : '#475569', display: 'block', marginBottom: '5px' }}>
        {label}{error && ' *'}
      </span>
      {children}
    </label>
  );
}

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

export default function NewPatientModal({ open, onClose, onCreated, onToast }) {
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
    if (!form.nombre.trim()) errs.nombre = true;
    if (!form.cedula.trim()) errs.cedula = true;
    if (!form.nacimiento) errs.nacimiento = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const contacto_emergencia = (form.emerNombre.trim() && form.emerTel.trim())
      ? { nombre: form.emerNombre.trim(), telefono: form.emerTel.trim() }
      : null;

    const payload = {
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(),
      fecha_nacimiento: form.nacimiento,
      genero: form.genero,
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
      contacto_emergencia,
      tipo_sangre: form.sangre,
      alergias: parseAllergies(form.alergias),
      antecedentes: form.antecedentes || null,
      seguro: form.seguro || null
    };

    try {
      setSubmitting(true);
      await api.createPaciente(payload);
      onToast?.({ message: 'Paciente registrado con éxito', kind: 'success' });
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
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0A2540' }}>Nuevo paciente</div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94A3B8', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <Field label="Nombre completo" error={errors.nombre}>
            <input style={inputStyle(errors.nombre)} value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} />
          </Field>
          <Field label="Cédula" error={errors.cedula}>
            <input style={inputStyle(errors.cedula)} placeholder="8-888-8888" value={form.cedula} onChange={(e) => setField('cedula', e.target.value)} />
          </Field>
          <Field label="Fecha de nacimiento" error={errors.nacimiento}>
            <input type="date" style={inputStyle(errors.nacimiento)} value={form.nacimiento} onChange={(e) => setField('nacimiento', e.target.value)} />
          </Field>
          <Field label="Género">
            <select style={inputStyle(false)} value={form.genero} onChange={(e) => setField('genero', e.target.value)}>
              <option>Masculino</option><option>Femenino</option><option>Otro</option>
            </select>
          </Field>
          <Field label="Teléfono">
            <input style={inputStyle(false)} value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" style={inputStyle(false)} value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </Field>
          <Field label="Dirección">
            <input style={inputStyle(false)} value={form.direccion} onChange={(e) => setField('direccion', e.target.value)} />
          </Field>
          <Field label="Tipo de sangre">
            <select style={inputStyle(false)} value={form.sangre} onChange={(e) => setField('sangre', e.target.value)}>
              {['Desconocido','A+','A-','B+','B-','O+','O-','AB+','AB-'].map(x => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Contacto emergencia (nombre)">
            <input style={inputStyle(false)} value={form.emerNombre} onChange={(e) => setField('emerNombre', e.target.value)} />
          </Field>
          <Field label="Contacto emergencia (teléfono)">
            <input style={inputStyle(false)} value={form.emerTel} onChange={(e) => setField('emerTel', e.target.value)} />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Alergias (separadas por coma, opcional severidad entre paréntesis)">
              <input style={inputStyle(false)} placeholder="Penicilina (severa), Ibuprofeno (moderada)" value={form.alergias} onChange={(e) => setField('alergias', e.target.value)} />
            </Field>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Antecedentes / historial">
              <textarea rows={3} style={{ ...inputStyle(false), resize: 'vertical' }} value={form.antecedentes} onChange={(e) => setField('antecedentes', e.target.value)} />
            </Field>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Seguro médico">
              <input style={inputStyle(false)} value={form.seguro} onChange={(e) => setField('seguro', e.target.value)} />
            </Field>
          </div>
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
            {submitting ? 'Guardando…' : 'Registrar paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
