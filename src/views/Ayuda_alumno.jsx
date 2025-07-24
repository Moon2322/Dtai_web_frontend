import React, { useState, useEffect } from 'react';
import styles from '../css/Ayuda_alumno.module.css';
import Header from '../components/header_profesor.jsx';

const AyudaAlumno = () => {
  // Estado para almacenar todas las solicitudes
  const [solicitudes, setSolicitudes] = useState([
    {   
      id: 1,
      alumno_nombre: "Ana García López",
      matricula: "2024001",
      email: "ana.garcia@estudiante.edu.mx",
      telefono: "442-123-4567",
      urgencia: "alta",
      estado: "pendiente",
      fecha_creacion: "2024-03-15T10:30:00",
      asunto: "Problema con calificaciones",
      descripcion: "Hola, tengo un problema con mis calificaciones del cuatrimestre pasado. En el sistema aparece que reprobé Matemáticas pero yo tengo el examen aprobado. Adjunto evidencias. Por favor revisen mi caso ya que esto afecta mi beca de excelencia académica.",
      categoria: "Académico"
    },
    {
      id: 2,
      alumno_nombre: "Carlos Mendoza Ruiz",
      matricula: "2024002",
      email: "carlos.mendoza@estudiante.edu.mx", 
      telefono: "442-987-6543",
      urgencia: "media",
      estado: "en_proceso",
      fecha_creacion: "2024-03-14T14:20:00",
      asunto: "Solicitud de cambio de grupo",
      descripcion: "Buenos días, necesito solicitar un cambio de grupo porque por motivos laborales no puedo asistir a las clases en el horario matutino. Mi jefe me cambió el turno y ahora trabajo de 6 AM a 2 PM. ¿Es posible cambiarme al grupo vespertino?",
      categoria: "Administrativo"
    },
    {
      id: 3,
      alumno_nombre: "María González Sánchez",
      matricula: "2024003",
      email: "maria.gonzalez@estudiante.edu.mx",
      telefono: "442-555-1234",
      urgencia: "baja",
      estado: "resuelto",
      fecha_creacion: "2024-03-13T09:15:00",
      asunto: "Información sobre becas",
      descripcion: "Hola, me gustaría obtener información sobre las becas disponibles para el próximo cuatrimestre. ¿Cuáles son los requisitos y cuándo es la fecha límite para aplicar?",
      categoria: "Información"
    },
    {
      id: 4,
      alumno_nombre: "Juan Pérez Martín",
      matricula: "2024004",
      email: "juan.perez@estudiante.edu.mx",
      telefono: "442-333-7890",
      urgencia: "alta",
      estado: "pendiente",
      fecha_creacion: "2024-03-16T16:45:00",
      asunto: "Problema de acceso al sistema",
      descripcion: "Urgente: No puedo acceder al sistema académico desde hace 3 días. He intentado recuperar mi contraseña pero no llegan los correos. Tengo que entregar trabajos importantes y el plazo vence mañana. Por favor ayuda inmediata.",
      categoria: "Técnico"
    }
  ]);

  // Estados para filtros y modal
  const [filtros, setFiltros] = useState({
    busqueda: '',
    urgencia: '',
    estado: '',
    categoria: ''
  });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensajesChat, setMensajesChat] = useState([]);
const [nuevoMensaje, setNuevoMensaje] = useState('');
const [enviandoMensaje, setEnviandoMensaje] = useState(false);

// Función para cargar mensajes del chat
const cargarMensajesChat = async (solicitudId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/profesor/solicitudes-ayuda/${solicitudId}/chat`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setMensajesChat(data.data);
    }
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
  }
};

// Función para enviar mensaje
const enviarMensaje = async () => {
  if (!nuevoMensaje.trim() || enviandoMensaje) return;

  try {
    setEnviandoMensaje(true);
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/profesor/solicitudes-ayuda/${solicitudSeleccionada.id}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mensaje: nuevoMensaje })
    });

    const data = await response.json();
    if (data.success) {
      setNuevoMensaje('');
      cargarMensajesChat(solicitudSeleccionada.id);
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
  } finally {
    setEnviandoMensaje(false);
  }
};

// Modificar la función verDetalles para cargar mensajes
const verDetalles = (solicitud) => {
  setSolicitudSeleccionada(solicitud);
  setMostrarModal(true);
  cargarMensajesChat(solicitud.id);
};

  // Opciones para filtros
  const opcionesUrgencia = [
    { value: 'baja', label: 'Baja', color: '#10b981' },
    { value: 'media', label: 'Media', color: '#f59e0b' },
    { value: 'alta', label: 'Alta', color: '#ef4444' }
  ];

  const opcionesEstado = [
    { value: 'pendiente', label: 'Pendiente', color: '#ef4444' },
    { value: 'en_proceso', label: 'En Proceso', color: '#f59e0b' },
    { value: 'resuelto', label: 'Resuelto', color: '#10b981' }
  ];

  const opcionesCategorias = [
    { value: 'academico', label: 'Académico' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'informacion', label: 'Información' }
  ];

  // Cargar solicitudes desde el backend
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/profesor/solicitudes-ayuda', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSolicitudes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const coincideBusqueda = !filtros.busqueda || 
      solicitud.alumno_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      solicitud.matricula.includes(filtros.busqueda) ||
      solicitud.email.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      solicitud.asunto.toLowerCase().includes(filtros.busqueda.toLowerCase());

    const coincideUrgencia = !filtros.urgencia || solicitud.urgencia === filtros.urgencia;
    const coincideEstado = !filtros.estado || solicitud.estado === filtros.estado;
    const coincideCategoria = !filtros.categoria || solicitud.categoria.toLowerCase() === filtros.categoria;

    return coincideBusqueda && coincideUrgencia && coincideEstado && coincideCategoria;
  });

  // Contar solicitudes por estado
  const contarPorEstado = () => {
    const conteo = {
      total: solicitudes.length,
      pendiente: solicitudes.filter(s => s.estado === 'pendiente').length,
      en_proceso: solicitudes.filter(s => s.estado === 'en_proceso').length,
      resuelto: solicitudes.filter(s => s.estado === 'resuelto').length
    };
    return conteo;
  };

  const estadisticas = contarPorEstado();

  // Manejar cambios en filtros
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };



  // Cambiar estado de una solicitud
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
const response = await fetch(`http://localhost:5000/api/profesor/solicitudes-ayuda/${id}/estado`, {
          method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar estado local
        setSolicitudes(prev => prev.map(s => 
          s.id === id ? { ...s, estado: nuevoEstado } : s
        ));
        // Actualizar también si está abierto el modal
        if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
          setSolicitudSeleccionada(prev => ({ ...prev, estado: nuevoEstado }));
        }
      } else {
        alert('Error al cambiar estado: ' + data.message);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la solicitud');
    }
  };

  // Obtener clase CSS para urgencia
  const obtenerClaseUrgencia = (urgencia) => {
    switch (urgencia) {
      case 'baja': return styles.urgenciaBaja;
      case 'media': return styles.urgenciaMedia;
      case 'alta': return styles.urgenciaAlta;
      default: return styles.urgenciaBaja;
    }
  };

  // Obtener clase CSS para estado
  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'pendiente': return styles.estadoPendiente;
      case 'en_proceso': return styles.estadoEnProceso;
      case 'resuelto': return styles.estadoResuelto;
      default: return styles.estadoPendiente;
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando solicitudes...</p>
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
          <h1 className={styles.title}>Centro de Ayuda - Solicitudes de Alumnos</h1>
          <p className={styles.subtitle}>Gestiona y responde a las solicitudes de ayuda de los estudiantes</p>
        </div>

        {/* Estadísticas */}
        <div className={styles.statsGrid}>
          
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statContent}>
              <h3>Total</h3>
              <p>{estadisticas.total}</p>
            </div>
            <span className={styles.statIcon}>📊</span>
          </div>

          <div className={`${styles.statCard} ${styles.statPendiente}`}>
            <div className={styles.statContent}>
              <h3>Pendientes</h3>
              <p>{estadisticas.pendiente}</p>
            </div>
            <span className={styles.statIcon}>⏳</span>
          </div>

          <div className={`${styles.statCard} ${styles.statProceso}`}>
            <div className={styles.statContent}>
              <h3>En Proceso</h3>
              <p>{estadisticas.en_proceso}</p>
            </div>
            <span className={styles.statIcon}>🔄</span>
          </div>

          <div className={`${styles.statCard} ${styles.statResuelto}`}>
            <div className={styles.statContent}>
              <h3>Resueltas</h3>
              <p>{estadisticas.resuelto}</p>
            </div>
            <span className={styles.statIcon}>✅</span>
          </div>

        </div>

        {/* Filtros */}
        <div className={styles.filtersCard}>
          <h3 className={styles.filtersTitle}>🔍 Filtros y Búsqueda</h3>
          
          <div className={styles.filtersGrid}>
            
            {/* Búsqueda general */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Buscar</label>
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
                className={styles.filterInput}
                placeholder="Nombre, matrícula, email o asunto..."
              />
            </div>

            {/* Filtro por urgencia */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Urgencia</label>
              <select
                value={filtros.urgencia}
                onChange={(e) => manejarCambioFiltro('urgencia', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas las urgencias</option>
                {opcionesUrgencia.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => manejarCambioFiltro('estado', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los estados</option>
                {opcionesEstado.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por categoría */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) => manejarCambioFiltro('categoria', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas las categorías</option>
                {opcionesCategorias.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Tabla de Solicitudes */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>📋 Solicitudes de Ayuda ({solicitudesFiltradas.length})</h3>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Contacto</th>
                  <th>Asunto</th>
                  <th>Urgencia</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id} className={styles.tableRow}>
                    
                    {/* Alumno */}
                    <td>
                      <div className={styles.alumnoInfo}>
                        <div className={styles.alumnoNombre}>
                          {solicitud.alumno_nombre}
                        </div>
                        <div className={styles.alumnoMatricula}>
                          {solicitud.matricula}
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td>
                      <div className={styles.contactoInfo}>
                        <div className={styles.contactoEmail}>
                          📧 {solicitud.email}
                        </div>
                        <div className={styles.contactoTelefono}>
                          📱 {solicitud.telefono}
                        </div>
                      </div>
                    </td>

                    {/* Asunto */}
                    <td>
                      <div className={styles.asuntoInfo}>
                        <div className={styles.asuntoTitulo}>
                          {solicitud.asunto}
                        </div>
                        <div className={styles.asuntoCategoria}>
                          {solicitud.categoria}
                        </div>
                      </div>
                    </td>

                    {/* Urgencia */}
                    <td>
                      <span className={`${styles.urgenciaBadge} ${obtenerClaseUrgencia(solicitud.urgencia)}`}>
                        {opcionesUrgencia.find(u => u.value === solicitud.urgencia)?.label}
                      </span>
                    </td>

                    {/* Estado */}
                    <td>
                      <select
                        value={solicitud.estado}
                        onChange={(e) => cambiarEstado(solicitud.id, e.target.value)}
                        className={`${styles.estadoSelect} ${obtenerClaseEstado(solicitud.estado)}`}
                      >
                        {opcionesEstado.map(opcion => (
                          <option key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Fecha */}
                    <td>
                      <span className={styles.fecha}>
                        {formatearFecha(solicitud.fecha_creacion)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <button
                        onClick={() => verDetalles(solicitud)}
                        className={styles.verDetallesBtn}
                        title="Ver detalles completos"
                      >
                        👁️ Ver Detalles
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mensaje si no hay solicitudes */}
            {solicitudesFiltradas.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <p>No se encontraron solicitudes</p>
                <span>Ajusta los filtros o espera a que lleguen nuevas solicitudes</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal de Detalles */}
      {mostrarModal && solicitudSeleccionada && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Header del Modal */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                📋 Detalles de la Solicitud #{solicitudSeleccionada.id}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className={styles.closeButton}
              >
                ❌
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className={styles.modalBody}>
              
              {/* Información del Estudiante */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>👤 Información del Estudiante</h4>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <label>Nombre:</label>
                    <span>{solicitudSeleccionada.alumno_nombre}</span>
                  </div>
                  <div className={styles.modalField}>
                    <label>Matrícula:</label>
                    <span>{solicitudSeleccionada.matricula}</span>
                  </div>
                  <div className={styles.modalField}>
                    <label>Email:</label>
                    <span>{solicitudSeleccionada.email}</span>
                  </div>
                  <div className={styles.modalField}>
                    <label>Teléfono:</label>
                    <span>{solicitudSeleccionada.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Información de la Solicitud */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>📝 Información de la Solicitud</h4>
                <div className={styles.modalGrid}>
                  
                  <div className={styles.modalField}>
                    <label>Categoría:</label>
                    <span>{solicitudSeleccionada.categoria}</span>
                  </div>
                  <div className={styles.modalField}>
                    <label>Urgencia:</label>
                    <span className={`${styles.urgenciaBadge} ${obtenerClaseUrgencia(solicitudSeleccionada.urgencia)}`}>
                      {opcionesUrgencia.find(u => u.value === solicitudSeleccionada.urgencia)?.label}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <label>Estado:</label>
                    <span className={`${styles.estadoBadge} ${obtenerClaseEstado(solicitudSeleccionada.estado)}`}>
                      {opcionesEstado.find(e => e.value === solicitudSeleccionada.estado)?.label}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <label>Fecha de Creación:</label>
                    <span>{formatearFecha(solicitudSeleccionada.fecha_creacion)}</span>
                  </div>
                </div>
              </div>

              {/* Descripción Completa */}
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>📖 Descripción Completa</h4>
                <div className={styles.descripcionCompleta}>
  <span className="detail-value">{solicitudSeleccionada?.asunto}</span>
                </div>
              </div>

              {/* Sección de Chat */}
<div className="chat-section">
  <h4>Conversación</h4>
  <div className="chat-messages">
    {mensajesChat.map(mensaje => (
      <div key={mensaje.id} className={`mensaje ${mensaje.tipo_usuario}`}>
        <div className="mensaje-header">
          <strong>{mensaje.nombre_usuario}</strong>
          <span className="fecha">{new Date(mensaje.fecha_mensaje).toLocaleString()}</span>
        </div>
        <div className="mensaje-contenido">{mensaje.mensaje}</div>
      </div>
    ))}
  </div>
  
  <div className="chat-input">
    <textarea
      value={nuevoMensaje}
      onChange={(e) => setNuevoMensaje(e.target.value)}
      placeholder="Escribe tu respuesta..."
      rows="3"
    />
    <button onClick={enviarMensaje} disabled={enviandoMensaje}>
      {enviandoMensaje ? 'Enviando...' : 'Enviar'}
    </button>
  </div>
</div>

            </div>

            {/* Footer del Modal */}
            <div className={styles.modalFooter}>
              <div className={styles.modalActions}>
                <select
                  value={solicitudSeleccionada.estado}
                  onChange={(e) => {
                    cambiarEstado(solicitudSeleccionada.id, e.target.value);
                  }}
                  className={`${styles.estadoSelect} ${obtenerClaseEstado(solicitudSeleccionada.estado)}`}
                >
                  {opcionesEstado.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setMostrarModal(false)}
                  className={styles.cerrarBtn}
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AyudaAlumno;