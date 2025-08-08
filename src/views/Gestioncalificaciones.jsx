import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Gestioncalificaciones.module.css';
import Header from '../components/header_profesor';

const GestionCalificaciones = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [calificaciones, setCalificaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_calificaciones: 0,
    promedio_general: 0,
    aprobados: 0,
    reprobados: 0,
    cursando: 0,
    ultimas_oportunidades_usadas: 0
  });
  const [asignacionesProfesor, setAsignacionesProfesor] = useState([]);
  const [estudiantesDelGrupo, setEstudiantesDelGrupo] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalTipo, setModalTipo] = useState(''); // 'nuevo' | 'evaluar' | 'detalle'
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
  const [evaluacionesDelAlumno, setEvaluacionesDelAlumno] = useState([]);
  const [parcialesDisponibles, setParcialesDisponibles] = useState([]);

  
  // Estados para sistema de escalera
  const [siguienteOportunidad, setSiguienteOportunidad] = useState(null);
  const [puedeEvaluar, setPuedeEvaluar] = useState(true);
  const [motivoOportunidad, setMotivoOportunidad] = useState('');
  const [estadoParcial, setEstadoParcial] = useState('');
  
  // Estado del formulario
  const [formulario, setFormulario] = useState({
    asignacion_id: '',
    alumno_id: '',
    asignatura_id: '',
    grupo_id: '',
    calificacion_id: null,
    numero_parcial: 1,
    oportunidad: 'ordinario',
    calificacion: '',
    observaciones_parcial: ''
  });

  useEffect(() => {
    // Verificar autenticación
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

    cargarDatos();
  }, [navigate]);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarCalificaciones(),
        cargarEstadisticas(),
        cargarAsignacionesProfesor()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCalificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gestion-calificaciones/calificaciones', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('📊 Datos recibidos:', data.data);
        setCalificaciones(data.data);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/gestion-calificaciones/estadisticas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const obtenerEstadoParciales = async (alumnoId, asignaturaId, grupoId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:5000/api/gestion-calificaciones/estudiante/${alumnoId}/estado-parciales/${asignaturaId}/${grupoId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener estado de parciales:', error);
    return null;
  }
};

  const cargarAsignacionesProfesor = async () => {
    try {
      const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/profesor/mis-asignaturas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setAsignacionesProfesor(data.data);
      }
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
    }
  };

  const cargarEstudiantesDelGrupo = async (asignaturaId, grupoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/profesor/calificaciones/estudiantes/${grupoId}/${asignaturaId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const data = await response.json();
      if (data.success) {
        setEstudiantesDelGrupo(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  const cargarDetalleCalificacion = async (calificacionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/profesor/calificaciones/${calificacionId}/detalle`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const data = await response.json();
      if (data.success) {
        setCalificacionSeleccionada(data.data.calificacion);
        setEvaluacionesDelAlumno(data.data.evaluaciones);
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  };

  // ============================================
  // FUNCIONES DEL SISTEMA DE ESCALERA
  // ============================================

  const obtenerSiguienteOportunidad = async (calificacionId, numeroParcial) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/profesor/calificaciones/${calificacionId}/siguiente-oportunidad/${numeroParcial}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        console.log(`🎯 Siguiente oportunidad para parcial ${numeroParcial}:`, data.data);
        return data.data;
      } else {
        console.error('❌ Error al obtener siguiente oportunidad:', data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error en obtenerSiguienteOportunidad:', error);
      return null;
    }
  };

  // ============================================
  // FUNCIONES DE MODAL
  // ============================================

  const abrirModalNuevo = () => {
    setFormulario({
      asignacion_id: '',
      alumno_id: '',
      asignatura_id: '',
      grupo_id: '',
      calificacion_id: null,
      numero_parcial: 1,
      oportunidad: 'ordinario',
      calificacion: '',
      observaciones_parcial: ''
    });
    setAsignacionSeleccionada(null);
    setEstudiantesDelGrupo([]);
    setModalTipo('nuevo');
    setMostrarModal(true);
  };

const abrirModalEvaluar = async (calificacion, parcial) => {
  console.log(`🎯 Abriendo modal para evaluar parcial ${parcial}`, calificacion);
  
  // Obtener el estado de todos los parciales del estudiante
  const estadoParciales = await obtenerEstadoParciales(
    calificacion.alumno_id, 
    calificacion.asignatura_id, 
    calificacion.grupo_id
  );
  
  if (!estadoParciales) {
    alert('❌ Error al obtener información del estudiante');
    return;
  }

  const infoParcial = estadoParciales.parciales[parcial];
  
  if (infoParcial.estado === 'bloqueado') {
    alert('⚠️ Este parcial está bloqueado. Debes aprobar el parcial anterior primero.');
    return;
  }
  
  if (infoParcial.estado === 'aprobado') {
    alert(`✅ Este parcial ya está aprobado con ${infoParcial.calificacion_actual} en ${infoParcial.oportunidad_aprobada}`);
    return;
  }
  
  if (infoParcial.estado === 'reprobado_final') {
    alert(`❌ Este parcial está reprobado final con ${infoParcial.calificacion_final}. No hay más oportunidades.`);
    return;
  }

  // Configurar estados para el modal
  setSiguienteOportunidad(infoParcial.siguiente_oportunidad);
  setPuedeEvaluar(true);
  
  let motivo = '';
  if (infoParcial.oportunidad_anterior) {
    motivo = `Reprobó en ${infoParcial.oportunidad_anterior} (${infoParcial.calificacion_anterior}), puede tomar ${infoParcial.siguiente_oportunidad}`;
  } else {
    motivo = `Primera evaluación del parcial ${parcial}`;
  }
  
  setMotivoOportunidad(motivo);
  setEstadoParcial('disponible');

  // Configurar formulario
  setFormulario({
    calificacion_id: estadoParciales.calificacion_id,
    alumno_id: estadoParciales.calificacion_id ? null : calificacion.alumno_id,
    asignatura_id: estadoParciales.calificacion_id ? null : calificacion.asignatura_id,
    grupo_id: estadoParciales.calificacion_id ? null : calificacion.grupo_id,
    numero_parcial: parcial,
    oportunidad: infoParcial.siguiente_oportunidad,
    calificacion: '',
    observaciones_parcial: ''
  });

  setCalificacionSeleccionada(calificacion);
  setModalTipo(estadoParciales.calificacion_id ? 'evaluar' : 'nuevo');
  setMostrarModal(true);
};

  const abrirModalDetalle = async (calificacion) => {
    await cargarDetalleCalificacion(calificacion.id);
    setModalTipo('detalle');
    setMostrarModal(true);
  };

const cerrarModal = () => {
  setMostrarModal(false);
  setModalTipo('');
  setCalificacionSeleccionada(null);
  setAsignacionSeleccionada(null);
  setEvaluacionesDelAlumno([]);
  setParcialesDisponibles([]); // ✅ Limpiar parciales disponibles
  setSiguienteOportunidad(null);
  setPuedeEvaluar(true);
  setMotivoOportunidad('');
  setEstadoParcial('');
  setFormulario({
    asignacion_id: '',
    alumno_id: '',
    asignatura_id: '',
    grupo_id: '',
    calificacion_id: null,
    numero_parcial: 1,
    oportunidad: 'ordinario',
    calificacion: '',
    observaciones_parcial: ''
  });
};

  // ============================================
  // FUNCIONES DE NEGOCIO
  // ============================================

  const manejarCambioAsignacion = async (asignacionId) => {
    if (!asignacionId) {
      setAsignacionSeleccionada(null);
      setEstudiantesDelGrupo([]);
      return;
    }

    const asignacion = asignacionesProfesor.find(a => a.id.toString() === asignacionId);
    setAsignacionSeleccionada(asignacion);

    await cargarEstudiantesDelGrupo(asignacion.asignatura_id, asignacion.grupo_id);
    
    setFormulario(prev => ({
      ...prev,
      asignacion_id: asignacionId,
      alumno_id: '',
      asignatura_id: asignacion.asignatura_id,
      grupo_id: asignacion.grupo_id
    }));
  };

  const manejarCambioEstudiante = async (alumnoId) => {
  if (!alumnoId || !asignacionSeleccionada) {
    setParcialesDisponibles([]);
    setFormulario(prev => ({
      ...prev,
      alumno_id: '',
      numero_parcial: 1
    }));
    return;
  }

  // Cargar estado de parciales del estudiante seleccionado
  const estadoParciales = await obtenerEstadoParciales(
    alumnoId,
    asignacionSeleccionada.asignatura_id,
    asignacionSeleccionada.grupo_id
  );

  if (estadoParciales) {
    // Filtrar solo los parciales disponibles
    const disponibles = [];
    for (let parcial = 1; parcial <= 3; parcial++) {
      const info = estadoParciales.parciales[parcial];
      if (info.estado === 'disponible') {
        disponibles.push({
          numero: parcial,
          siguiente_oportunidad: info.siguiente_oportunidad,
          motivo: info.oportunidad_anterior 
            ? `${info.oportunidad_anterior} (${info.calificacion_anterior}) → ${info.siguiente_oportunidad}`
            : `Primera evaluación → ${info.siguiente_oportunidad}`
        });
      }
    }
    
    setParcialesDisponibles(disponibles);
    
    // Auto-seleccionar el primer parcial disponible
    if (disponibles.length > 0) {
      setFormulario(prev => ({
        ...prev,
        alumno_id: alumnoId,
        numero_parcial: disponibles[0].numero,
        oportunidad: disponibles[0].siguiente_oportunidad
      }));
    }
  } else {
    setParcialesDisponibles([]);
  }
};
  const evaluarParcial = async () => {
    try {
      if (!formulario.calificacion.trim()) {
        alert('⚠️ La calificación es obligatoria');
        return;
      }

      const token = localStorage.getItem('token');

      // CASO 1: NUEVA EVALUACIÓN (sin calificacion_id)
      if (modalTipo === 'nuevo' || !formulario.calificacion_id) {
        console.log('🆕 Creando nueva calificación + evaluación');
        
        // Primero inicializar la calificación
const initResponse = await fetch('http://localhost:5000/api/gestion-calificaciones/inicializar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            alumno_id: formulario.alumno_id,
            asignatura_id: formulario.asignatura_id,
            grupo_id: formulario.grupo_id
          })
        });

        const initData = await initResponse.json();
        if (!initData.success) {
          alert('❌ Error al inicializar: ' + initData.message);
          return;
        }

        console.log('✅ Calificación inicializada:', initData.calificacion_id);

        // Luego evaluar el parcial con el ID obtenido
        const evalResponse = await fetch(
  `http://localhost:5000/api/gestion-calificaciones/${initData.calificacion_id}/evaluar-parcial`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              numero_parcial: formulario.numero_parcial,
              oportunidad: formulario.oportunidad,
              calificacion: formulario.calificacion,
              observaciones_parcial: formulario.observaciones_parcial
            })
          }
        );

        const evalData = await evalResponse.json();
        if (evalData.success) {
          alert('✅ ' + evalData.message);
          cerrarModal();
          await cargarDatos();
        } else {
          alert('❌ ' + evalData.message);
        }
        return;
      }

      // CASO 2: EVALUACIÓN EXISTENTE (con calificacion_id)
      console.log('🔄 Evaluando parcial existente');

      // Validación previa: Verificar que aún puede evaluar
      const infoOportunidad = await obtenerSiguienteOportunidad(formulario.calificacion_id, formulario.numero_parcial);
      
      if (!infoOportunidad || !infoOportunidad.puede_evaluar) {
        alert(`❌ Ya no se puede evaluar: ${infoOportunidad?.motivo || 'Estado inválido'}`);
        return;
      }

      if (infoOportunidad.siguiente_oportunidad !== formulario.oportunidad) {
        alert(`❌ Error de sincronización. Debe evaluar en ${infoOportunidad.siguiente_oportunidad}, no en ${formulario.oportunidad}`);
        return;
      }

      // Proceder con la evaluación
      const response = await fetch(
  `http://localhost:5000/api/gestion-calificaciones/${formulario.calificacion_id}/evaluar-parcial`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            numero_parcial: formulario.numero_parcial,
            oportunidad: formulario.oportunidad,
            calificacion: formulario.calificacion,
            observaciones_parcial: formulario.observaciones_parcial
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert('✅ ' + data.message);
        cerrarModal();
        await cargarDatos();
      } else {
        alert('❌ ' + data.message);
      }

    } catch (error) {
      console.error('Error al evaluar parcial:', error);
      alert('❌ Error de conexión. Inténtalo de nuevo.');
    }
  };

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================

  const obtenerColorCalificacion = (calificacion) => {
    if (calificacion === 'NA') return 'reprobado';
    if (calificacion === null || calificacion === '') return 'cursando';
    
    // Solo 8+ es aprobado
    const nota = parseFloat(calificacion);
    if (nota >= 8) return 'aprobado';
    return 'reprobado';
  };

  const obtenerTextoOportunidad = (oportunidad) => {
    const textos = {
      'ordinario': '📘 Evaluación Ordinaria',
      'remedial': '📙 Evaluación Remedial', 
      'extraordinario': '📕 Evaluación Extraordinaria',
      'ultima_oportunidad': '🚨 Última Oportunidad (⚠️ Única en toda la carrera)'
    };
    return textos[oportunidad] || oportunidad;
  };

  const obtenerColorEstadoParcial = (estado) => {
    const colores = {
      'pendiente': '#6b7280',
      'remedial_pendiente': '#f59e0b', 
      'extraordinario_pendiente': '#ef4444',
      'ultima_oportunidad_disponible': '#dc2626',
      'aprobado': '#10b981',
      'reprobado_final': '#991b1b',
      'baja_definitiva': '#7f1d1d'
    };
    return colores[estado] || '#6b7280';
  };

  const obtenerIconoOportunidad = (oportunidad) => {
    switch (oportunidad) {
      case 'ordinario': return '📘';
      case 'remedial': return '📙';
      case 'extraordinario': return '📕';
      case 'ultima_oportunidad': return '🚨';
      default: return '📖';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const mostrarParciales = (calificacion) => {
    console.log('🔍 Datos de parciales:', {
      detalle_parciales: calificacion.detalle_parciales,
      tipo: typeof calificacion.detalle_parciales,
      es_null: calificacion.detalle_parciales === null
    });

    if (calificacion.detalle_parciales && calificacion.detalle_parciales !== null) {
      try {
        const parciales = typeof calificacion.detalle_parciales === 'string' 
          ? JSON.parse(calificacion.detalle_parciales) 
          : calificacion.detalle_parciales;
        
        if (Array.isArray(parciales) && parciales.length > 0) {
          return parciales.map(parcial => (
            <div key={parcial.numero_parcial} className={styles.parcialBadge}>
              {obtenerIconoOportunidad(parcial.oportunidad)} P{parcial.numero_parcial}: {parcial.calificacion}
            </div>
          ));
        }
      } catch (error) {
        console.error('❌ Error al parsear detalle_parciales:', error);
      }
    }
    
    return <span className={styles.sinParciales}>Sin evaluaciones</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Cargando calificaciones...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.content}>
        {/* Encabezado */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión de Calificaciones</h1>
          <p className={styles.subtitle}>Sistema de evaluación por parciales y oportunidades</p>
        </div>

        {/* Estadísticas */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statContent}>
              <h3>Total Calificaciones</h3>
              <p>{estadisticas.total_calificaciones}</p>
            </div>
            <div className={styles.statIcon}>📊</div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statAprobados}`}>
            <div className={styles.statContent}>
              <h3>Aprobados</h3>
              <p>{estadisticas.aprobados}</p>
            </div>
            <div className={styles.statIcon}>✅</div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statReprobados}`}>
            <div className={styles.statContent}>
              <h3>Reprobados</h3>
              <p>{estadisticas.reprobados}</p>
            </div>
            <div className={styles.statIcon}>❌</div>
          </div>
          
          <div className={`${styles.statCard} ${styles.statPromedio}`}>
            <div className={styles.statContent}>
              <h3>Promedio General</h3>
              <p>{estadisticas.promedio_general}</p>
            </div>
            <div className={styles.statIcon}>📈</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actionsBar}>
          <button onClick={abrirModalNuevo} className={styles.btnPrimary}>
            ➕ Nueva Evaluación
          </button>
          
        </div>

        {/* Tabla de calificaciones */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Estudiante</th>
                <th>Asignatura</th>
                <th>Grupo</th>
                <th>Parciales</th>
                <th>Calificación Final</th>
                <th>Estado</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {calificaciones.map(calificacion => (
                <tr key={calificacion.id}>
                  <td>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentName}>
                        {calificacion.estudiante_nombre}
                      </div>
                      <div className={styles.studentGroup}>
                        {calificacion.estudiante_matricula}
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <div className={styles.cellText}>
                      <strong>{calificacion.asignatura_nombre}</strong>
                      <br />
                      <small>{calificacion.asignatura_codigo}</small>
                    </div>
                  </td>
                  
                  <td>
                    <div className={styles.cellText}>
                      {calificacion.grupo_codigo}
                      <br />
                      <small>{calificacion.carrera_nombre}</small>
                    </div>
                  </td>
                  
                  <td>
                    <div className={styles.parcialesContainer}>
                      {mostrarParciales(calificacion)}
                      <div className={styles.parcialesAcciones}>
                        {[1, 2, 3].map(parcial => (
                          <button
                            key={parcial}
                            onClick={() => abrirModalEvaluar(calificacion, parcial)}
                            className={styles.btnEvaluarParcial}
                            title={`Evaluar Parcial ${parcial}`}
                          >
                            P{parcial}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`${styles.calificacionFinal} ${styles[obtenerColorCalificacion(calificacion.calificacion_final)]}`}>
                      {calificacion.calificacion_final || 'Pendiente'}
                    </span>
                  </td>
                  
                  <td>
                    <span className={`${styles.estatusBadge} ${styles[`estatus${calificacion.estatus}`]}`}>
                      {calificacion.estatus}
                    </span>
                  </td>
                  
                  <td>
                    <span className={styles.cellText}>
                      {formatearFecha(calificacion.fecha_actualizacion)}
                    </span>
                  </td>
                  
                  <td>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => abrirModalDetalle(calificacion)}
                        className={`${styles.actionButton} ${styles.detailButton}`}
                        title="Ver detalle"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {calificaciones.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay calificaciones registradas</p>
              <button onClick={abrirModalNuevo} className={styles.emptyStateButton}>
                Crear primera evaluación
              </button>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* MODALES */}
        {/* ============================================ */}

        {mostrarModal && (
          <div className={styles.modalOverlay} onClick={cerrarModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              
{/* Modal: Nueva Evaluación - VERSIÓN SIMPLE */}
{modalTipo === 'nuevo' && (
  <div className={styles.modalOverlay} onClick={cerrarModal}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      
      {/* Header simple */}
      <div className={styles.headerSimple}>
        <h3 className={styles.tituloSimple}>
          📝 Nueva Evaluación
        </h3>
        <button className={styles.closeButton} onClick={cerrarModal}>✕</button>
      </div>
      
      <div className={styles.bodySimple}>
        {/* Indicador de pasos simple */}
        <div className={styles.pasosSimples}>
          <div className={`${styles.pasoSimple} ${!formulario.asignacion_id ? styles.activo : styles.completado}`}>
            📚 Asignación
          </div>
          <div className={`${styles.pasoSimple} ${formulario.asignacion_id && !formulario.alumno_id ? styles.activo : formulario.alumno_id ? styles.completado : ''}`}>
            👨‍🎓 Estudiante
          </div>
          <div className={`${styles.pasoSimple} ${formulario.alumno_id && parcialesDisponibles.length > 0 ? styles.completado : ''}`}>
            📊 Listo
          </div>
        </div>

        {/* Formulario */}
        <div className={styles.grupoSimple}>
          <label className={`${styles.labelSimple} ${styles.requerido}`}>
            Asignación
          </label>
          <select
            value={formulario.asignacion_id}
            onChange={(e) => manejarCambioAsignacion(e.target.value)}
            required
            className={styles.selectSimple}
          >
            <option value="">Seleccionar materia y grupo</option>
            {asignacionesProfesor.map(asignacion => (
              <option key={asignacion.id} value={asignacion.id}>
                {asignacion.asignatura_nombre} - {asignacion.grupo_codigo} ({asignacion.carrera_nombre})
              </option>
            ))}
          </select>
        </div>

        {asignacionSeleccionada && (
          <div className={styles.grupoSimple}>
            <label className={`${styles.labelSimple} ${styles.requerido}`}>
              Estudiante
            </label>
            <select
              value={formulario.alumno_id}
              onChange={(e) => manejarCambioEstudiante(e.target.value)}
              required
              className={styles.selectSimple}
            >
              <option value="">Seleccionar estudiante</option>
              {estudiantesDelGrupo.map(estudiante => (
                <option key={estudiante.alumno_id} value={estudiante.alumno_id}>
                  {estudiante.estudiante} ({estudiante.matricula})
                </option>
              ))}
            </select>
            <small className={styles.ayudaSimple}>
              {estudiantesDelGrupo.length} estudiantes en este grupo
            </small>
          </div>
        )}

        {/* Info del parcial disponible */}
        {formulario.alumno_id && parcialesDisponibles.length > 0 && (
          <>
            <div className={styles.infoParcialSimple}>
              <div className={styles.tituloParcialSimple}>
                🎯 Parcial a Evaluar
              </div>
              <div className={styles.motivoParcialSimple}>
                Parcial {parcialesDisponibles[0].numero} - {parcialesDisponibles[0].motivo}
              </div>
            </div>

            <div className={styles.grupoSimple}>
              <label className={styles.labelSimple}>
                Tipo de Evaluación
              </label>
              <input
                type="text"
                value={obtenerTextoOportunidad(formulario.oportunidad)}
                readOnly
                className={`${styles.inputSimple} ${styles.inputReadonly}`}
              />
            </div>

            <div className={styles.grupoSimple}>
              <label className={`${styles.labelSimple} ${styles.requerido}`}>
                Calificación
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <select
                    value={formulario.calificacion === 'NA' ? '' : formulario.calificacion}
                    onChange={(e) => setFormulario({...formulario, calificacion: e.target.value})}
                    required
                    className={styles.selectSimple}
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      textAlign: 'center',
                      color: '#34495e'
                    }}
                  >
                    <option value="">Seleccionar calificación</option>
                    
                    {/* ✅ Opciones aprobatorias */}
                    <optgroup >
                      <option value="10.0">10.0 - AU</option>
                      <option value="9.9">9.9</option>
                      <option value="9.8">9.8</option>
                      <option value="9.7">9.7</option>
                      <option value="9.6">9.6</option>
                      <option value="9.5">9.5</option>
                      <option value="9.4">9.4</option>
                      <option value="9.3">9.3</option>
                      <option value="9.2">9.2</option>
                      <option value="9.1">9.1</option>
                      <option value="9.0">9.0 - DE</option>
                      <option value="8.9">8.9</option>
                      <option value="8.8">8.8</option>
                      <option value="8.7">8.7</option>
                      <option value="8.6">8.6</option>
                      <option value="8.5">8.5</option>
                      <option value="8.4">8.4</option>
                      <option value="8.3">8.3</option>
                      <option value="8.2">8.2</option>
                      <option value="8.1">8.1</option>
                      <option value="8.0">8.0 - SA</option>
                    </optgroup>
                  </select>
                  <small className={styles.ayudaSimple}>
                    ✅ Solo calificaciones aprobatorias: 8.0 - 10.0
                  </small>
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => setFormulario({...formulario, calificacion: 'NA'})}
                    className={`${styles.btnSimple}`}
                    style={{
                      background: formulario.calificacion === 'NA' ? '#ef4444' : '#fef2f2',
                      color: formulario.calificacion === 'NA' ? 'white' : '#dc2626',
                      border: '2px solid #ef4444',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    NA
                  </button>
                  <small className={styles.ayudaSimple} style={{ textAlign: 'center', display: 'block' }}>
                    ❌ No Aprobado
                  </small>
                </div>
              </div>
              
              <small className={styles.ayudaSimple} style={{ marginTop: '0.75rem', display: 'block' }}>
                💡 Solo hay dos opciones: Calificación aprobatoria (8.0-10.0) o NA (No Aprobado)
              </small>
            </div>

            <div className={styles.grupoSimple}>
              <label className={styles.labelSimple}>
                Observaciones
              </label>
              <textarea
                value={formulario.observaciones_parcial}
                onChange={(e) => setFormulario({...formulario, observaciones_parcial: e.target.value})}
                placeholder="Comentarios sobre la evaluación (opcional)"
                className={styles.textareaSimple}
              />
            </div>
          </>
        )}

        {/* Alerta cuando no hay parciales */}
        {formulario.alumno_id && parcialesDisponibles.length === 0 && (
          <div className={styles.alertaSimple}>
            <div>⚠️</div>
            <div>
              <strong>Sin parciales disponibles</strong>
              <br />
              <small>Este estudiante debe aprobar parciales anteriores o ya completó todos.</small>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className={styles.accionesSimples}>
          <button 
            onClick={cerrarModal} 
            className={`${styles.btnSimple} ${styles.btnCancelar}`}
          >
            Cancelar
          </button>
          <button 
            onClick={evaluarParcial} 
            className={`${styles.btnSimple} ${styles.btnGuardar}`}
            disabled={!formulario.asignacion_id || !formulario.alumno_id || !formulario.calificacion || parcialesDisponibles.length === 0}
          >
            💾 Crear Evaluación
          </button>
        </div>
      </div>
    </div>
  </div>
)}

              {/* Modal: Evaluar Parcial Existente */}
              {modalTipo === 'evaluar' && (
                <>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                      📝 Evaluar Parcial {formulario.numero_parcial} - {calificacionSeleccionada?.estudiante_nombre}
                    </h3>
                    <button className={styles.closeButton} onClick={cerrarModal}>✕</button>
                  </div>

                  <div className={styles.modalBody}>
                    {/* Información del estado actual */}
                    <div className={styles.estadoActualContainer}>
                      <div className={styles.infoOportunidad}>
                        <h4 style={{ color: obtenerColorEstadoParcial(estadoParcial) }}>
                          🎯 {obtenerTextoOportunidad(siguienteOportunidad)}
                        </h4>
                        <p className={styles.motivoTexto}>
                          <strong>Estado:</strong> {motivoOportunidad}
                        </p>
                        
                        {siguienteOportunidad === 'ultima_oportunidad' && (
                          <div className={styles.alertaUltimaOportunidad}>
                            <h5>⚠️ ATENCIÓN: ÚLTIMA OPORTUNIDAD</h5>
                            <p>• Esta es la única oportunidad especial en toda la carrera</p>
                            <p>• Si no aprueba, será baja definitiva del programa</p>
                            <p>• Use esta oportunidad sabiamente</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información de no poder evaluar */}
                    {!puedeEvaluar && (
                      <div className={styles.alertaNoPermitido}>
                        <h5>⚠️ No se puede evaluar</h5>
                        <p>{motivoOportunidad}</p>
                      </div>
                    )}

                    {/* Formulario de evaluación */}
                    <div className={styles.formGroup}>
                      <label>Parcial</label>
                      <input
                        type="number"
                        value={formulario.numero_parcial}
                        readOnly
                        className={styles.inputReadonly}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Tipo de Evaluación</label>
                      <input
                        type="text"
                        value={obtenerTextoOportunidad(formulario.oportunidad)}
                        readOnly
                        className={styles.inputReadonly}
                        style={{ 
                          fontWeight: 'bold',
                          color: obtenerColorEstadoParcial(estadoParcial)
                        }}
                      />
                      <small className={styles.helpText}>
                        ℹ️ La oportunidad se determina automáticamente según el sistema académico
                      </small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Calificación *</label>
                      <select
                        value={formulario.calificacion}
                        onChange={(e) => setFormulario({...formulario, calificacion: e.target.value})}
                        required
                        disabled={!puedeEvaluar}
                      >
                        <option value="">Seleccionar calificación</option>
                        <optgroup label="✅ Calificaciones Aprobatorias">
                          <option value="10">10 - Excelente</option>
                          <option value="9">9 - Muy Bien</option>
                          <option value="8">8 - Aprobado</option>
                        </optgroup>
                        <optgroup label="❌ Calificación Reprobatoria">
                          <option value="NA">NA - No Aprobado</option>
                        </optgroup>
                      </select>
                      <small className={styles.helpText}>
                        ℹ️ Calificación mínima aprobatoria: 8. Todo lo demás es NA.
                      </small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Observaciones</label>
                      <textarea
                        value={formulario.observaciones_parcial}
                        onChange={(e) => setFormulario({...formulario, observaciones_parcial: e.target.value})}
                        placeholder="Comentarios sobre la evaluación (opcional)"
                        rows="3"
                        disabled={!puedeEvaluar}
                      />
                    </div>

                    <div className={styles.modalActions}>
                      <button onClick={cerrarModal} className={styles.btnCancelar}>
                        Cancelar
                      </button>
                      <button 
                        onClick={evaluarParcial} 
                        className={`${styles.btnGuardar} ${siguienteOportunidad === 'ultima_oportunidad' ? styles.btnUltimaOportunidad : ''}`}
                        disabled={!puedeEvaluar || !formulario.calificacion}
                        style={{
                          opacity: puedeEvaluar ? 1 : 0.5,
                          cursor: puedeEvaluar ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {siguienteOportunidad === 'ultima_oportunidad' ? '🚨 Evaluar Última Oportunidad' : '💾 Guardar Evaluación'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Modal: Ver Detalle */}
              {modalTipo === 'detalle' && calificacionSeleccionada && (
                <>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                      👁️ Detalle - {calificacionSeleccionada.estudiante_nombre}
                    </h3>
                    <button className={styles.closeButton} onClick={cerrarModal}>✕</button>
                  </div>

                  <div className={styles.modalBody}>
                    <div className={styles.detalleContainer}>
                      <div className={styles.infoGeneral}>
                        <h4>📋 Información General</h4>
                        <p><strong>Estudiante:</strong> {calificacionSeleccionada.estudiante_nombre}</p>
                        <p><strong>Matrícula:</strong> {calificacionSeleccionada.estudiante_matricula}</p>
                        <p><strong>Calificación Final:</strong> 
                          <span className={`${styles.calificacionFinal} ${styles[obtenerColorCalificacion(calificacionSeleccionada.calificacion_final)]}`}>
                            {calificacionSeleccionada.calificacion_final || 'Pendiente'}
                          </span>
                        </p>
                        <p><strong>Estado:</strong> 
                          <span className={`${styles.estatusBadge} ${styles[`estatus${calificacionSeleccionada.estatus}`]}`}>
                            {calificacionSeleccionada.estatus}
                          </span>
                        </p>
                        <p><strong>Última oportunidad usada:</strong> {calificacionSeleccionada.ultima_oportunidad_usada ? '🚨 SÍ' : '✅ NO'}</p>
                      </div>

                      <div className={styles.historialEvaluaciones}>
                        <h4>📊 Historial de Evaluaciones</h4>
                        {evaluacionesDelAlumno.length > 0 ? (
                          <div className={styles.evaluacionesGrid}>
                            {evaluacionesDelAlumno.map((evaluacion, index) => (
                              <div key={index} className={`${styles.evaluacionCard} ${evaluacion.es_calificacion_final ? styles.evaluacionFinal : styles.evaluacionIntento}`}>
                                <div className={styles.evaluacionHeader}>
                                  <span className={styles.parcialInfo}>
                                    {obtenerIconoOportunidad(evaluacion.oportunidad)} Parcial {evaluacion.numero_parcial}
                                  </span>
                                  <span className={`${styles.oportunidadBadge} ${styles[evaluacion.oportunidad]}`}>
                                    {evaluacion.oportunidad}
                                  </span>
                                </div>
                                <div className={styles.evaluacionCalificacion}>
                                  <span className={`${styles.calificacionValor} ${evaluacion.aprobado ? styles.aprobado : styles.reprobado}`}>
                                    {evaluacion.calificacion}
                                  </span>
                                  <span className={styles.estadoEvaluacion}>
                                    {evaluacion.aprobado ? '✅ Aprobado' : '❌ Reprobado'}
                                  </span>
                                </div>
                                <div className={styles.evaluacionFecha}>
                                  {formatearFecha(evaluacion.fecha_evaluacion)}
                                </div>
                                {evaluacion.observaciones_parcial && (
                                  <div className={styles.evaluacionObservaciones}>
                                    💬 {evaluacion.observaciones_parcial}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.noEvaluaciones}>No hay evaluaciones registradas</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GestionCalificaciones;