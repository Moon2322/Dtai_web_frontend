import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './views/Login';

import Dashboard_profesor from './views/Dashboard_profesor';
import Admin_estudiantes_profesor from "./views/Admin_estudiantes_profesor";
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
import PerfilEstudiante from './views/PerfilEstudiante.jsx';
import CentroAyudaEstudiante from './views/CentroAyudaEstudiante.jsx';
import SolicitudAyudaDetalle from './views/SolicitudAyudaDetalle.jsx';
import ForoEstudiante from './views/ForoEstudiante.jsx';
import PostDetalle from './views/PostDetalle.jsx';
import NoticiasPublicas from './views/NoticiasPublicas.jsx';
import NoticiaDetallePublico from './views/NoticiaDetallePublico.jsx';
import Foroprofesor from './views/Foroprofesor.jsx';
import Gestioncalifaciones from './views/Gestioncalificaciones.jsx';
import Nueva_asignatura from './views/Nueva_asignatura.jsx';
import Ayuda_alumno from './views/Ayuda_alumno.jsx';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
  <Routes>
    <Route path="/" element={<NoticiasPublicas />} />
    <Route path="/noticias-publicas" element={<NoticiasPublicas />} />
    <Route path="/noticia-detalle/:id" element={<NoticiaDetallePublico />} />
    <Route path="/login" element={<Login />} />
    <Route path="/profesor/dashboard_profesor" element={<Dashboard_profesor />} />
    <Route path="/profesor/foro_profesor" element={<Foroprofesor />} />
    <Route path="/profesor/Administracion_estudiantes" element={<Admin_estudiantes_profesor />} />
    <Route path="/profesor/Gestion_calificaciones" element={<Gestioncalifaciones />} />
    <Route path="/profesor/Nueva_asignatura" element={<Nueva_asignatura />} />
    <Route path="/profesor/Ayuda_alumno" element={<Ayuda_alumno />} />


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
      <Route path="/Perfil-estudiante" element={<PerfilEstudiante />} />
      <Route path="/centro-ayuda-estudiante" element={<CentroAyudaEstudiante />} />
      <Route path="/solicitud-ayuda-detalle/:id" element={<SolicitudAyudaDetalle />} />
      <Route path="/foro-estudiante" element={<ForoEstudiante />} />
      <Route path="/foro-post/:id" element={<PostDetalle />} />
    </Routes>
  </Router>
);