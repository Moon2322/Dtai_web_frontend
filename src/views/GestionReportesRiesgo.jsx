// src/views/GestionReportesRiesgo.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header_profesor';
import styles from '../css/GestionReportesRiesgo.module.css';

const GestionReportesRiesgo = () => {
    const navigate = useNavigate();
    
    // ============== ESTADOS ==============
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para modales
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
    
    // Estados para filtros
    const [filtros, setFiltros] = useState({
        tipo_riesgo: '',
        nivel_riesgo: '',
        estado: ''
    });
    
    // Estados para formularios
    const [nuevoReporte, setNuevoReporte] = useState({
        alumno_id: '',
        tipo_riesgo: '',
        nivel_riesgo: '',
        descripcion: '',
        observaciones: '',
        acciones_recomendadas: ''
    });
    
    const [reporteEditar, setReporteEditar] = useState({});
    const [reporteDetalle, setReporteDetalle] = useState(null);
    const [seguimientoDetalle, setSeguimientoDetalle] = useState([]);
    
    // Estados para búsqueda de alumnos
    const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
    
    // Estados para paginación
    const [paginacion, setPaginacion] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 10
    });

    // ============== EFECTOS ==============
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

        cargarReportes();
    }, [navigate, filtros, paginacion.current_page]);

useEffect(() => {
    if (mostrarModalCrear) {
        cargarAlumnosTutorados();
    }
}, [mostrarModalCrear]);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';


    // ============== FUNCIONES DE API ==============
    const cargarReportes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const params = new URLSearchParams({
                page: paginacion.current_page,
                limit: paginacion.items_per_page,
                ...filtros
            });
            
        const response = await fetch(`${API_BASE_URL}/api/reportes-riesgo?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setReportes(data.data.reportes);
                setPaginacion(data.data.pagination);
            } else {
                setError(data.message || 'Error al cargar reportes');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

const cargarAlumnosTutorados = async () => {
    try {
        setCargandoAlumnos(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/reportes-riesgo/alumnos/search?q=`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            setAlumnosDisponibles(data.data);
        } else {
            setError('Error al cargar alumnos tutorados');
        }
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        setError('Error al cargar alumnos');
    } finally {
        setCargandoAlumnos(false);
    }
};

   const crearReporte = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Enviando reporte:', nuevoReporte); // ✅ Debug
        
        const response = await fetch(`${API_BASE_URL}/api/reportes-riesgo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoReporte)
        });
        
        console.log('Status de respuesta:', response.status); // ✅ Debug
        console.log('Response OK:', response.ok); // ✅ Debug
        
        // ✅ Verificar si la respuesta tiene contenido
        const text = await response.text();
        console.log('Respuesta como texto:', text); // ✅ Debug
        
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            setError('Respuesta inválida del servidor');
            return;
        }
        
        if (response.ok && data.success) {
            setSuccess('Reporte creado exitosamente');
            setMostrarModalCrear(false);
            limpiarFormulario();
            cargarReportes();
        } else {
            setError(data.message || `Error del servidor: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        setError('Error de conexión al servidor');
    } finally {
        setLoading(false);
    }
};

    const actualizarReporte = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
const response = await fetch(`${API_BASE_URL}/api/reportes-riesgo/${reporteEditar.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reporteEditar)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSuccess('Reporte actualizado exitosamente');
                setMostrarModalEditar(false);
                cargarReportes();
            } else {
                setError(data.message || 'Error al actualizar reporte');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    const eliminarReporte = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
            return;
        }
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
const response = await fetch(`${API_BASE_URL}/api/reportes-riesgo/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSuccess('Reporte eliminado exitosamente');
                cargarReportes();
            } else {
                setError(data.message || 'Error al eliminar reporte');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
const response = await fetch(`${API_BASE_URL}/api/reportes-riesgo/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setReporteDetalle(data.data.reporte);
                setSeguimientoDetalle(data.data.seguimiento);
                setMostrarModalDetalle(true);
            } else {
                setError(data.message || 'Error al cargar detalle');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión al servidor');
        } finally {
            setLoading(false);
        }
    };

    // ============== FUNCIONES AUXILIARES ==============
    const limpiarFormulario = () => {
        setNuevoReporte({
            alumno_id: '',
            tipo_riesgo: '',
            nivel_riesgo: '',
            descripcion: '',
            observaciones: '',
            acciones_recomendadas: ''
        });
         setAlumnosDisponibles([]);

    };



    const limpiarMensajes = () => {
        setError('');
        setSuccess('');
    };

    const obtenerClaseNivel = (nivel) => {
        const clases = {
            'bajo': styles.nivelBajo,
            'medio': styles.nivelMedio,
            'alto': styles.nivelAlto,
            'critico': styles.nivelCritico
        };
        return clases[nivel] || '';
    };

    const obtenerClaseEstado = (estado) => {
        const clases = {
            'abierto': styles.estadoAbierto,
            'en_proceso': styles.estadoProceso,
            'resuelto': styles.estadoResuelto,
            'cerrado': styles.estadoCerrado
        };
        return clases[estado] || '';
    };

    const obtenerClaseTipo = (tipo) => {
        const clases = {
            'academico': styles.tipoAcademico,
            'asistencia': styles.tipoAsistencia,
            'conducta': styles.tipoConducta,
            'economico': styles.tipoEconomico,
            'personal': styles.tipoPersonal
        };
        return clases[tipo] || '';
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============== RENDER ==============
    if (loading && reportes.length === 0) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.mainContent}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Cargando reportes de riesgo...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            
            <div className={styles.mainContent}>
                {/* Header de la página */}
                <div className={styles.pageHeader}>
                    <h1>Gestión de Reportes de Riesgo</h1>
                    <p>Administra los reportes de riesgo académico de los estudiantes</p>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className={styles.alertError}>
                        {error}
                        <button onClick={limpiarMensajes} className={styles.btnClose}>×</button>
                    </div>
                )}
                
                {success && (
                    <div className={styles.alertSuccess}>
                        {success}
                        <button onClick={limpiarMensajes} className={styles.btnClose}>×</button>
                    </div>
                )}

                {/* Controles superiores */}
                <div className={styles.controls}>
                    <div className={styles.filters}>
                        <select 
                            value={filtros.tipo_riesgo} 
                            onChange={(e) => setFiltros({...filtros, tipo_riesgo: e.target.value})}
                            className={styles.filterSelect}
                        >
                            <option value="">Todos los tipos</option>
                            <option value="academico">Académico</option>
                            <option value="asistencia">Asistencia</option>
                            <option value="conducta">Conducta</option>
                            <option value="economico">Económico</option>
                            <option value="personal">Personal</option>
                        </select>

                        <select 
                            value={filtros.nivel_riesgo} 
                            onChange={(e) => setFiltros({...filtros, nivel_riesgo: e.target.value})}
                            className={styles.filterSelect}
                        >
                            <option value="">Todos los niveles</option>
                            <option value="bajo">Bajo</option>
                            <option value="medio">Medio</option>
                            <option value="alto">Alto</option>
                            <option value="critico">Crítico</option>
                        </select>

                        <select 
                            value={filtros.estado} 
                            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                            className={styles.filterSelect}
                        >
                            <option value="">Todos los estados</option>
                            <option value="abierto">Abierto</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="cerrado">Cerrado</option>
                        </select>
                    </div>

                    <button 
                        className={styles.addButton}
                        onClick={() => setMostrarModalCrear(true)}
                    >
                        + Nuevo Reporte
                    </button>
                </div>

                {/* Tabla de reportes */}
                <div className={styles.tableContainer}>
                    <table className={styles.studentsTable}>
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Matrícula</th>
                                <th>Tipo</th>
                                <th>Nivel</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.length > 0 ? (
                                reportes.map(reporte => (
                                    <tr key={reporte.id}>
                                        <td>
                                            <div className={styles.studentInfo}>
                                                <span className={styles.studentName}>
                                                    {reporte.alumno_nombre} {reporte.alumno_apellido}
                                                </span>
                                                <small>{reporte.carrera_nombre}</small>
                                            </div>
                                        </td>
                                        <td>{reporte.matricula}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${obtenerClaseTipo(reporte.tipo_riesgo)}`}>
                                                {reporte.tipo_riesgo}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${obtenerClaseNivel(reporte.nivel_riesgo)}`}>
                                                {reporte.nivel_riesgo}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${obtenerClaseEstado(reporte.estado)}`}>
                                                {reporte.estado}
                                            </span>
                                        </td>
                                        <td>{formatearFecha(reporte.fecha_reporte)}</td>
                                        <td>
                                            <div className={styles.actionsCell}>
                                                <button 
                                                    className={styles.editButton}
                                                    onClick={() => verDetalle(reporte.id)}
                                                    title="Ver detalle"
                                                >
                                                    👁️
                                                </button>
                                                <button 
                                                    className={styles.editButton}
                                                    onClick={() => {
                                                        setReporteEditar(reporte);
                                                        setMostrarModalEditar(true);
                                                    }}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className={styles.deleteButton}
                                                    onClick={() => eliminarReporte(reporte.id)}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className={styles.noResults}>
                                        No se encontraron reportes de riesgo
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    {paginacion.total_pages > 1 && (
                        <div className={styles.pagination}>
                            <button 
                                disabled={paginacion.current_page === 1}
                                onClick={() => setPaginacion({...paginacion, current_page: paginacion.current_page - 1})}
                                className={styles.paginationButton}
                            >
                                Anterior
                            </button>
                            
                            <span className={styles.paginationInfo}>
                                Página {paginacion.current_page} de {paginacion.total_pages}
                                ({paginacion.total_items} reportes total)
                            </span>
                            
                            <button 
                                disabled={paginacion.current_page === paginacion.total_pages}
                                onClick={() => setPaginacion({...paginacion, current_page: paginacion.current_page + 1})}
                                className={styles.paginationButton}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear Reporte */}
            {mostrarModalCrear && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nuevo Reporte de Riesgo</h2>
                            <button 
                                className={styles.modalCloseButton}
                                onClick={() => {
                                    setMostrarModalCrear(false);
                                    limpiarFormulario();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalForm}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                crearReporte();
                            }}>
                                {/* Búsqueda de alumno */}
                                <div className={styles.formGroup}>
    <label>Seleccionar Alumno *</label>
    <select
        value={nuevoReporte.alumno_id}
        onChange={(e) => setNuevoReporte({...nuevoReporte, alumno_id: e.target.value})}
        className={styles.filterSelect}
        required
        disabled={cargandoAlumnos}
    >
        <option value="">
            {cargandoAlumnos ? 'Cargando alumnos...' : 'Selecciona un alumno'}
        </option>
        {alumnosDisponibles.map(alumno => (
            <option key={alumno.id} value={alumno.id}>
                {alumno.nombre} {alumno.apellido} - {alumno.matricula} ({alumno.carrera_nombre})
            </option>
        ))}
    </select>
    {alumnosDisponibles.length === 0 && !cargandoAlumnos && (
        <small style={{color: '#6c757d', marginTop: '5px', display: 'block'}}>
            No tienes alumnos asignados como tutor
        </small>
    )}
</div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Riesgo *</label>
                                        <select
                                            value={nuevoReporte.tipo_riesgo}
                                            onChange={(e) => setNuevoReporte({...nuevoReporte, tipo_riesgo: e.target.value})}
                                            className={styles.filterSelect}
                                            required
                                        >
                                            <option value="">Selecciona un tipo</option>
                                            <option value="academico">Académico</option>
                                            <option value="asistencia">Asistencia</option>
                                            <option value="conducta">Conducta</option>
                                            <option value="economico">Económico</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Nivel de Riesgo *</label>
                                        <select
                                            value={nuevoReporte.nivel_riesgo}
                                            onChange={(e) => setNuevoReporte({...nuevoReporte, nivel_riesgo: e.target.value})}
                                            className={styles.filterSelect}
                                            required
                                        >
                                            <option value="">Selecciona un nivel</option>
                                            <option value="bajo">Bajo</option>
                                            <option value="medio">Medio</option>
                                            <option value="alto">Alto</option>
                                            <option value="critico">Crítico</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Descripción del Problema *</label>
                                    <textarea
                                        value={nuevoReporte.descripcion}
                                        onChange={(e) => setNuevoReporte({...nuevoReporte, descripcion: e.target.value})}
                                        placeholder="Describe detalladamente el problema identificado..."
                                        rows="4"
                                        className={styles.textArea}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Observaciones</label>
                                    <textarea
                                        value={nuevoReporte.observaciones}
                                        onChange={(e) => setNuevoReporte({...nuevoReporte, observaciones: e.target.value})}
                                        placeholder="Observaciones adicionales..."
                                        rows="3"
                                        className={styles.textArea}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Acciones Recomendadas</label>
                                    <textarea
                                        value={nuevoReporte.acciones_recomendadas}
                                        onChange={(e) => setNuevoReporte({...nuevoReporte, acciones_recomendadas: e.target.value})}
                                        placeholder="Acciones que recomiendas para resolver el problema..."
                                        rows="3"
                                        className={styles.textArea}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button 
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => {
                                            setMostrarModalCrear(false);
                                            limpiarFormulario();
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={loading}
                                    >
                                        {loading ? 'Creando...' : 'Crear Reporte'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Reporte */}
            {mostrarModalEditar && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Editar Reporte de Riesgo</h2>
                            <button 
                                className={styles.modalCloseButton}
                                onClick={() => setMostrarModalEditar(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalForm}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                actualizarReporte();
                            }}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Riesgo</label>
                                        <select
                                            value={reporteEditar.tipo_riesgo || ''}
                                            onChange={(e) => setReporteEditar({...reporteEditar, tipo_riesgo: e.target.value})}
                                            className={styles.filterSelect}
                                        >
                                            <option value="academico">Académico</option>
                                            <option value="asistencia">Asistencia</option>
                                            <option value="conducta">Conducta</option>
                                            <option value="economico">Económico</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Nivel de Riesgo</label>
                                        <select
                                            value={reporteEditar.nivel_riesgo || ''}
                                            onChange={(e) => setReporteEditar({...reporteEditar, nivel_riesgo: e.target.value})}
                                            className={styles.filterSelect}
                                        >
                                            <option value="bajo">Bajo</option>
                                            <option value="medio">Medio</option>
                                            <option value="alto">Alto</option>
                                            <option value="critico">Crítico</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Estado</label>
                                    <select
                                        value={reporteEditar.estado || ''}
                                        onChange={(e) => setReporteEditar({...reporteEditar, estado: e.target.value})}
                                        className={styles.filterSelect}
                                    >
                                        <option value="abierto">Abierto</option>
                                        <option value="en_proceso">En Proceso</option>
                                        <option value="resuelto">Resuelto</option>
                                        <option value="cerrado">Cerrado</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Descripción</label>
                                    <textarea
                                        value={reporteEditar.descripcion || ''}
                                        onChange={(e) => setReporteEditar({...reporteEditar, descripcion: e.target.value})}
                                        rows="4"
                                        className={styles.textArea}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Comentario de Seguimiento</label>
                                    <textarea
                                        value={reporteEditar.comentario_seguimiento || ''}
                                        onChange={(e) => setReporteEditar({...reporteEditar, comentario_seguimiento: e.target.value})}
                                        placeholder="Agregar comentario al historial..."
                                        rows="2"
                                        className={styles.textArea}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button 
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => setMostrarModalEditar(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={loading}
                                    >
                                        {loading ? 'Actualizando...' : 'Actualizar Reporte'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle del Reporte */}
            {mostrarModalDetalle && reporteDetalle && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalLarge}>
                        <div className={styles.modalHeader}>
                            <h2>Detalle del Reporte de Riesgo</h2>
                            <button 
                                className={styles.modalCloseButton}
                                onClick={() => setMostrarModalDetalle(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalForm}>
                            <div className={styles.detalleReporte}>
                                <div className={styles.infoPrincipal}>
                                    <div className={styles.infoAlumno}>
                                        <h3>Información del Alumno</h3>
                                        <p><strong>Nombre:</strong> {reporteDetalle.alumno_nombre} {reporteDetalle.alumno_apellido}</p>
                                        <p><strong>Matrícula:</strong> {reporteDetalle.matricula}</p>
                                        <p><strong>Carrera:</strong> {reporteDetalle.carrera_nombre}</p>
                                        <p><strong>Cuatrimestre:</strong> {reporteDetalle.cuatrimestre_actual}</p>
                                    </div>

                                    <div className={styles.infoReporte}>
                                        <h3>Información del Reporte</h3>
                                        <p><strong>Tipo:</strong> 
                                            <span className={`${styles.statusBadge} ${obtenerClaseTipo(reporteDetalle.tipo_riesgo)}`}>
                                                {reporteDetalle.tipo_riesgo}
                                            </span>
                                        </p>
                                        <p><strong>Nivel:</strong> 
                                            <span className={`${styles.statusBadge} ${obtenerClaseNivel(reporteDetalle.nivel_riesgo)}`}>
                                                {reporteDetalle.nivel_riesgo}
                                            </span>
                                        </p>
                                        <p><strong>Estado:</strong> 
                                            <span className={`${styles.statusBadge} ${obtenerClaseEstado(reporteDetalle.estado)}`}>
                                                {reporteDetalle.estado}
                                            </span>
                                        </p>
                                        <p><strong>Profesor:</strong> {reporteDetalle.profesor_nombre} {reporteDetalle.profesor_apellido}</p>
                                        <p><strong>Fecha:</strong> {formatearFecha(reporteDetalle.fecha_reporte)}</p>
                                    </div>
                                </div>

                                <div className={styles.contenidoReporte}>
                                    <div className={styles.seccion}>
                                        <h4>Descripción del Problema</h4>
                                        <p>{reporteDetalle.descripcion}</p>
                                    </div>

                                    {reporteDetalle.observaciones && (
                                        <div className={styles.seccion}>
                                            <h4>Observaciones</h4>
                                            <p>{reporteDetalle.observaciones}</p>
                                        </div>
                                    )}

                                    {reporteDetalle.acciones_recomendadas && (
                                        <div className={styles.seccion}>
                                            <h4>Acciones Recomendadas</h4>
                                            <p>{reporteDetalle.acciones_recomendadas}</p>
                                        </div>
                                    )}

                                    {reporteDetalle.resolucion && (
                                        <div className={styles.seccion}>
                                            <h4>Resolución</h4>
                                            <p>{reporteDetalle.resolucion}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Historial de seguimiento */}
                                {seguimientoDetalle.length > 0 && (
                                    <div className={styles.seguimiento}>
                                        <h3>Historial de Seguimiento</h3>
                                        <div className={styles.timeline}>
                                            {seguimientoDetalle.map(item => (
                                                <div key={item.id} className={styles.timelineItem}>
                                                    <div className={styles.timelineMarker}></div>
                                                    <div className={styles.timelineContent}>
                                                        <div className={styles.timelineHeader}>
                                                            <span className={styles.accion}>{item.accion}</span>
                                                            <span className={styles.fecha}>{formatearFecha(item.fecha_accion)}</span>
                                                        </div>
                                                        <div className={styles.timelineBody}>
                                                            <p><strong>Por:</strong> {item.nombre} {item.apellido}</p>
                                                            {item.comentario && <p>{item.comentario}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionReportesRiesgo;