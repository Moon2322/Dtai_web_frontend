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
  const [asignaturas, setAsignaturas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroAsignatura, setFiltroAsignatura] = useState('');
  
  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  
  // Estado del formulario
  const [formularioCalificacion, setFormularioCalificacion] = useState({
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

  useEffect(() => {
    verificarAutenticacion();
    cargarDatos();
  }, []);

  const verificarAutenticacion = () => {
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
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Cargar en paralelo
      const [calificacionesRes, estadisticasRes, asignaturasRes, gruposRes] = await Promise.all([
        fetch('http://localhost:5000/api/profesor/calificaciones', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/calificaciones/estadisticas', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/asignaturas', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/grupos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (calificacionesRes.ok) {
        const data = await calificacionesRes.json();
        if (data.success) {
          setCalificaciones(data.data);
        }
      }

      if (estadisticasRes.ok) {
        const data = await estadisticasRes.json();
        if (data.success) {
          setEstadisticas(data.data);
        }
      }

      if (asignaturasRes.ok) {
        const data = await asignaturasRes.json();
        if (data.success) {
          setAsignaturas(data.data);
        }
      }

      if (gruposRes.ok) {
        const data = await gruposRes.json();
        if (data.success) {
          setGrupos(data.data);
        }
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudiantes = async (grupoId, asignaturaId) => {
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
  };

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

  const manejarCambioFormulario = (campo, valor) => {
    setFormularioCalificacion(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Si cambió grupo o asignatura, cargar estudiantes
    if (campo === 'grupo_id' || campo === 'asignatura_id') {
      const grupoId = campo === 'grupo_id' ? valor : formularioCalificacion.grupo_id;
      const asignaturaId = campo === 'asignatura_id' ? valor : formularioCalificacion.asignatura_id;
      
      if (grupoId && asignaturaId) {
        cargarEstudiantes(grupoId, asignaturaId);
      }
    }
  };

  const guardarCalificacion = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = modoEdicion 
        ? `http://localhost:5000/api/profesor/calificaciones/${calificacionSeleccionada.id}`
        : 'http://localhost:5000/api/profesor/calificaciones';
      
      const method = modoEdicion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formularioCalificacion)
      });

      const data = await response.json();
      
      if (data.success) {
        setMostrarModal(false);
        cargarDatos(); // Recargar datos
        alert(modoEdicion ? 'Calificación actualizada exitosamente' : 'Calificación creada exitosamente');
      } else {
        alert(data.message || 'Error al guardar la calificación');
      }
    } catch (error) {
      console.error('Error al guardar calificación:', error);
      alert('Error al guardar la calificación');
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
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{modoEdicion ? 'Editar Calificación' : 'Nueva Calificación'}</h2>
                <button
                  onClick={() => setMostrarModal(false)}
                  className={styles.closeButton}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={guardarCalificacion} className={styles.modalForm}>
                <div className={styles.formGrid}>
                  {/* Selección de Asignatura */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Asignatura *</label>
                    <select
                      value={formularioCalificacion.asignatura_id}
                      onChange={(e) => manejarCambioFormulario('asignatura_id', e.target.value)}
                      className={styles.formSelect}
                      required
                      disabled={modoEdicion}
                    >
                      <option value="">Seleccionar asignatura</option>
                      {asignaturas.map(asignatura => (
                        <option key={asignatura.asignatura_id} value={asignatura.asignatura_id}>
                          {asignatura.asignatura_nombre} - {asignatura.grupo_codigo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selección de Grupo */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Grupo *</label>
                    <select
                      value={formularioCalificacion.grupo_id}
                      onChange={(e) => manejarCambioFormulario('grupo_id', e.target.value)}
                      className={styles.formSelect}
                      required
                      disabled={modoEdicion}
                    >
                      <option value="">Seleccionar grupo</option>
                      {grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>
                          {grupo.codigo} - {grupo.cuatrimestre}° Cuatrimestre
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selección de Estudiante */}
                  {!modoEdicion && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Estudiante *</label>
                      <select
                        value={formularioCalificacion.alumno_id}
                        onChange={(e) => manejarCambioFormulario('alumno_id', e.target.value)}
                        className={styles.formSelect}
                        required
                      >
                        <option value="">Seleccionar estudiante</option>
                        {estudiantes.map(estudiante => (
                          <option key={estudiante.alumno_id} value={estudiante.alumno_id}>
                            {estudiante.estudiante} - {estudiante.matricula}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ciclo Escolar */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ciclo Escolar *</label>
                    <select
                      value={formularioCalificacion.ciclo_escolar}
                      onChange={(e) => manejarCambioFormulario('ciclo_escolar', e.target.value)}
                      className={styles.formSelect}
                      required
                    >
                      <option value="2025-1">2025-1 (Enero-Abril)</option>
                      <option value="2025-2">2025-2 (Mayo-Agosto)</option>
                      <option value="2025-3">2025-3 (Septiembre-Diciembre)</option>
                    </select>
                  </div>
                </div>

                {/* Calificaciones */}
                <div className={styles.calificacionesSection}>
                  <h3>Calificaciones</h3>
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
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Final</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formularioCalificacion.calificacion_final}
                        onChange={(e) => manejarCambioFormulario('calificacion_final', e.target.value)}
                        className={styles.formInput}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Estatus y Observaciones */}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Estatus</label>
                    <select
                      value={formularioCalificacion.estatus}
                      onChange={(e) => manejarCambioFormulario('estatus', e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="cursando">Cursando</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="reprobado">Reprobado</option>
                      <option value="extraordinario">Extraordinario</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Observaciones</label>
                    <textarea
                      value={formularioCalificacion.observaciones}
                      onChange={(e) => manejarCambioFormulario('observaciones', e.target.value)}
                      className={styles.formTextarea}
                      rows="3"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                {/* Botones del Modal */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                  >
                    {modoEdicion ? 'Actualizar' : 'Guardar'} Calificación
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