// ✅ COMPONENTE ACTUALIZADO: Gestioncalificaciones.jsx
// Reemplazar completamente el archivo existente

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
/*   const [parcialSeleccionado, setParcialSeleccionado] = useState(1);
 */  const [evaluacionesDelAlumno, setEvaluacionesDelAlumno] = useState([]);
  const [siguienteOportunidad, setSiguienteOportunidad] = useState(null);
const [/* puedeEvaluar */, setPuedeEvaluar] = useState(false);
const [motivoOportunidad, setMotivoOportunidad] = useState('');
const [estadoParcial, setEstadoParcial] = useState('');

  
  // Estado del formulario
  const [formulario, setFormulario] = useState({
    asignacion_id: '',
    alumno_id: '',
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

  const mostrarParciales = (calificacion) => {
  // Debug: ver qué datos llegan
  console.log('🔍 Datos de parciales:', {
    detalle_parciales: calificacion.detalle_parciales,
    tipo: typeof calificacion.detalle_parciales,
    es_null: calificacion.detalle_parciales === null
  });

  if (calificacion.detalle_parciales && calificacion.detalle_parciales !== null) {
    try {
      // Parsear el JSON si es string, o usar directamente si ya es objeto
      const parciales = typeof calificacion.detalle_parciales === 'string' 
        ? JSON.parse(calificacion.detalle_parciales) 
        : calificacion.detalle_parciales;
      
      // Verificar que es un array y tiene elementos
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
  
  // Si no hay parciales o hubo error
  return <span className={styles.sinParciales}>Sin evaluaciones</span>;
};


  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Cargar calificaciones y estadísticas en paralelo
      const [calificacionesRes, estadisticasRes, asignacionesRes] = await Promise.all([
        fetch('http://localhost:5000/api/profesor/calificaciones', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/calificaciones/estadisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/mis-asignaturas', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [calificacionesData, estadisticasData, asignacionesData] = await Promise.all([
        calificacionesRes.json(),
        estadisticasRes.json(),
        asignacionesRes.json()
      ]);

      if (calificacionesData.success) {
        setCalificaciones(calificacionesData.data);
      }

      if (estadisticasData.success) {
        setEstadisticas(estadisticasData.data);
      }

      if (asignacionesData.success) {
        setAsignacionesProfesor(asignacionesData.data);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantesDelGrupo = async (asignaturaId, grupoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/profesor/estudiantes-grupo/${grupoId}/asignatura/${asignaturaId}`, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        setEstudiantesDelGrupo(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes del grupo:', error);
      setEstudiantesDelGrupo([]);
    }
  };

  const cargarDetalleCalificacion = async (calificacionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/profesor/calificaciones/${calificacionId}/detalle`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        setCalificacionSeleccionada(data.data.calificacion);
        setEvaluacionesDelAlumno(data.data.evaluaciones);
      }
    } catch (error) {
      console.error('Error al cargar detalle de calificación:', error);
    }
  };

  // ============================================
  // FUNCIONES DEL MODAL
  // ============================================

  const abrirModalNuevo = () => {
    setFormulario({
      asignacion_id: '',
      alumno_id: '',
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
  
  // Obtener información de la siguiente oportunidad
  const infoOportunidad = await obtenerSiguienteOportunidad(calificacion.id, parcial);
  
  if (!infoOportunidad) {
    alert('❌ Error al obtener información de oportunidades');
    return;
  }

  // Verificar si puede evaluar
  if (!infoOportunidad.puede_evaluar) {
    alert(`⚠️ No se puede evaluar: ${infoOportunidad.motivo}`);
    return;
  }

  // Configurar estados para el modal
  setSiguienteOportunidad(infoOportunidad.siguiente_oportunidad);
  setPuedeEvaluar(infoOportunidad.puede_evaluar);
  setMotivoOportunidad(infoOportunidad.motivo);
  setEstadoParcial(infoOportunidad.estado_parcial);

  // Configurar formulario
  setFormulario({
    calificacion_id: calificacion.id,
    alumno_id: null, // No necesario para evaluaciones existentes
    numero_parcial: parcial,
    oportunidad: infoOportunidad.siguiente_oportunidad, // ✅ Automático, no editable
    calificacion: '',
    observaciones_parcial: ''
  });

  setCalificacionSeleccionada(calificacion);
  setModalTipo('evaluar'); // Tipo específico para evaluaciones
/*   setBorrarEvaluaciones([]);
 */  setMostrarModal(true);
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

// 5. NUEVA FUNCIÓN: Obtener color según el estado del parcial
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
    setFormulario({
      asignacion_id: '',
      alumno_id: '',
      numero_parcial: 1,
      oportunidad: 'ordinario',
      calificacion: '',
      observaciones_parcial: ''
    });
  };

  // ============================================
  // FUNCIONES DE NEGOCIO
  // ============================================

/*   const obtenerSiguienteOportunidad = async (calificacionId, parcial) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/profesor/calificaciones/${calificacionId}/siguiente-oportunidad/${parcial}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data.siguiente_oportunidad;
      }
    } catch (error) {
      console.error('Error al obtener siguiente oportunidad:', error);
    }
    return 'ordinario';
  }; */

  const manejarCambioAsignacion = async (asignacionId) => {
    if (!asignacionId) {
      setAsignacionSeleccionada(null);
      setEstudiantesDelGrupo([]);
      return;
    }

    const asignacion = asignacionesProfesor.find(a => a.id.toString() === asignacionId);
    setAsignacionSeleccionada(asignacion);

    // Cargar estudiantes del grupo
    await cargarEstudiantesDelGrupo(asignacion.asignatura_id, asignacion.grupo_id);
    
    setFormulario(prev => ({
      ...prev,
      asignacion_id: asignacionId,
      alumno_id: ''
    }));
  };

  const evaluarParcial = async () => {
  try {
    if (!formulario.calificacion.trim()) {
      alert('⚠️ La calificación es obligatoria');
      return;
    }

    const token = localStorage.getItem('token');

    // ✅ VALIDACIÓN PREVIA: Verificar que aún puede evaluar en esta oportunidad
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
    const body = {
      numero_parcial: formulario.numero_parcial,
      oportunidad: formulario.oportunidad,
      calificacion: formulario.calificacion,
      observaciones_parcial: formulario.observaciones_parcial
    };

    const response = await fetch(
      `http://localhost:5000/api/profesor/calificaciones/${formulario.calificacion_id}/evaluar-parcial`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
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
    return 'aprobado';
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

          <div className={`${styles.statCard} ${styles.statUltimas}`}>
            <div className={styles.statContent}>
              <h3>Últimas Oportunidades</h3>
              <p>{estadisticas.ultimas_oportunidades_usadas}</p>
            </div>
            <div className={styles.statIcon}>🚨</div>
          </div>
        </div>

        {/* Botón agregar */}
        <button 
          className={styles.addButton}
          onClick={abrirModalNuevo}
        >
          <span className={styles.addIcon}>+</span>
          Nueva Evaluación
        </button>

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
              
              {/* Modal: Nueva Evaluación */}
              {modalTipo === 'nuevo' && (
                <>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>➕ Nueva Evaluación</h3>
                    <button className={styles.closeButton} onClick={cerrarModal}>✕</button>
                  </div>

                  <form onSubmit={evaluarParcial} className={styles.modalForm}>
                    <div className={styles.modalBody}>
                      
                      {/* Selección de materia y grupo */}
                      <div className={styles.formSection}>
                        <h4 className={styles.sectionTitle}>📚 Materia y Grupo</h4>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Seleccionar asignación *</label>
                          <select
                            value={formulario.asignacion_id}
                            onChange={(e) => manejarCambioAsignacion(e.target.value)}
                            className={styles.formSelect}
                            required
                          >
                            <option value="">Seleccionar materia y grupo</option>
                            {asignacionesProfesor.map(asignacion => (
                              <option key={asignacion.id} value={asignacion.id}>
                                📖 {asignacion.asignatura_nombre} - 👥 {asignacion.grupo_codigo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Selección de estudiante */}
                      {asignacionSeleccionada && (
                        <div className={styles.formSection}>
                          <h4 className={styles.sectionTitle}>👤 Estudiante</h4>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Seleccionar estudiante *</label>
                            <select
                              value={formulario.alumno_id}
                              onChange={(e) => setFormulario(prev => ({...prev, alumno_id: e.target.value}))}
                              className={styles.formSelect}
                              required
                            >
                              <option value="">Seleccionar estudiante</option>
                              {estudiantesDelGrupo.map(estudiante => (
                                <option key={estudiante.id} value={estudiante.id}>
                                  {estudiante.nombre_completo} - {estudiante.matricula}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Evaluación */}
                      {formulario.alumno_id && (
                        <div className={styles.formSection}>
                          <h4 className={styles.sectionTitle}>📊 Evaluación</h4>
                          
                          <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Parcial *</label>
                              <select
                                value={formulario.numero_parcial}
                                onChange={(e) => setFormulario(prev => ({...prev, numero_parcial: parseInt(e.target.value)}))}
                                className={styles.formSelect}
                                required
                              >
                                <option value={1}>Parcial 1</option>
                                <option value={2}>Parcial 2</option>
                                <option value={3}>Parcial 3</option>
                              </select>
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Oportunidad *</label>
                              <select
                                value={formulario.oportunidad}
                                onChange={(e) => setFormulario(prev => ({...prev, oportunidad: e.target.value}))}
                                className={styles.formSelect}
                                required
                              >
                                <option value="ordinario">📘 Ordinario</option>
                                <option value="remedial">📙 Remedial</option>
                                <option value="extraordinario">📕 Extraordinario</option>
                                <option value="ultima_oportunidad">🚨 Última Oportunidad</option>
                              </select>
                            </div>

                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Calificación *</label>
                              <select
                                value={formulario.calificacion}
                                onChange={(e) => setFormulario(prev => ({...prev, calificacion: e.target.value}))}
                                className={styles.formSelect}
                                required
                              >
                                <option value="">Seleccionar</option>
                                <option value="NA">❌ NA (No Aprobó)</option>
                                {['8.0', '8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7', '8.8', '8.9',
                                  '9.0', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.8', '9.9', '10.0'].map(cal => (
                                  <option key={cal} value={cal}>✅ {cal}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Observaciones</label>
                            <textarea
                              value={formulario.observaciones_parcial}
                              onChange={(e) => setFormulario(prev => ({...prev, observaciones_parcial: e.target.value}))}
                              className={styles.formTextarea}
                              rows="3"
                              placeholder="Comentarios sobre la evaluación..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.cancelButton} onClick={cerrarModal}>
                        Cancelar
                      </button>
                      <button type="submit" className={styles.saveButton}>
                        💾 Guardar Evaluación
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Modal: Evaluar Parcial */}
              {modalTipo === 'evaluar' && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          📝 Evaluar Parcial {formulario.numero_parcial} - {calificacionSeleccionada?.estudiante_nombre}
        </h3>
        <button className={styles.closeButton} onClick={cerrarModal}>✕</button>
      </div>

      <div className={styles.modalBody}>
        {/* ✅ NUEVA SECCIÓN: Información del estado actual */}
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
          />
        </div>

        <div className={styles.modalActions}>
          <button onClick={cerrarModal} className={styles.btnCancelar}>
            Cancelar
          </button>
          <button 
            onClick={evaluarParcial} 
            className={`${styles.btnGuardar} ${siguienteOportunidad === 'ultima_oportunidad' ? styles.btnUltimaOportunidad : ''}`}
          >
            {siguienteOportunidad === 'ultima_oportunidad' ? '🚨 Evaluar Última Oportunidad' : '💾 Guardar Evaluación'}
          </button>
        </div>
      </div>
    </div>
  </div>
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
                        <p><strong>Matrícula:</strong> {calificacionSeleccionada.matricula}</p>
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
                              <div key={index} className={`${styles.evaluacionCard} ${evaluacion.es_calificacion_final ? styles.evaluacionFinal : ''}`}>
                                <div className={styles.evaluacionHeader}>
                                  <span className={styles.parcialNumero}>Parcial {evaluacion.numero_parcial}</span>
                                  <span className={`${styles.oportunidadBadge} ${styles[`oportunidad${evaluacion.oportunidad}`]}`}>
                                    {obtenerIconoOportunidad(evaluacion.oportunidad)} {evaluacion.oportunidad}
                                  </span>
                                </div>
                                <div className={styles.evaluacionBody}>
                                  <div className={`${styles.calificacionEvaluacion} ${styles[obtenerColorCalificacion(evaluacion.calificacion)]}`}>
                                    {evaluacion.calificacion}
                                  </div>
                                  <div className={styles.fechaEvaluacion}>
                                    {formatearFecha(evaluacion.fecha_evaluacion)}
                                  </div>
                                  {evaluacion.es_calificacion_final && (
                                    <div className={styles.evaluacionFinalBadge}>✅ Final</div>
                                  )}
                                </div>
                                {evaluacion.observaciones_parcial && (
                                  <div className={styles.observacionesEvaluacion}>
                                    💭 {evaluacion.observaciones_parcial}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={styles.sinEvaluaciones}>No hay evaluaciones registradas</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.modalFooter}>
                    <button type="button" className={styles.cancelButton} onClick={cerrarModal}>
                      Cerrar
                    </button>
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