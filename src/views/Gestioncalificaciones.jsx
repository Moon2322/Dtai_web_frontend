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
    reprobados: 0
  });
  const [asignaturas, /* setAsignaturas */] = useState([]);
  const [grupos, /* s */] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asignacionesProfesor, setAsignacionesProfesor] = useState([]);
const [estudiantesDelGrupo, setEstudiantesDelGrupo] = useState([]);
const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);

  // Estados para filtros
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroAsignatura, setFiltroAsignatura] = useState('');
  
  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);
/*   const [estudiantes, setEstudiantes ] = useState([]);
 */  
  // Estado del formulario
const [formularioCalificacion, setFormularioCalificacion] = useState({
  asignacion_id: '', // NUEVO: ID de la asignación profesor-asignatura-grupo
  alumno_id: '',
  // Se elimina asignatura_id, grupo_id, ciclo_escolar (se obtienen de la asignación)
  parcial_1: '',
  parcial_2: '',
  parcial_3: '',
  calificacion_ordinario: '',
  calificacion_extraordinario: '',
  calificacion_final: '',
  estatus: 'cursando',
  observaciones: ''
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

  // Cargar todos los datos necesarios
  cargarDatos();
}, [navigate]);

  // ✅ FUNCIÓN para cargar asignaciones del profesor
const cargarAsignacionesProfesor = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/profesor/mis-asignaturas', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      setAsignacionesProfesor(data.data);
      console.log('✅ Asignaciones cargadas:', data.data);
    }
  } catch (error) {
    console.error('Error al cargar asignaciones del profesor:', error);
  }
};

// Función para calcular el promedio automáticamente
const calcularCalificacionFinal = (parcial1, parcial2, parcial3, ordinario, extraordinario) => {
  const calificaciones = [];
  
  // Agregar parciales si tienen valor
  if (parcial1 && parcial1 > 0) calificaciones.push(parseFloat(parcial1));
  if (parcial2 && parcial2 > 0) calificaciones.push(parseFloat(parcial2));
  if (parcial3 && parcial3 > 0) calificaciones.push(parseFloat(parcial3));
  
  // Si hay ordinario, tiene mayor peso
  if (ordinario && ordinario > 0) {
    calificaciones.push(parseFloat(ordinario));
  }
  
  // Si hay extraordinario, reemplaza todo (es la calificación de recuperación)
  if (extraordinario && extraordinario > 0) {
    return parseFloat(extraordinario).toFixed(1);
  }
  
  // Si no hay calificaciones, retornar 0
  if (calificaciones.length === 0) return '';
  
  // Calcular promedio
  const promedio = calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length;
  return promedio.toFixed(1);
};

// Función para determinar el estatus automáticamente
const determinarEstatus = (calificacionFinal) => {
  if (!calificacionFinal || calificacionFinal === '') return 'cursando';
  
  const cal = parseFloat(calificacionFinal);
  if (cal >= 6) return 'aprobado';
  if (cal > 0 && cal < 6) return 'reprobado';
  return 'cursando';
};

const calcularEstadisticas = (calificacionesData) => {
  const stats = {
    total_calificaciones: calificacionesData.length,
    promedio_general: 0,
    aprobados: 0,
    reprobados: 0
  };

  if (calificacionesData.length > 0) {
    const calificacionesFinales = calificacionesData
      .filter(c => c.calificacion_final && c.calificacion_final > 0)
      .map(c => parseFloat(c.calificacion_final));

    if (calificacionesFinales.length > 0) {
      stats.promedio_general = calificacionesFinales.reduce((a, b) => a + b, 0) / calificacionesFinales.length;
      stats.aprobados = calificacionesFinales.filter(c => c >= 6).length;
      stats.reprobados = calificacionesFinales.filter(c => c < 6).length;
    }
  }

  setEstadisticas(stats);
};

// ✅ FUNCIÓN para manejar cambio de asignación
const manejarCambioAsignacion = async (asignacionId) => {
  if (!asignacionId) {
    setFormularioCalificacion(prev => ({
      ...prev,
      asignacion_id: '',
      alumno_id: ''
    }));
    setEstudiantesDelGrupo([]);
    setAsignacionSeleccionada(null);
    return;
  }

  // Encontrar la asignación seleccionada
  const asignacion = asignacionesProfesor.find(a => a.id.toString() === asignacionId);
  setAsignacionSeleccionada(asignacion);

  // Actualizar formulario
  setFormularioCalificacion(prev => ({
    ...prev,
    asignacion_id: asignacionId,
    alumno_id: '' // Resetear alumno cuando cambia asignación
  }));

  // Cargar estudiantes del grupo
  await cargarEstudiantesDelGrupo(asignacion.asignatura_id, asignacion.grupo_id);
};

// ✅ FUNCIÓN para cargar estudiantes del grupo específico
const cargarEstudiantesDelGrupo = async (asignaturaId, grupoId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:5000/api/profesor/estudiantes-grupo/${grupoId}/asignatura/${asignaturaId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    if (data.success) {
      setEstudiantesDelGrupo(data.data);
      console.log('✅ Estudiantes del grupo cargados:', data.data);
    }
  } catch (error) {
    console.error('Error al cargar estudiantes del grupo:', error);
    setEstudiantesDelGrupo([]);
  }
};

const cargarDatos = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');

    // Cargar calificaciones existentes
    const responseCalificaciones = await fetch('http://localhost:5000/api/profesor/calificaciones', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Cargar asignaciones del profesor
    await cargarAsignacionesProfesor();

    const dataCalificaciones = await responseCalificaciones.json();
    if (dataCalificaciones.success) {
      setCalificaciones(dataCalificaciones.data);
      
      // Calcular estadísticas
      calcularEstadisticas(dataCalificaciones.data);
    }

  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    setLoading(false);
  }
};

/*   const cargarEstudiantes = async (grupoId, asignaturaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/calificaciones/estudiantes/${grupoId}/${asignaturaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setEstudiantes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  }; */

  const calificacionesFiltradas = calificaciones.filter(cal => {
    const coincideGrupo = !filtroGrupo || cal.grupo === filtroGrupo;
    const coincideAsignatura = !filtroAsignatura || cal.asignatura_codigo === filtroAsignatura;
    return coincideGrupo && coincideAsignatura;
  });

  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setCalificacionSeleccionada(null);
    setFormularioCalificacion({
      alumno_id: '',
      asignatura_id: '',
      grupo_id: '',
      parcial_1: '',
      parcial_2: '',
      parcial_3: '',
      calificacion_ordinario: '',
      calificacion_extraordinario: '',
      calificacion_final: '',
      estatus: 'cursando',
      observaciones: '',
      ciclo_escolar: '2025-1'
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (calificacion) => {
    setModoEdicion(true);
    setCalificacionSeleccionada(calificacion);
    setFormularioCalificacion({
      alumno_id: calificacion.alumno_id || '',
      asignatura_id: calificacion.asignatura_id || '',
      grupo_id: calificacion.grupo_id || '',
      parcial_1: calificacion.parcial_1 || '',
      parcial_2: calificacion.parcial_2 || '',
      parcial_3: calificacion.parcial_3 || '',
      calificacion_ordinario: calificacion.calificacion_ordinario || '',
      calificacion_extraordinario: calificacion.calificacion_extraordinario || '',
      calificacion_final: calificacion.calificacion_final || '',
      estatus: calificacion.estatus || 'cursando',
      observaciones: calificacion.observaciones || '',
      ciclo_escolar: calificacion.ciclo_escolar || '2025-1'
    });
    setMostrarModal(true);
  };

// ✅ MODIFICAR la función manejarCambioFormulario para cálculo automático
const manejarCambioFormulario = (campo, valor) => {
  const nuevoFormulario = {
    ...formularioCalificacion,
    [campo]: valor
  };

  // Si cambió alguna calificación, recalcular automáticamente
  if (['parcial_1', 'parcial_2', 'parcial_3', 'calificacion_ordinario', 'calificacion_extraordinario'].includes(campo)) {
    const calificacionFinal = calcularCalificacionFinal(
      nuevoFormulario.parcial_1,
      nuevoFormulario.parcial_2,
      nuevoFormulario.parcial_3,
      nuevoFormulario.calificacion_ordinario,
      nuevoFormulario.calificacion_extraordinario
    );
    
    const estatus = determinarEstatus(calificacionFinal);
    
    nuevoFormulario.calificacion_final = calificacionFinal;
    nuevoFormulario.estatus = estatus;
  }

  setFormularioCalificacion(nuevoFormulario);

  // Si cambió grupo o asignatura, cargar estudiantes
  if (campo === 'asignacion_id') {
    manejarCambioAsignacion(valor);
  }
};

const guardarCalificacion = async (e) => {
  e.preventDefault();
  
  if (!asignacionSeleccionada) {
    alert('Debes seleccionar una materia y grupo');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const url = modoEdicion 
      ? `http://localhost:5000/api/profesor/calificaciones/${calificacionSeleccionada.id}`
      : 'http://localhost:5000/api/profesor/calificaciones';
    
    const method = modoEdicion ? 'PUT' : 'POST';

    // Preparar datos con información de la asignación
    const datosCompletos = {
      ...formularioCalificacion,
      asignatura_id: asignacionSeleccionada.asignatura_id,
      grupo_id: asignacionSeleccionada.grupo_id,
      ciclo_escolar: asignacionSeleccionada.ciclo_escolar
    };

    console.log('Enviando datos:', datosCompletos);

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosCompletos)
    });

    const data = await response.json();
    
    if (data.success) {
      alert(modoEdicion 
        ? '✅ Calificación actualizada correctamente' 
        : '✅ Calificación guardada correctamente'
      );
      setMostrarModal(false);
      await cargarDatos();
    } else {
      alert(data.message || 'Error al guardar la calificación');
    }
  } catch (error) {
    console.error('Error al guardar calificación:', error);
    alert('Error de conexión. Inténtalo de nuevo.');
  }
};

  const eliminarCalificacion = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta calificación?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/calificaciones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        cargarDatos();
        alert('Calificación eliminada exitosamente');
      } else {
        alert(data.message || 'Error al eliminar la calificación');
      }
    } catch (error) {
      console.error('Error al eliminar calificación:', error);
      alert('Error al eliminar la calificación');
    }
  };

  const obtenerEvaluacionTexto = (calificacion) => {
    if (calificacion.calificacion_final) return 'Final';
    if (calificacion.calificacion_extraordinario) return 'Extraordinario';
    if (calificacion.calificacion_ordinario) return 'Ordinario';
    if (calificacion.parcial_3) return 'Parcial 3';
    if (calificacion.parcial_2) return 'Parcial 2';
    if (calificacion.parcial_1) return 'Parcial 1';
    return 'Sin calificar';
  };

  const obtenerCalificacionValor = (calificacion) => {
    return calificacion.calificacion_final || 
           calificacion.calificacion_extraordinario || 
           calificacion.calificacion_ordinario || 
           calificacion.parcial_3 || 
           calificacion.parcial_2 || 
           calificacion.parcial_1 || 
           0;
  };

  const obtenerClaseEvaluacion = (evaluacion) => {
    switch (evaluacion) {
      case 'Final': return styles.evaluacionFinal;
      case 'Ordinario': return styles.evaluacionOrdinario;
      case 'Extraordinario': return styles.evaluacionExtraordinario;
      default: return styles.evaluacionParcial;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 Gestión de Calificaciones</h1>
          <p className={styles.subtitle}>Administra y consulta las calificaciones de tus estudiantes</p>
        </div>

        {/* Estadísticas */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statPromedio}`}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Promedio General</span>
              <p>{Number(estadisticas.promedio_general || 0).toFixed(2)}</p>
            </div>
            <div className={styles.statIcon}>📈</div>
          </div>

          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Calificaciones</span>
              <p>{estadisticas.total_calificaciones || 0}</p>
            </div>
            <div className={styles.statIcon}>📝</div>
          </div>

          <div className={`${styles.statCard} ${styles.statAprobados}`}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Aprobados</span>
              <p>{estadisticas.aprobados || 0}</p>
            </div>
            <div className={styles.statIcon}>✅</div>
          </div>

          <div className={`${styles.statCard} ${styles.statReprobados}`}>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Reprobados</span>
              <p>{estadisticas.reprobados || 0}</p>
            </div>
            <div className={styles.statIcon}>❌</div>
          </div>
        </div>

        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <div className={styles.filters}>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los grupos</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.codigo}>
                  {grupo.codigo}
                </option>
              ))}
            </select>

            <select
              value={filtroAsignatura}
              onChange={(e) => setFiltroAsignatura(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas las asignaturas</option>
              {asignaturas.map(asignatura => (
                <option key={asignatura.asignatura_codigo} value={asignatura.asignatura_codigo}>
                  {asignatura.asignatura_nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Agregar */}
        <button onClick={abrirModalAgregar} className={styles.addButton}>
          <span className={styles.addIcon}>+</span>
          Agregar Nueva Calificación
        </button>

        {/* Tabla de Calificaciones */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Estudiante</th>
                <th>Matrícula</th>
                <th>Asignatura</th>
                <th>Evaluación</th>
                <th>Calificación</th>
                <th>Estatus</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {calificacionesFiltradas.map((calificacion) => {
                const evaluacion = obtenerEvaluacionTexto(calificacion);
                const valor = obtenerCalificacionValor(calificacion);
                
                return (
                  <tr key={calificacion.id}>
                    <td>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>
                          {calificacion.estudiante}
                        </div>
                        <div className={styles.studentGroup}>
                          Grupo: {calificacion.grupo}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.cellText}>{calificacion.matricula}</span>
                    </td>
                    <td>
                      <span className={styles.cellText}>{calificacion.asignatura}</span>
                    </td>
                    <td>
                      <span className={`${styles.evaluacionBadge} ${obtenerClaseEvaluacion(evaluacion)}`}>
                        {evaluacion}
                      </span>
                    </td>
                    <td>
                      <span className={valor >= 70 ? styles.calificacionAprobado : styles.calificacionReprobado}>
                        {Number(valor).toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.estatusBadge} ${styles[`estatus${calificacion.estatus}`]}`}>
                        {calificacion.estatus}
                      </span>
                    </td>
                    <td>
                      <span className={styles.cellText}>
                        {new Date(calificacion.fecha_actualizacion).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => abrirModalEditar(calificacion)}
                          className={styles.editButton}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarCalificacion(calificacion.id)}
                          className={styles.deleteButton}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {calificacionesFiltradas.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay calificaciones registradas</p>
            </div>
          )}
        </div>



{/* Modal para Agregar/Editar Calificación */}
{mostrarModal && (
  <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>
          {modoEdicion ? '✏️ Editar Calificación' : '➕ Nueva Calificación'}
        </h3>
        <button 
          className={styles.closeButton}
          onClick={() => setMostrarModal(false)}
          type="button"
        >
          ✕
        </button>
      </div>

      <form onSubmit={guardarCalificacion} className={styles.modalForm}>
        <div className={styles.modalBody}>
          
          {/* Selección de Materia-Grupo (combinado) */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>📚 Seleccionar Materia y Grupo</h4>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Materia y Grupo *</label>
              <select
                value={formularioCalificacion.asignacion_id || ''}
                onChange={(e) => manejarCambioAsignacion(e.target.value)}
                className={styles.formSelect}
                required
              >
                <option value="">Seleccionar materia y grupo</option>
                {asignacionesProfesor.map(asignacion => (
                  <option key={asignacion.id} value={asignacion.id}>
                    📖 {asignacion.asignatura_nombre} ({asignacion.asignatura_codigo}) - 
                    👥 Grupo {asignacion.grupo_codigo} - 
                    🎓 {asignacion.carrera_nombre} - 
                    📅 {asignacion.ciclo_escolar}
                    ({asignacion.total_estudiantes} estudiantes)
                  </option>
                ))}
              </select>
              <small className={styles.helpText}>
                Solo se muestran las materias y grupos que tienes asignados
              </small>
            </div>
          </div>

          {/* Selección de Estudiante (se llena automáticamente según la asignación) */}
          {formularioCalificacion.asignacion_id && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>👤 Seleccionar Estudiante</h4>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Estudiante *</label>
                <select
                  value={formularioCalificacion.alumno_id}
                  onChange={(e) => setFormularioCalificacion({
                    ...formularioCalificacion,
                    alumno_id: e.target.value
                  })}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {estudiantesDelGrupo.map(estudiante => (
                    <option key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre_completo} - {estudiante.matricula}
                      {estudiante.tiene_calificacion && ' (⚠️ Ya tiene calificación)'}
                    </option>
                  ))}
                </select>
                {estudiantesDelGrupo.length === 0 && (
                  <small className={styles.helpText} style={{ color: '#dc2626' }}>
                    No hay estudiantes inscritos en este grupo
                  </small>
                )}
              </div>
            </div>
          )}

          {/* Calificaciones (solo si ya seleccionó estudiante) */}
          {/* Calificaciones (solo si ya seleccionó estudiante) */}
{formularioCalificacion.alumno_id && (
  <div className={styles.formSection}>
    <h4 className={styles.sectionTitle}>📊 Calificaciones</h4>
    
    <div className={styles.calificacionesGrid}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Parcial 1</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={formularioCalificacion.parcial_1}
          onChange={(e) => manejarCambioFormulario('parcial_1', e.target.value)}
          className={styles.formInput}
          placeholder="0.0"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Parcial 2</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={formularioCalificacion.parcial_2}
          onChange={(e) => manejarCambioFormulario('parcial_2', e.target.value)}
          className={styles.formInput}
          placeholder="0.0"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Parcial 3</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={formularioCalificacion.parcial_3}
          onChange={(e) => manejarCambioFormulario('parcial_3', e.target.value)}
          className={styles.formInput}
          placeholder="0.0"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Ordinario</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={formularioCalificacion.calificacion_ordinario}
          onChange={(e) => manejarCambioFormulario('calificacion_ordinario', e.target.value)}
          className={styles.formInput}
          placeholder="0.0"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Extraordinario</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={formularioCalificacion.calificacion_extraordinario}
          onChange={(e) => manejarCambioFormulario('calificacion_extraordinario', e.target.value)}
          className={styles.formInput}
          placeholder="0.0"
        />
        <small className={styles.helpText}>
          Si hay extraordinario, esta será la calificación final
        </small>
      </div>

      {/* ✅ CAMPO FINAL AUTOMÁTICO - Solo lectura */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Final (Automática)</label>
        <input
          type="text"
          value={formularioCalificacion.calificacion_final}
          className={`${styles.formInput} ${styles.inputReadonly}`}
          placeholder="Se calcula automáticamente"
          readOnly
        />
        <small className={styles.helpText}>
          {formularioCalificacion.calificacion_final && 
            `Promedio: ${formularioCalificacion.calificacion_final} - ${
              parseFloat(formularioCalificacion.calificacion_final) >= 6 ? '✅ Aprobado' : '❌ Reprobado'
            }`
          }
        </small>
      </div>
    </div>

    {/* Explicación del cálculo */}
    <div className={styles.calculoExplicacion}>
      <h5>🧮 Cómo se calcula:</h5>
      <ul>
        <li><strong>Promedio normal:</strong> Se promedian los parciales y ordinario que tengan valor</li>
        <li><strong>Con extraordinario:</strong> El extraordinario se convierte en la calificación final</li>
        <li><strong>Estatus automático:</strong> ≥6.0 = Aprobado, &lt;6.0 = Reprobado</li>
      </ul>
    </div>
  </div>
)}

{/* Estado y Observaciones - ✅ ESTATUS AUTOMÁTICO */}
{formularioCalificacion.calificacion_final && (
  <div className={styles.formSection}>
    <h4 className={styles.sectionTitle}>📝 Estado y Observaciones</h4>
    
    <div className={styles.formGrid}>
      {/* ✅ ESTATUS AUTOMÁTICO - Solo lectura */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Estado (Automático)</label>
        <div className={`${styles.estatusDisplay} ${styles[`estatus${formularioCalificacion.estatus}`]}`}>
          {formularioCalificacion.estatus === 'aprobado' && '✅ Aprobado'}
          {formularioCalificacion.estatus === 'reprobado' && '❌ Reprobado'}
          {formularioCalificacion.estatus === 'cursando' && '📚 Cursando'}
          {formularioCalificacion.estatus === 'extraordinario' && '⚠️ Extraordinario'}
        </div>
        <small className={styles.helpText}>
          Se determina automáticamente según la calificación final
        </small>
      </div>

      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
        <label className={styles.formLabel}>Observaciones</label>
        <textarea
          value={formularioCalificacion.observaciones}
          onChange={(e) => manejarCambioFormulario('observaciones', e.target.value)}
          className={styles.formTextarea}
          placeholder="Comentarios adicionales sobre el rendimiento del estudiante..."
          rows="3"
        />
      </div>
    </div>

    {/* ✅ INFORMACIÓN ADICIONAL AUTOMÁTICA */}
    <div className={styles.infoAutomatica}>
      <h5>ℹ️ Información Automática:</h5>
      <ul>
        <li><strong>Materia:</strong> {asignacionSeleccionada?.asignatura_nombre}</li>
        <li><strong>Grupo:</strong> {asignacionSeleccionada?.grupo_codigo}</li>
        <li><strong>Carrera:</strong> {asignacionSeleccionada?.carrera_nombre}</li>
        <li><strong>Ciclo Escolar:</strong> {asignacionSeleccionada?.ciclo_escolar}</li>
        <li><strong>Calificación Final:</strong> {formularioCalificacion.calificacion_final || 'Pendiente'}</li>
        <li><strong>Estado:</strong> {formularioCalificacion.estatus}</li>
      </ul>
    </div>
  </div>
)}
        </div>

        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => setMostrarModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={!formularioCalificacion.alumno_id || !formularioCalificacion.calificacion_final}
          >
            {modoEdicion ? '💾 Actualizar' : '➕ Guardar Calificación'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default GestionCalificaciones;