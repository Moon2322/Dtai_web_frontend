import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header_profesor';
import styles from '../css/Admin_estudiantes_profesor.module.css';

const Admin_estudiantes_profesor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);


  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    carrera: '',
    estatus: '',
    grupo: ''
  });

  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estudianteEditando, setEstudianteEditando] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  
const [formulario, setFormulario] = useState({
  nombre: '',
  apellido: '',
  correo: '',
  matricula: '',
  grupo_id: '', // Solo necesitamos el grupo
  telefono: '',
  fecha_ingreso: new Date().toISOString().split('T')[0],
  estado_alumno: 'activo'
});
  const navigate = useNavigate();

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

// ✅ CORREGIR en Admin_estudiantes_profesor.jsx

// Cambiar esta función:
const cargarGruposProfesor = async () => {
  try {
    const token = localStorage.getItem('token');
    // ✅ CAMBIAR la URL de:
    // 'http://localhost:5000/api/profesor/grupos-tutor'
    // ✅ A:
    const response = await fetch('http://localhost:5000/api/profesor/estudiantes/grupos-tutor', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      setGrupos(data.data);
    }
  } catch (error) {
    console.error('Error al cargar grupos del profesor:', error);
  }
};

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Cargar estudiantes del profesor
      const estudiantesRes = await fetch('http://localhost:5000/api/profesor/estudiantes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Cargar carreras disponibles
      const carrerasRes = await fetch('http://localhost:5000/api/carreras', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const [estudiantesData, carrerasData] = await Promise.all([
        estudiantesRes.json(),
        carrerasRes.json()
      ]);

      if (estudiantesData.success) {
        setEstudiantes(estudiantesData.data);
      }

      if (carrerasData.success) {
        setCarreras(carrerasData.data);
      }
  await cargarGruposProfesor();

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    const coincideBusqueda = !filtros.busqueda || 
      estudiante.nombre_completo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      estudiante.matricula.includes(filtros.busqueda) ||
      estudiante.correo.toLowerCase().includes(filtros.busqueda.toLowerCase());

    const coincideCarrera = !filtros.carrera || estudiante.carrera_id.toString() === filtros.carrera;
    const coincideEstatus = !filtros.estatus || estudiante.estado_alumno === filtros.estatus;
    const coincideGrupo = !filtros.grupo || estudiante.grupo_codigo === filtros.grupo;

    return coincideBusqueda && coincideCarrera && coincideEstatus && coincideGrupo;
  });

  // Obtener grupos únicos
  const gruposUnicos = [...new Set(estudiantes.map(e => e.grupo_codigo))].filter(Boolean);

  // Obtener estados únicos
  const estadosUnicos = [...new Set(estudiantes.map(e => e.estado_alumno))];

  // Manejar cambios en filtros
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Abrir modal para agregar
const abrirModalAgregar = () => {
  setFormulario({
    nombre: '',
    apellido: '',
    correo: '',
    matricula: '',
    grupo_id: '',
    telefono: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    estado_alumno: 'activo'
  });
  setEstudianteEditando(null);
  setModoEdicion(false);
  setMostrarModal(true);
};

  // Abrir modal para editar
const abrirModalEditar = (estudiante) => {
  setFormulario({
    nombre: estudiante.nombre,
    apellido: estudiante.apellido,
    correo: estudiante.correo,
    matricula: estudiante.matricula,
    grupo_id: estudiante.grupo_id ? estudiante.grupo_id.toString() : '',
    telefono: estudiante.telefono || '',
    fecha_ingreso: estudiante.fecha_ingreso ? estudiante.fecha_ingreso.split('T')[0] : '',
    estado_alumno: estudiante.estado_alumno
  });
  setEstudianteEditando(estudiante);
  setModoEdicion(true);
  setMostrarModal(true);
};

  // Manejar cambios en formulario
  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Guardar estudiante (crear o actualizar)
  const guardarEstudiante = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = modoEdicion 
        ? `http://localhost:5000/api/profesor/estudiantes/${estudianteEditando.id}`
        : 'http://localhost:5000/api/profesor/estudiantes';
      
      const method = modoEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();
      
      if (data.success) {
        await cargarDatos(); // Recargar datos
        setMostrarModal(false);
        alert(modoEdicion ? 'Estudiante actualizado exitosamente' : 'Estudiante agregado exitosamente');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al guardar estudiante:', error);
      alert('Error al guardar el estudiante');
    }
  };

  // Eliminar estudiante
  const eliminarEstudiante = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/estudiantes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        await cargarDatos(); // Recargar datos
        alert('Estudiante eliminado exitosamente');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      alert('Error al eliminar el estudiante');
    }
  };

  // Cambiar estado del estudiante
  const cambiarEstadoEstudiante = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/estudiantes/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const data = await response.json();
      
      if (data.success) {
        await cargarDatos(); // Recargar datos
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del estudiante');
    }
  };

  // Función para obtener clase CSS según promedio
  const obtenerClasePromedio = (promedio) => {
    if (promedio >= 8.5) return styles.goodGrade;
    if (promedio >= 7.0) return styles.averageGrade;
    return styles.lowGrade;
  };

  // Función para obtener clase CSS según estado
  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'activo': return styles.active;
      case 'baja_temporal': return styles.trial;
      case 'egresado': return styles.graduated;
      case 'baja_definitiva': return styles.inactive;
      default: return styles.inactive;
    }
  };

  // Función para formatear estado
  const formatearEstado = (estado) => {
    const estados = {
      'activo': 'Activo',
      'baja_temporal': 'Baja Temporal',
      'egresado': 'Egresado',
      'baja_definitiva': 'Baja Definitiva'
    };
    return estados[estado] || estado;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={cargarDatos} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1>Gestión de Estudiantes</h1>
          <p>Administra a los estudiantes de tus grupos y asignaturas</p>
        </div>

        {/* Card con estadísticas */}
        <div className={styles.statsCard}>
          <div className={styles.statInfo}>
            <h3>Total de Estudiantes</h3>
            <div className={styles.totalNumber}>{estudiantesFiltrados.length}</div>
            <p>de {estudiantes.length} estudiantes en tus grupos</p>
          </div>
          <div className={styles.statIcon}>👥</div>
        </div>

        {/* Controles y filtros */}
        <div className={styles.controls}>
          <div className={styles.leftControls}>
            <button 
              className={styles.addButton}
              onClick={abrirModalAgregar}
            >
              + Agregar Estudiante
            </button>
          </div>
          
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula o email..."
              value={filtros.busqueda}
              onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
              className={styles.searchInput}
            />
            
            <select
              value={filtros.carrera}
              onChange={(e) => manejarCambioFiltro('carrera', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas las carreras</option>
              {carreras.map(carrera => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </select>

            <select
              value={filtros.grupo}
              onChange={(e) => manejarCambioFiltro('grupo', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los grupos</option>
              {gruposUnicos.map(grupo => (
                <option key={grupo} value={grupo}>{grupo}</option>
              ))}
            </select>
            
            <select
              value={filtros.estatus}
              onChange={(e) => manejarCambioFiltro('estatus', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los estatus</option>
              {estadosUnicos.map(estatus => (
                <option key={estatus} value={estatus}>
                  {formatearEstado(estatus)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de estudiantes */}
        <div className={styles.tableContainer}>
          <table className={styles.studentsTable}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Email</th>
                <th>Carrera</th>
                <th>Grupo</th>
                <th>Cuatrimestre</th>
                <th>Promedio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map(estudiante => (
                <tr key={estudiante.id}>
                  <td className={styles.nameCell}>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentName}>
                        {estudiante.nombre_completo}
                      </div>
                      <div className={styles.studentMatricula}>
                        {estudiante.matricula}
                      </div>
                    </div>
                  </td>
                  <td>{estudiante.correo}</td>
                  <td>{estudiante.carrera_nombre}</td>
                  <td className={styles.centerCell}>{estudiante.grupo_codigo || 'Sin grupo'}</td>
                  <td className={styles.centerCell}>{estudiante.cuatrimestre_actual}°</td>
                  <td className={styles.centerCell}>
                    <span className={`${styles.gradeCell} ${obtenerClasePromedio(estudiante.promedio_general)}`}>
{estudiante.promedio_general ? parseFloat(estudiante.promedio_general).toFixed(1) : 'S/P'}                    </span>
                  </td>
                  <td>
                    <select
                      value={estudiante.estado_alumno}
                      onChange={(e) => cambiarEstadoEstudiante(estudiante.id, e.target.value)}
                      className={`${styles.statusSelect} ${obtenerClaseEstado(estudiante.estado_alumno)}`}
                    >
                      <option value="activo">Activo</option>
                      <option value="baja_temporal">Baja Temporal</option>
                      <option value="egresado">Egresado</option>
                      <option value="baja_definitiva">Baja Definitiva</option>
                    </select>
                  </td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={styles.editButton}
                      onClick={() => abrirModalEditar(estudiante)}
                      title="Editar estudiante"
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => eliminarEstudiante(estudiante.id)}
                      title="Eliminar estudiante"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {estudiantesFiltrados.length === 0 && (
            <div className={styles.noResults}>
              <p>No se encontraron estudiantes con los filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Modal para agregar/editar estudiante */}
{mostrarModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2>{modoEdicion ? 'Editar Estudiante' : 'Agregar Estudiante'}</h2>
        <button 
          className={styles.closeButton}
          onClick={() => setMostrarModal(false)}
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={guardarEstudiante} className={styles.modalForm}>
        
        {/* Información Personal */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Nombre *</label>
            <input
              type="text"
              value={formulario.nombre}
              onChange={(e) => manejarCambioFormulario('nombre', e.target.value)}
              required
              placeholder="Ej. Juan Carlos"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Apellido *</label>
            <input
              type="text"
              value={formulario.apellido}
              onChange={(e) => manejarCambioFormulario('apellido', e.target.value)}
              required
              placeholder="Ej. García López"
            />
          </div>
        </div>

        {/* Información Académica */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Correo Electrónico *</label>
            <input
              type="email"
              value={formulario.correo}
              onChange={(e) => manejarCambioFormulario('correo', e.target.value)}
              required
              placeholder="estudiante@correo.com"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Matrícula *</label>
            <input
              type="text"
              value={formulario.matricula}
              onChange={(e) => manejarCambioFormulario('matricula', e.target.value)}
              required
              placeholder="20250001"
            />
          </div>
        </div>

        {/* Grupo (lo más importante) */}
        <div className={styles.formRow}>
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Asignar a Grupo *</label>
            <select
              value={formulario.grupo_id}
              onChange={(e) => manejarCambioFormulario('grupo_id', e.target.value)}
              required
              className={styles.selectGrupo}
            >
              <option value="">Seleccionar grupo</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  📚 {grupo.codigo} - {grupo.carrera_nombre} ({grupo.cuatrimestre}° Cuatrimestre)
                  {grupo.estudiantes_actuales < grupo.capacidad_maxima ? 
                    ` - ${grupo.capacidad_maxima - grupo.estudiantes_actuales} lugares disponibles` :
                    ' - LLENO'
                  }
                </option>
              ))}
            </select>
            <small className={styles.helpText}>
              El grupo determina automáticamente la carrera y cuatrimestre del estudiante
            </small>
          </div>
        </div>

        {/* Información Adicional (Opcional) */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Teléfono</label>
            <input
              type="tel"
              value={formulario.telefono}
              onChange={(e) => manejarCambioFormulario('telefono', e.target.value)}
              placeholder="442 123 4567"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Fecha de Ingreso</label>
            <input
              type="date"
              value={formulario.fecha_ingreso}
              onChange={(e) => manejarCambioFormulario('fecha_ingreso', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Estado del Estudiante</label>
            <select
              value={formulario.estado_alumno}
              onChange={(e) => manejarCambioFormulario('estado_alumno', e.target.value)}
            >
              <option value="activo">✅ Activo</option>
              <option value="baja_temporal">⏸️ Baja Temporal</option>
              <option value="egresado">🎓 Egresado</option>
              <option value="baja_definitiva">❌ Baja Definitiva</option>
            </select>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => setMostrarModal(false)}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
          >
            {modoEdicion ? '💾 Actualizar' : '➕ Agregar Estudiante'}
          </button>
        </div>
      </form>
    </div>
  </div>
        )}

      </main>
    </div>
  );
};

export default Admin_estudiantes_profesor;