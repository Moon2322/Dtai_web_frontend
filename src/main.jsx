
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './views/Login.jsx';
import DashboardDirectivo from './views/DashboardDirectivo.jsx';
import GestionAsignaturas from './views/GestionAsignaturas.jsx';
import GestionProfesores from './views/GestionProfesores.jsx';
import HorariosIngenieria from './views/HorariosIngenieria.jsx';
import HorariosTSU from './views/HorariosTSU.jsx';
import EncuestaDetalle from './views/EncuestaDetalle.jsx';
import EncuestasVulnerables from './views/EncuestasVulnerables.jsx';
import CentroAyuda from './views/CentroAyuda.jsx';
import SolicitudDetalle from './views/SolicitudDetalle.jsx';
import GestionNoticias from './views/GestionNoticias.jsx';
import Reportes from './views/Reportes.jsx';
import ChatBot from './views/ChatBot.jsx';

import DashboardEstudiante from './views/DashboardEstudiante.jsx';
import CalificacionesEstudiante from './views/CalificacionesEstudiante.jsx';
import HorariosEstudiante from './views/HorariosEstudiante.jsx';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard-directivo" element={<DashboardDirectivo />} />
      <Route path="/asignaturas-directivo" element={<GestionAsignaturas />} />
      <Route path="/profesores-directivo" element={<GestionProfesores />} />
      <Route path="/horarios-ingenieria" element={<HorariosIngenieria />} />
      <Route path="/horarios-tsu" element={<HorariosTSU />} />
      <Route path="/encuestas-directivo" element={<EncuestasVulnerables />} />
      <Route path="/encuesta-detalle/:id" element={<EncuestaDetalle />} />
      <Route path="/centro-ayuda-directivo" element={<CentroAyuda />} />
      <Route path="/solicitud-ayuda/:id" element={<SolicitudDetalle />} />
      <Route path="/noticias-directivo" element={<GestionNoticias />} />
      <Route path="/reportes-directivo" element={<Reportes />} />
      <Route path="/chatbot-directivo" element={<ChatBot />} />

      <Route path="/dashboard-alumno" element={<DashboardEstudiante />} />
      <Route path="/calificaciones-estudiante" element={<CalificacionesEstudiante />} />
      <Route path="/horarios-estudiante" element={<HorariosEstudiante />} />

    </Routes>
  </Router>
);