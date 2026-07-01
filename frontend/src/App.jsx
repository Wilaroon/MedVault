import { useState, useEffect, useCallback, useRef } from 'react';
import { api, getToken, setToken } from './api.js';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import Pacientes from './components/Pacientes.jsx';
import PatientDetail from './components/PatientDetail.jsx';
import Consultas from './components/Consultas.jsx';
import Alertas from './components/Alertas.jsx';
import Auditoria from './components/Auditoria.jsx';
import Usuarios from './components/Usuarios.jsx';
import NewPatientModal from './components/NewPatientModal.jsx';
import Toast from './components/Toast.jsx';

const HEADERS = {
  dashboard: { title: 'Dashboard', subtitle: 'Vista general del sistema' },
  pacientes: { title: 'Pacientes', subtitle: 'Listado de historias clínicas' },
  consultas: { title: 'Consultas', subtitle: 'Consultas médicas' },
  alertas: { title: 'Alertas', subtitle: 'Alertas activas del sistema' },
  auditoria: { title: 'Auditoría', subtitle: 'Registro de accesos y cambios' },
  usuarios: { title: 'Usuarios', subtitle: 'Gestión de cuentas y permisos' },
  detail: { title: 'Detalle del paciente', subtitle: 'Historia clínica completa' }
};

const ADMIN_SCREENS = new Set(['consultas', 'alertas', 'auditoria', 'usuarios']);

export default function App() {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [screen, setScreen] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const showToast = useCallback(({ message, kind = 'success' }) => {
    setToast({ message, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listPacientes();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast({ message: 'No se pudieron cargar pacientes: ' + err.message, kind: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleLogout = useCallback(async () => {
    try { await api.logout(); } catch (e) { /* ignore */ }
    setToken(null);
    setUser(null);
    setScreen('dashboard');
    setPatients([]);
  }, []);

  // Restaurar sesión al montar
  useEffect(() => {
    (async () => {
      if (!getToken()) { setRestoring(false); return; }
      try {
        const me = await api.me();
        setUser(me);
      } catch {
        setToken(null);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  // Cerrar sesión si el backend responde 401
  useEffect(() => {
    const onUnauth = () => { setUser(null); setScreen('dashboard'); };
    window.addEventListener('medvault:unauthorized', onUnauth);
    return () => window.removeEventListener('medvault:unauthorized', onUnauth);
  }, []);

  useEffect(() => {
    if (user) loadPatients();
  }, [user, loadPatients]);

  // Si el usuario cambia de rol o el screen actual ya no es visible, resetear
  useEffect(() => {
    if (!user) return;
    if (user.rol !== 'admin' && ADMIN_SCREENS.has(screen)) {
      setScreen('dashboard');
    }
  }, [user, screen]);

  if (restoring) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94A3B8', fontSize: '13px'
      }}>
        Restaurando sesión…
      </div>
    );
  }

  if (!user) return <Login onLogin={setUser} />;

  const openPatient = (id) => { setSelectedId(id); setScreen('detail'); };
  const backToList = () => { setSelectedId(null); setScreen('pacientes'); };

  const headerInfo = HEADERS[screen] || HEADERS.dashboard;
  const selectedPatient = patients.find((p) => p.id === selectedId);
  const isAdmin = user.rol === 'admin';

  const newBtn = isAdmin && (screen === 'pacientes' || screen === 'dashboard') && (
    <button
      onClick={() => setModalOpen(true)}
      style={{
        padding: '10px 18px', border: 'none', borderRadius: '10px',
        background: 'linear-gradient(90deg,#0D7377,#00C9A7)', color: '#fff',
        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 8px 18px -6px rgba(0,201,167,0.5)'
      }}
    >
      + Nuevo paciente
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7F8' }}>
      <Sidebar screen={screen} onNavigate={setScreen} user={user} onLogout={handleLogout} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} action={newBtn} />

        {screen === 'dashboard' && <Dashboard patients={patients} />}
        {screen === 'pacientes' && (
          <Pacientes
            patients={patients}
            loading={loading}
            onOpenPatient={openPatient}
            onNewPatient={isAdmin ? () => setModalOpen(true) : null}
            onRefresh={loadPatients}
            canCreate={isAdmin}
          />
        )}
        {screen === 'detail' && <PatientDetail patient={selectedPatient} onBack={backToList} />}
        {screen === 'consultas' && isAdmin && <Consultas patients={patients} />}
        {screen === 'alertas' && isAdmin && <Alertas patients={patients} onOpenPatient={openPatient} />}
        {screen === 'auditoria' && isAdmin && <Auditoria patients={patients} />}
        {screen === 'usuarios' && isAdmin && <Usuarios currentUser={user} onToast={showToast} />}
      </main>

      {isAdmin && (
        <NewPatientModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={loadPatients}
          onToast={showToast}
        />
      )}

      <Toast message={toast?.message} kind={toast?.kind} />
    </div>
  );
}
