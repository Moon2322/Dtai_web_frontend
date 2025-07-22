import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header_profesor';
import styles from '../css/Dashboard_profesor.module.css';

const Dashboard_profesor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [datos, setDatos] = useState({
    profesor: null,
    estadisticas: {
      asignaturas_activas: 0,
      total_estudiantes: 0,
      calificaciones_pendientes: 0,
      solicitudes_ayuda: 0
    },
    asignaturas: [],
    estudiantes_recientes: [],
    calificaciones_pendientes: [],
    noticias: []
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación y rol
    const userData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.rol !== 'profesor') {
      navigate('/login');
      return;
    }

    cargarDatosProfesor();
  }, [navigate]);

  const cargarDatosProfesor = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar datos en paralelo para mejor rendimiento
      const [
        perfilRes,
        estadisticasRes,
        asignaturasRes,
        estudiantesRes,
        calificacionesRes,
        noticiasRes
      ] = await Promise.all([
        fetch('http://localhost:5000/api/profesor/perfil', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/estadisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/asignaturas', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/estudiantes-recientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/calificaciones-pendientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/noticias?limit=3', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Procesar respuestas
      const datosTemp = {
        profesor: null,
        estadisticas: {
          asignaturas_activas: 0,
          total_estudiantes: 0,
          calificaciones_pendientes: 0,
          solicitudes_ayuda: 0
        },
        asignaturas: [],
        estudiantes_recientes: [],
        calificaciones_pendientes: [],
        noticias: []
      };

      // Perfil del profesor
      if (perfilRes.ok) {
        const perfilData = await perfilRes.json();
        if (perfilData.success) {
          datosTemp.profesor = perfilData.data;
        }
      }

      // Estadísticas
      if (estadisticasRes.ok) {
        const estadisticasData = await estadisticasRes.json();
        if (estadisticasData.success) {
          datosTemp.estadisticas = estadisticasData.data;
        }
      }

      // Asignaturas del profesor
      if (asignaturasRes.ok) {
        const asignaturasData = await asignaturasRes.json();
        if (asignaturasData.success) {
          datosTemp.asignaturas = asignaturasData.data;
        }
      }

      // Estudiantes recientes
      if (estudiantesRes.ok) {
        const estudiantesData = await estudiantesRes.json();
        if (estudiantesData.success) {
          datosTemp.estudiantes_recientes = estudiantesData.data;
        }
      }

      // Calificaciones pendientes
      if (calificacionesRes.ok) {
        const calificacionesData = await calificacionesRes.json();
        if (calificacionesData.success) {
          datosTemp.calificaciones_pendientes = calificacionesData.data;
        }
      }

      // Noticias
      if (noticiasRes.ok) {
        const noticiasData = await noticiasRes.json();
        if (noticiasData.success) {
          datosTemp.noticias = noticiasData.data.filter(n => n.publicada).slice(0, 3);
        }
      }

      setDatos(datosTemp);
      
    } catch (error) {
      console.error('Error al cargar datos del profesor:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el saludo según la hora
  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };



  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={cargarDatosProfesor} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        
        {/* Sección de bienvenida personalizada */}
        <div className={styles.welcomeSection}>
          <h2>
            {obtenerSaludo()}, {datos.profesor?.nombre || 'Profesor'} {datos.profesor?.apellido || ''}
          </h2>
          <p className={styles.welcomeSubtitle}>
            {datos.profesor?.titulo_academico && `${datos.profesor.titulo_academico} - `}
            {datos.profesor?.especialidad || 'Especialidad no especificada'}
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <h3>Asignaturas Activas</h3>
              <div className={styles.statNumber}>{datos.estadisticas.asignaturas_activas}</div>
              <p>Cursos que impartes</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>Total Estudiantes</h3>
              <div className={styles.statNumber}>{datos.estadisticas.total_estudiantes}</div>
              <p>Estudiantes inscritos</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statContent}>
              <h3>Calificaciones Pendientes</h3>
              <div className={styles.statNumber}>{datos.estadisticas.calificaciones_pendientes}</div>
              <p>Por registrar</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🆘</div>
            <div className={styles.statContent}>
              <h3>Solicitudes de Ayuda</h3>
              <div className={styles.statNumber}>{datos.estadisticas.solicitudes_ayuda}</div>
              <p>Pendientes de respuesta</p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className={styles.quickActions}>
          <h3>Acciones Rápidas</h3>
          <div className={styles.actionsGrid}>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/profesor/Nueva_asignatura')}
            >
              <span>📚</span>
              Registrar Nueva Asignatura
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/profesor/Gestion_calificaiones')}
            >
              <span>📝</span>
              Gestionar Calificaciones
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/profesor/Administracion_estudiantes')}
            >
              <span>👥</span>
              Ver Estudiantes
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/profesor/Ayuda_alumno')}
            >
              <span>🆘</span>
              Centro de Ayuda
            </button>
          </div>
        </div>

        
        
      </main>
    </div>
  );
};

export default Dashboard_profesor;