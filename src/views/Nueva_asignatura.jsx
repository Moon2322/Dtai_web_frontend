import React, { useState, useEffect } from 'react';
import styles from '../css/Nueva_asignatura.module.css';
import Header from '../components/header_profesor.jsx';

const NuevaAsignaturas = () => {
  // Estado principal del formulario
  const [formulario, setFormulario] = useState({
    asignatura_nombre: '',
    grupo: '',
    cuatrimestre: '',
    aula: '',
    periodo_academico: '2024-01' // Enero-Abril 2024, por ejemplo
  });

  // Estado para los horarios (múltiples horarios por asignatura)
  const [horarios, setHorarios] = useState([]);
  
  // Estado para el horario temporal que se está configurando
  const [horarioTemporal, setHorarioTemporal] = useState({
    dia: '',
    hora_inicio: '',
    hora_fin: ''
  });

  const [loading, setLoading] = useState(true);

  // Estado para las asignaturas ya registradas por el profesor
  const [asignaturasRegistradas, setAsignaturasRegistradas] = useState([]);

  // Opciones fijas
  const cuatrimestres = [
    { value: 1, label: '1° Cuatrimestre' },
    { value: 2, label: '2° Cuatrimestre' },
    { value: 3, label: '3° Cuatrimestre' },
    { value: 4, label: '4° Cuatrimestre' },
    { value: 5, label: '5° Cuatrimestre' },
    { value: 6, label: '6° Cuatrimestre' },
    { value: 7, label: '7° Cuatrimestre' },
    { value: 8, label: '8° Cuatrimestre' },
    { value: 9, label: '9° Cuatrimestre' },
    { value: 10, label: '10° Cuatrimestre' },
    { value: 11, label: '11° Cuatrimestre' }
  ];

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' }
  ];

  const horasDisponibles = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00'
  ];

  // Cargar datos iniciales
  useEffect(() => {
    cargarAsignaturasRegistradas();
  }, []);

  const cargarAsignaturasRegistradas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar asignaturas ya registradas por el profesor
      const profesorRes = await fetch('http://localhost:5000/api/profesor/asignaturas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profesorData = await profesorRes.json();
      if (profesorData.success) {
        setAsignaturasRegistradas(profesorData.data);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario principal
  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Manejar cambios en el horario temporal
  const manejarCambioHorario = (campo, valor) => {
    setHorarioTemporal(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Agregar horario a la lista
  const agregarHorario = () => {
    if (horarioTemporal.dia && horarioTemporal.hora_inicio && horarioTemporal.hora_fin) {
      // Validar que hora_fin sea mayor que hora_inicio
      if (horarioTemporal.hora_inicio >= horarioTemporal.hora_fin) {
        alert('La hora de fin debe ser posterior a la hora de inicio');
        return;
      }

      // Validar que no haya conflictos de horario
      const conflicto = horarios.find(h => 
        h.dia === horarioTemporal.dia && 
        (
          (horarioTemporal.hora_inicio >= h.hora_inicio && horarioTemporal.hora_inicio < h.hora_fin) ||
          (horarioTemporal.hora_fin > h.hora_inicio && horarioTemporal.hora_fin <= h.hora_fin) ||
          (horarioTemporal.hora_inicio <= h.hora_inicio && horarioTemporal.hora_fin >= h.hora_fin)
        )
      );

      if (conflicto) {
        alert('Ya existe un horario que se sobrepone en este día y hora');
        return;
      }

      setHorarios(prev => [...prev, { ...horarioTemporal, id: Date.now() }]);
      setHorarioTemporal({ dia: '', hora_inicio: '', hora_fin: '' });
    } else {
      alert('Por favor completa todos los campos del horario');
    }
  };

  // Eliminar horario de la lista
  const eliminarHorario = (id) => {
    setHorarios(prev => prev.filter(h => h.id !== id));
  };

  // Guardar asignatura completa
  const guardarAsignatura = async () => {
    // Validaciones
    if (!formulario.asignatura_nombre || !formulario.grupo || !formulario.cuatrimestre || !formulario.aula) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (horarios.length === 0) {
      alert('Debe agregar al menos un horario para la asignatura');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profesor/asignaturas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formulario,
          horarios: horarios
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Asignatura registrada exitosamente');
        // Limpiar formulario
        setFormulario({
          asignatura_nombre: '',
          grupo: '',
          cuatrimestre: '',
          aula: '',
          periodo_academico: '2024-01'
        });
        setHorarios([]);
        // Recargar asignaturas registradas
        await cargarAsignaturasRegistradas();
      } else {
        alert('Error al registrar: ' + data.message);
      }
    } catch (error) {
      console.error('Error al guardar asignatura:', error);
      alert('Error al guardar la asignatura');
    }
  };

  // Eliminar asignatura registrada
  const eliminarAsignaturaRegistrada = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta asignatura?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/profesor/asignaturas/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          await cargarAsignaturasRegistradas(); // Recargar lista
        } else {
          alert('Error al eliminar: ' + data.message);
        }
      } catch (error) {
        console.error('Error al eliminar asignatura:', error);
        alert('Error al eliminar la asignatura');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
        <Header />
      <div className={styles.content}>
        
        {/* Encabezado */}
        <div className={styles.header}>
          <h1 className={styles.title}>Nuevas Asignaturas</h1>
          <p className={styles.subtitle}>Registra las asignaturas que impartirás este cuatrimestre</p>
        </div>

        <div className={styles.mainGrid}>
          
          {/* Formulario de Nueva Asignatura */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>🆕 Registrar Nueva Asignatura</h2>
            </div>
            
            <div className={styles.cardBody}>
              
              {/* Información Básica */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📋 Información Básica</h3>
                
                <div className={styles.formGrid}>
                  
                  {/* Nombre de la Asignatura */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre de la Asignatura *</label>
                    <input
                      type="text"
                      value={formulario.asignatura_nombre}
                      onChange={(e) => manejarCambioFormulario('asignatura_nombre', e.target.value)}
                      className={styles.input}
                      placeholder="Ej: Matemáticas Discretas"
                    />
                  </div>

                 

                  {/* Grupo */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Grupo *</label>
                    <input
                      type="text"
                      value={formulario.grupo}
                      onChange={(e) => manejarCambioFormulario('grupo', e.target.value)}
                      className={styles.input}
                      placeholder="Ej: 1A, 2B, TSU-1A"
                    />
                  </div>

                  {/* Cuatrimestre */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cuatrimestre *</label>
                    <select
                      value={formulario.cuatrimestre}
                      onChange={(e) => manejarCambioFormulario('cuatrimestre', e.target.value)}
                      className={styles.select}
                    >
                      <option value="">Seleccionar cuatrimestre</option>
                      {cuatrimestres.map(cuatri => (
                        <option key={cuatri.value} value={cuatri.value}>
                          {cuatri.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aula */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Aula *</label>
                    <input
                      type="text"
                      value={formulario.aula}
                      onChange={(e) => manejarCambioFormulario('aula', e.target.value)}
                      className={styles.input}
                      placeholder="Ej: A101, Lab1, Aula Magna"
                    />
                  </div>

                </div>
              </div>

              {/* Configuración de Horarios */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>🕐 Configuración de Horarios</h3>
                
                {/* Formulario para agregar horario */}
                <div className={styles.horarioForm}>
                  <div className={styles.horarioGrid}>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Día</label>
                      <select
                        value={horarioTemporal.dia}
                        onChange={(e) => manejarCambioHorario('dia', e.target.value)}
                        className={styles.select}
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
                      <label className={styles.label}>Hora Inicio</label>
                      <select
                        value={horarioTemporal.hora_inicio}
                        onChange={(e) => manejarCambioHorario('hora_inicio', e.target.value)}
                        className={styles.select}
                      >
                        <option value="">Hora inicio</option>
                        {horasDisponibles.map(hora => (
                          <option key={hora} value={hora}>{hora}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Hora Fin</label>
                      <select
                        value={horarioTemporal.hora_fin}
                        onChange={(e) => manejarCambioHorario('hora_fin', e.target.value)}
                        className={styles.select}
                      >
                        <option value="">Hora fin</option>
                        {horasDisponibles.map(hora => (
                          <option key={hora} value={hora}>{hora}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={agregarHorario}
                      className={styles.addHorarioBtn}
                      type="button"
                    >
                      ➕ Agregar
                    </button>

                  </div>
                </div>

                {/* Lista de horarios agregados */}
                {horarios.length > 0 && (
                  <div className={styles.horariosLista}>
                    <h4 className={styles.listaTitle}>Horarios Configurados:</h4>
                    <div className={styles.horariosGrid}>
                      {horarios.map(horario => (
                        <div key={horario.id} className={styles.horarioItem}>
                          <div className={styles.horarioInfo}>
                            <span className={styles.horarioDia}>
                              {diasSemana.find(d => d.value === horario.dia)?.label}
                            </span>
                            <span className={styles.horarioHoras}>
                              {horario.hora_inicio} - {horario.hora_fin}
                            </span>
                          </div>
                          <button
                            onClick={() => eliminarHorario(horario.id)}
                            className={styles.deleteHorarioBtn}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Botón Guardar */}
              <div className={styles.formActions}>
                <button
                  onClick={guardarAsignatura}
                  className={styles.saveBtn}
                >
                  💾 Guardar Asignatura
                </button>
              </div>

            </div>
          </div>

          {/* Lista de Asignaturas Registradas */}
          <div className={styles.listCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>📚 Mis Asignaturas Registradas</h2>
            </div>
            
            <div className={styles.cardBody}>
              {asignaturasRegistradas.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <p>No tienes asignaturas registradas aún</p>
                  <span>Completa el formulario para registrar tu primera asignatura</span>
                </div>
              ) : (
                <div className={styles.asignaturasLista}>
                  {asignaturasRegistradas.map(asignatura => (
                    <div key={asignatura.id} className={styles.asignaturaCard}>
                      
                      <div className={styles.asignaturaHeader}>
                        <div className={styles.asignaturaInfo}>
                          <h4 className={styles.asignaturaNombre}>
                            {asignatura.asignatura_nombre}
                          </h4>
                          <p className={styles.asignaturaDetalles}>
                            Grupo {asignatura.grupo} • {asignatura.cuatrimestre}° Cuatri
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarAsignaturaRegistrada(asignatura.id)}
                          className={styles.deleteBtn}
                          title="Eliminar asignatura"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className={styles.asignaturaBody}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Aula:</span>
                          <span className={styles.infoValue}>{asignatura.aula}</span>
                        </div>
                        
                        <div className={styles.horariosSection}>
                          <span className={styles.infoLabel}>Horarios:</span>
                          <div className={styles.horariosChips}>
                            {asignatura.horarios?.map((horario, index) => (
                              <span key={index} className={styles.horarioChip}>
                                {diasSemana.find(d => d.value === horario.dia)?.label} {horario.hora_inicio}-{horario.hora_fin}
                              </span>
                            )) || (
                              <span className={styles.sinHorarios}>Sin horarios registrados</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default NuevaAsignaturas;