import React, { useState, useEffect } from 'react';
import styles from '../css/Gestioncalificaciones.module.css';
import Header from '../components/header_profesor';


const GestionCalificaciones = () => {
  // Estado para almacenar todas las calificaciones
  const [calificaciones, setCalificaciones] = useState([
    {
      id: 1,
      estudiante: "Ana García López",
      matricula: "2024001",
      asignatura: "Matemáticas",
      evaluacion: "Ordinaria",
      calificacion: 85,
      fecha: "2024-03-15",
      cuatrimestre: "Enero-Abril 2024",
      grupo: "1A"
    },
    {
      id: 2,
      estudiante: "Carlos Mendoza",
      matricula: "2024002", 
      asignatura: "Programación",
      evaluacion: "Remedial",
      calificacion: 75,
      fecha: "2024-03-18",
      cuatrimestre: "Enero-Abril 2024",
      grupo: "1A"
    },
    {
      id: 3,
      estudiante: "María González",
      matricula: "2024003",
      asignatura: "Base de Datos",
      evaluacion: "Ordinaria", 
      calificacion: 92,
      fecha: "2024-03-20",
      cuatrimestre: "Enero-Abril 2024",
      grupo: "1B"
    },
    {
      id: 4,
      estudiante: "Juan Pérez",
      matricula: "2024004",
      asignatura: "Inglés",
      evaluacion: "Extraordinaria",
      calificacion: 68,
      fecha: "2024-03-22",
      cuatrimestre: "Enero-Abril 2024", 
      grupo: "1A"
    }
  ]);

  // Estados para controlar la interfaz
  const [gruposDisponibles, setGruposDisponibles] = useState(['1A', '1B', '2A', '2B']);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [calificacionEditando, setCalificacionEditando] = useState(null);

  // Estado para el formulario del modal
  const [formulario, setFormulario] = useState({
    estudiante: '',
    matricula: '',
    asignatura: '',
    evaluacion: 'Ordinaria',
    calificacion: '',
    fecha: '',
    cuatrimestre: '',
    grupo: ''
  });

  // Cargar datos desde el backend
  useEffect(() => {
    cargarCalificaciones();
    cargarGrupos();
  }, []);

  const cargarCalificaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/calificaciones', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCalificaciones(data.data);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    }
  };

  const cargarGrupos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/grupos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const grupos = [...new Set(data.data.map(grupo => grupo.codigo))];
        setGruposDisponibles(grupos);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    }
  };

  // Función para filtrar las calificaciones por grupo
  const calificacionesFiltradas = calificaciones.filter(cal => 
    filtroGrupo === '' || cal.grupo === filtroGrupo
  );

  // Función para calcular estadísticas
  const calcularEstadisticas = () => {
    const datos = calificacionesFiltradas;
    const total = datos.length;
    
    if (total === 0) {
      return { promedio: 0, aprobados: 0, reprobados: 0, total: 0 };
    }

    const suma = datos.reduce((acc, cal) => acc + cal.calificacion, 0);
    const promedio = (suma / total).toFixed(1);
    const aprobados = datos.filter(cal => cal.calificacion >= 70).length;
    const reprobados = total - aprobados;

    return { promedio, aprobados, reprobados, total };
  };

  const estadisticas = calcularEstadisticas();

  // Función para abrir el modal para agregar nueva calificación
  const abrirModalAgregar = () => {
    setFormulario({
      estudiante: '',
      matricula: '',
      asignatura: '',
      evaluacion: 'Ordinaria',
      calificacion: '',
      fecha: '',
      cuatrimestre: '',
      grupo: ''
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  // Función para abrir el modal para editar
  const abrirModalEditar = (calificacion) => {
    setFormulario({
      estudiante: calificacion.estudiante,
      matricula: calificacion.matricula,
      asignatura: calificacion.asignatura,
      evaluacion: calificacion.evaluacion,
      calificacion: calificacion.calificacion,
      fecha: calificacion.fecha,
      cuatrimestre: calificacion.cuatrimestre,
      grupo: calificacion.grupo
    });
    setCalificacionEditando(calificacion);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Función para guardar (crear o actualizar)
  const guardarCalificacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = modoEdicion 
        ? `http://localhost:5000/api/calificaciones/${calificacionEditando.id}`
        : 'http://localhost:5000/api/calificaciones';
      
      const method = modoEdicion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formulario,
          calificacion: Number(formulario.calificacion)
        })
      });

      const data = await response.json();
      if (data.success) {
        await cargarCalificaciones(); // Recargar datos
        setMostrarModal(false);
      } else {
        alert('Error al guardar: ' + data.message);
      }
    } catch (error) {
      console.error('Error al guardar calificación:', error);
      alert('Error al guardar la calificación');
    }
  };

  // Función para eliminar calificación
  const eliminarCalificacion = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta calificación?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/calificaciones/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          await cargarCalificaciones(); // Recargar datos
        } else {
          alert('Error al eliminar: ' + data.message);
        }
      } catch (error) {
        console.error('Error al eliminar calificación:', error);
        alert('Error al eliminar la calificación');
      }
    }
  };

  // Función para manejar cambios en el formulario
  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para obtener la clase CSS del badge de evaluación
  const obtenerClaseEvaluacion = (evaluacion) => {
    switch (evaluacion) {
      case 'Ordinaria': return styles.evaluacionOrdinaria;
      case 'Remedial': return styles.evaluacionRemedial;
      case 'Extraordinaria': return styles.evaluacionExtraordinaria;
      case 'Última Asignatura': return styles.evaluacionUltima;
      default: return styles.evaluacionOrdinaria;
    }
  };

  return (
    <div className={styles.container}>

          <Header />

      <div className={styles.content}>
        
        {/* Encabezado */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión de Calificaciones</h1>
          <p className={styles.subtitle}>Administra las calificaciones de los estudiantes</p>
        </div>

        {/* Filtros y Estadísticas */}
        <div className={styles.filtersStatsGrid}>
          
          {/* Filtros */}
          <div className={styles.filtersCard}>
            <h3 className={styles.filtersTitle}>
              <span className={styles.filterIcon}>🔍</span>
              Filtros
            </h3>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Por Grupo</label>
              <select
                value={filtroGrupo}
                onChange={(e) => setFiltroGrupo(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los grupos</option>
                {gruposDisponibles.map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsGrid}>
            
            {/* Promedio General */}
            <div className={`${styles.statCard} ${styles.statPromedio}`}>
              <div className={styles.statContent}>
                <h3>Promedio General</h3>
                <p>{estadisticas.promedio}</p>
              </div>
              <span className={styles.statIcon}>📊</span>
            </div>

            {/* Total Estudiantes */}
            <div className={`${styles.statCard} ${styles.statTotal}`}>
              <div className={styles.statContent}>
                <h3>Total</h3>
                <p>{estadisticas.total}</p>
              </div>
              <span className={styles.statIcon}>👥</span>
            </div>

            {/* Aprobados */}
            <div className={`${styles.statCard} ${styles.statAprobados}`}>
              <div className={styles.statContent}>
                <h3>Aprobados</h3>
                <p>{estadisticas.aprobados}</p>
              </div>
              <span className={styles.statIcon}>✅</span>
            </div>

            {/* Reprobados */}
            <div className={`${styles.statCard} ${styles.statReprobados}`}>
              <div className={styles.statContent}>
                <h3>Reprobados</h3>
                <p>{estadisticas.reprobados}</p>
              </div>
              <span className={styles.statIcon}>❌</span>
            </div>

          </div>
        </div>

        {/* Botón Agregar Nueva Calificación */}
        <button
          onClick={abrirModalAgregar}
          className={styles.addButton}
        >
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
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {calificacionesFiltradas.map((calificacion) => (
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
                    <span className={`${styles.evaluacionBadge} ${obtenerClaseEvaluacion(calificacion.evaluacion)}`}>
                      {calificacion.evaluacion}
                    </span>
                  </td>
                  <td>
                    <span className={calificacion.calificacion >= 70 ? styles.calificacionAprobada : styles.calificacionReprobada}>
                      {calificacion.calificacion}
                    </span>
                  </td>
                  <td>
                    <span className={styles.cellText}>
                      {new Date(calificacion.fecha).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => abrirModalEditar(calificacion)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar"
                      >
                        <span className={styles.actionIcon}>✏️</span>
                      </button>
                      <button
                        onClick={() => eliminarCalificacion(calificacion.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Eliminar"
                      >
                        <span className={styles.actionIcon}>🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal para Agregar/Editar Calificación */}
      {mostrarModal && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Encabezado del Modal */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modoEdicion ? 'Editar Calificación' : 'Agregar Nueva Calificación'}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            {/* Formulario */}
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                
                {/* Nombre del Estudiante */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nombre del Estudiante *
                  </label>
                  <input
                    type="text"
                    value={formulario.estudiante}
                    onChange={(e) => manejarCambioFormulario('estudiante', e.target.value)}
                    className={styles.formInput}
                    placeholder="Ingresa el nombre completo"
                  />
                </div>

                {/* Matrícula */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    value={formulario.matricula}
                    onChange={(e) => manejarCambioFormulario('matricula', e.target.value)}
                    className={styles.formInput}
                    placeholder="Ej: 2024001"
                  />
                </div>

                {/* Asignatura */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Asignatura *
                  </label>
                  <input
                    type="text"
                    value={formulario.asignatura}
                    onChange={(e) => manejarCambioFormulario('asignatura', e.target.value)}
                    className={styles.formInput}
                    placeholder="Ej: Matemáticas"
                  />
                </div>

                {/* Grupo */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Grupo *
                  </label>
                  <select
                    value={formulario.grupo}
                    onChange={(e) => manejarCambioFormulario('grupo', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="">Seleccionar grupo</option>
                    {gruposDisponibles.map(grupo => (
                      <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Evaluación */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tipo de Evaluación *
                  </label>
                  <select
                    value={formulario.evaluacion}
                    onChange={(e) => manejarCambioFormulario('evaluacion', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Ordinaria">Ordinaria</option>
                    <option value="Remedial">Remedial</option>
                    <option value="Extraordinaria">Extraordinaria</option>
                    <option value="Última Asignatura">Última Asignatura</option>
                  </select>
                </div>

                {/* Calificación */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Calificación *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formulario.calificacion}
                    onChange={(e) => manejarCambioFormulario('calificacion', e.target.value)}
                    className={styles.formInput}
                    placeholder="0-100"
                  />
                </div>

                {/* Fecha */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formulario.fecha}
                    onChange={(e) => manejarCambioFormulario('fecha', e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                {/* Cuatrimestre */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Cuatrimestre *
                  </label>
                  <input
                    type="text"
                    value={formulario.cuatrimestre}
                    onChange={(e) => manejarCambioFormulario('cuatrimestre', e.target.value)}
                    className={styles.formInput}
                    placeholder="Ej: Enero-Abril 2024"
                  />
                </div>

              </div>
            </div>

            {/* Botones del Modal */}
            <div className={styles.modalFooter}>
              <button
                onClick={() => setMostrarModal(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={guardarCalificacion}
                className={styles.saveButton}
              >
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default GestionCalificaciones;