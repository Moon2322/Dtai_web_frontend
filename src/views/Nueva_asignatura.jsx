import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Nueva_asignatura.module.css';
import Header from '../components/header_profesor';

const NuevaAsignatura = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [misAsignaturas, setMisAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario de asignación
  const [formularioAsignacion, setFormularioAsignacion] = useState({
    asignatura_id: '',
    grupo_id: '',
    ciclo_escolar: '2025-1'
  });
  
  // Estados para horarios
  const [mostrarModalHorarios, setMostrarModalHorarios] = useState(false);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
  const [horariosAsignacion, setHorariosAsignacion] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState({
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    aula: '',
    tipo_clase: 'teorica'
  });

  // Opciones para los selects
  const ciclosEscolares = [
    { value: '2025-1', label: '2025-1 (Enero-Abril)' },
    { value: '2025-2', label: '2025-2 (Mayo-Agosto)' },
    { value: '2025-3', label: '2025-3 (Septiembre-Diciembre)' }
  ];

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' }
  ];

  const tiposClase = [
    { value: 'teorica', label: 'Teórica' },
    { value: 'practica', label: 'Práctica' },
    { value: 'laboratorio', label: 'Laboratorio' }
  ];

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
      
      // Cargar datos en paralelo
      const [asignaturasRes, gruposRes, misAsignaturasRes] = await Promise.all([
        fetch('http://localhost:5000/api/profesor/asignaturas-disponibles', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/grupos', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/profesor/mis-asignaturas', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (asignaturasRes.ok) {
        const data = await asignaturasRes.json();
        if (data.success) {
          setAsignaturasDisponibles(data.data);
        }
      }

      if (gruposRes.ok) {
        const data = await gruposRes.json();
        if (data.success) {
          setGrupos(data.data);
        }
      }

      if (misAsignaturasRes.ok) {
        const data = await misAsignaturasRes.json();
        if (data.success) {
          setMisAsignaturas(data.data);
        }
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioAsignacion = (campo, valor) => {
    setFormularioAsignacion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const asignarMateria = async (e) => {
    e.preventDefault();
    
    if (!formularioAsignacion.asignatura_id || !formularioAsignacion.grupo_id) {
      alert('Por favor selecciona una asignatura y un grupo');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profesor/asignar-materia', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formularioAsignacion)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        // Limpiar formulario
        setFormularioAsignacion({
          asignatura_id: '',
          grupo_id: '',
          ciclo_escolar: '2025-1'
        });
        // Recargar mis asignaturas
        cargarDatos();
      } else {
        alert(data.message || 'Error al asignar la materia');
      }
    } catch (error) {
      console.error('Error al asignar materia:', error);
      alert('Error al asignar la materia');
    }
  };

  const abrirModalHorarios = async (asignacion) => {
    setAsignacionSeleccionada(asignacion);
    setMostrarModalHorarios(true);
    await cargarHorariosAsignacion(asignacion.id);
  };

  const cargarHorariosAsignacion = async (asignacionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/asignacion/${asignacionId}/horarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setHorariosAsignacion(data.data);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const agregarHorario = async (e) => {
    e.preventDefault();
    
    if (!nuevoHorario.dia_semana || !nuevoHorario.hora_inicio || !nuevoHorario.hora_fin) {
      alert('Por favor completa día, hora de inicio y hora de fin');
      return;
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (nuevoHorario.hora_fin <= nuevoHorario.hora_inicio) {
      alert('La hora de fin debe ser mayor que la hora de inicio');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/asignacion/${asignacionSeleccionada.id}/horarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoHorario)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Horario agregado exitosamente');
        // Limpiar formulario
        setNuevoHorario({
          dia_semana: '',
          hora_inicio: '',
          hora_fin: '',
          aula: '',
          tipo_clase: 'teorica'
        });
        // Recargar horarios
        await cargarHorariosAsignacion(asignacionSeleccionada.id);
      } else {
        alert(data.message || 'Error al agregar horario');
      }
    } catch (error) {
      console.error('Error al agregar horario:', error);
      alert('Error al agregar horario');
    }
  };

  const eliminarHorario = async (horarioId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/horarios/${horarioId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Horario eliminado exitosamente');
        await cargarHorariosAsignacion(asignacionSeleccionada.id);
      } else {
        alert(data.message || 'Error al eliminar horario');
      }
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      alert('Error al eliminar horario');
    }
  };

  const eliminarAsignacion = async (asignacionId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta asignación? Esto también eliminará todos los horarios asociados.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/asignacion/${asignacionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Asignación eliminada exitosamente');
        cargarDatos();
      } else {
        alert(data.message || 'Error al eliminar asignación');
      }
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      alert('Error al eliminar asignación');
    }
  };

  const formatearHora = (hora) => {
    return hora.substring(0, 5); // Obtener solo HH:MM
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
          <h1 className={styles.title}>📚 Asignación de Materias</h1>
          <p className={styles.subtitle}>Asigna materias a grupos y gestiona sus horarios</p>
        </div>

        {/* Formulario para Nueva Asignación */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>➕ Nueva Asignación</h2>
          
          <form onSubmit={asignarMateria} className={styles.form}>
            <div className={styles.formGrid}>
              {/* Selección de Asignatura */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Asignatura *</label>
                <select
                  value={formularioAsignacion.asignatura_id}
                  onChange={(e) => manejarCambioAsignacion('asignatura_id', e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Seleccionar asignatura</option>
                  {asignaturasDisponibles.map(asignatura => (
                    <option key={asignatura.id} value={asignatura.id}>
                      {asignatura.codigo} - {asignatura.nombre} ({asignatura.cuatrimestre}° Cuatrimestre)
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Grupo */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Grupo *</label>
                <select
                  value={formularioAsignacion.grupo_id}
                  onChange={(e) => manejarCambioAsignacion('grupo_id', e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Seleccionar grupo</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.codigo} - {grupo.cuatrimestre}° Cuatrimestre ({grupo.periodo} {grupo.año})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciclo Escolar */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Ciclo Escolar *</label>
                <select
                  value={formularioAsignacion.ciclo_escolar}
                  onChange={(e) => manejarCambioAsignacion('ciclo_escolar', e.target.value)}
                  className={styles.select}
                  required
                >
                  {ciclosEscolares.map(ciclo => (
                    <option key={ciclo.value} value={ciclo.value}>
                      {ciclo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                🎯 Asignar Materia
              </button>
            </div>
          </form>
        </div>

        {/* Mis Asignaciones */}
        <div className={styles.tableCard}>
          <h2 className={styles.cardTitle}>📋 Mis Asignaciones ({misAsignaturas.length})</h2>
          
          {misAsignaturas.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tienes materias asignadas aún</p>
              <p>Usa el formulario de arriba para asignar tu primera materia</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Asignatura</th>
                    <th>Grupo</th>
                    <th>Cuatrimestre</th>
                    <th>Ciclo Escolar</th>
                    <th>Estudiantes</th>
                    <th>Fecha Asignación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {misAsignaturas.map((asignacion) => (
                    <tr key={asignacion.id}>
                      <td>
                        <div className={styles.asignaturaInfo}>
                          <div className={styles.asignaturaNombre}>
                            {asignacion.asignatura_nombre}
                          </div>
                          <div className={styles.asignaturaCodigo}>
                            {asignacion.asignatura_codigo}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.grupoInfo}>
                          <div className={styles.grupoNombre}>
                            {asignacion.grupo_codigo}
                          </div>
                          <div className={styles.carreraNombre}>
                            {asignacion.carrera_codigo}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={styles.cuatrimestre}>
                          {asignacion.cuatrimestre}°
                        </span>
                      </td>
                      <td>
                        <span className={styles.cicloEscolar}>
                          {asignacion.ciclo_escolar}
                        </span>
                      </td>
                      <td>
                        <span className={styles.totalEstudiantes}>
                          {asignacion.total_estudiantes} estudiantes
                        </span>
                      </td>
                      <td>
                        <span className={styles.fechaAsignacion}>
                          {new Date(asignacion.fecha_asignacion).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => abrirModalHorarios(asignacion)}
                            className={styles.horariosButton}
                            title="Gestionar Horarios"
                          >
                            🕐 Horarios
                          </button>
                          <button
                            onClick={() => eliminarAsignacion(asignacion.id)}
                            className={styles.deleteButton}
                            title="Eliminar Asignación"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Horarios */}
        {mostrarModalHorarios && asignacionSeleccionada && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>
                  🕐 Horarios de {asignacionSeleccionada.asignatura_nombre}
                </h2>
                <p className={styles.modalSubtitle}>
                  Grupo: {asignacionSeleccionada.grupo_codigo} - {asignacionSeleccionada.ciclo_escolar}
                </p>
                <button
                  onClick={() => setMostrarModalHorarios(false)}
                  className={styles.closeButton}
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalContent}>
                {/* Formulario para agregar horario */}
                <div className={styles.horarioForm}>
                  <h3>➕ Agregar Nuevo Horario</h3>
                  
                  <form onSubmit={agregarHorario} className={styles.form}>
                    <div className={styles.horarioGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Día *</label>
                        <select
                          value={nuevoHorario.dia_semana}
                          onChange={(e) => setNuevoHorario(prev => ({...prev, dia_semana: e.target.value}))}
                          className={styles.select}
                          required
                        >
                          <option value="">Seleccionar día</option>
                          {diasSemana.map(dia => (
                            <option key={dia.value} value={dia.value}>
                              {dia.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Hora Inicio *</label>
                        <input
                          type="time"
                          value={nuevoHorario.hora_inicio}
                          onChange={(e) => setNuevoHorario(prev => ({...prev, hora_inicio: e.target.value}))}
                          className={styles.input}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Hora Fin *</label>
                        <input
                          type="time"
                          value={nuevoHorario.hora_fin}
                          onChange={(e) => setNuevoHorario(prev => ({...prev, hora_fin: e.target.value}))}
                          className={styles.input}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Aula</label>
                        <input
                          type="text"
                          value={nuevoHorario.aula}
                          onChange={(e) => setNuevoHorario(prev => ({...prev, aula: e.target.value}))}
                          className={styles.input}
                          placeholder="Ej: A101, Lab1"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tipo de Clase</label>
                        <select
                          value={nuevoHorario.tipo_clase}
                          onChange={(e) => setNuevoHorario(prev => ({...prev, tipo_clase: e.target.value}))}
                          className={styles.select}
                        >
                          {tiposClase.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className={styles.addHorarioButton}>
                      ➕ Agregar Horario
                    </button>
                  </form>
                </div>

                {/* Lista de horarios existentes */}
                <div className={styles.horariosExistentes}>
                  <h3>📅 Horarios Actuales</h3>
                  
                  {horariosAsignacion.length === 0 ? (
                    <div className={styles.emptyHorarios}>
                      <p>No hay horarios configurados</p>
                      <p>Agrega el primer horario usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className={styles.horariosGrid}>
                      {horariosAsignacion.map((horario) => (
                        <div key={horario.id} className={styles.horarioCard}>
                          <div className={styles.horarioHeader}>
                            <span className={styles.dia}>
                              {diasSemana.find(d => d.value === horario.dia_semana)?.label}
                            </span>
                            <button
                              onClick={() => eliminarHorario(horario.id)}
                              className={styles.deleteHorarioButton}
                              title="Eliminar horario"
                            >
                              🗑️
                            </button>
                          </div>
                          
                          <div className={styles.horarioDetalle}>
                            <div className={styles.horarioTiempo}>
                              🕐 {formatearHora(horario.hora_inicio)} - {formatearHora(horario.hora_fin)}
                            </div>
                            
                            {horario.aula && (
                              <div className={styles.horarioAula}>
                                🏫 Aula: {horario.aula}
                              </div>
                            )}
                            
                            <div className={styles.horarioTipo}>
                              📚 {tiposClase.find(t => t.value === horario.tipo_clase)?.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setMostrarModalHorarios(false)}
                  className={styles.closeModalButton}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NuevaAsignatura;