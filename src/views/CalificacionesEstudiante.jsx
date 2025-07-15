import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import axios from '../api/axiosConfig.js';
import styles from '../css/CalificacionesEstudiante.module.css'; 

const CalificacionesEstudiante = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [calificaciones, setCalificaciones] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroCuatrimestre, setFiltroCuatrimestre] = useState('todos');

    useEffect(() => {
        cargarCalificaciones();
    }, []);

    const cargarCalificaciones = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await axios.get('/api/estudiante/calificaciones');
            setCalificaciones(Array.isArray(response.data) ? response.data : []);

        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
            setError('Error al cargar las calificaciones');
            setCalificaciones([]);
        } finally {
            setLoading(false);
        }
    };

    const obtenerEstadoClase = (estatus) => {
        switch(estatus) {
            case 'aprobado': return 'completado';
            case 'cursando': return 'cursando';
            case 'reprobado': return 'reprobado';
            case 'extraordinario': return 'extraordinario';
            default: return 'cursando';
        }
    };

    const obtenerEstadoTexto = (estatus) => {
        switch(estatus) {
            case 'aprobado': return 'Completado';
            case 'cursando': return 'Cursando';
            case 'reprobado': return 'Reprobado';
            case 'extraordinario': return 'Extraordinario';
            default: return 'Cursando';
        }
    };

    const calificacionesFiltradas = calificaciones.filter(cal => {
        const cumpleFiltroEstado = filtroEstado === 'todos' || cal.estatus === filtroEstado;
        const cumpleFiltroCuatrimestre = filtroCuatrimestre === 'todos' || cal.cuatrimestre.toString() === filtroCuatrimestre;
        return cumpleFiltroEstado && cumpleFiltroCuatrimestre;
    });

    const cuatrimestresDisponibles = [...new Set(calificaciones.map(cal => cal.cuatrimestre))].sort();

    if (loading) {
        return (
            <div className={styles.calificacionesEstudiante}>
                <HeaderEstudiante activeSection="calificaciones" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando calificaciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.calificacionesEstudiante}>
                <HeaderEstudiante activeSection="calificaciones" />
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button onClick={cargarCalificaciones} className={styles.retryButton}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.calificacionesEstudiante}>
            <HeaderEstudiante activeSection="calificaciones" />
            
            <div className={styles.calificacionesContent}>
                <div className={styles.headerSection}>
                    <h1>Calificaciones</h1>
                    <div className={styles.tabs}>
                        {/* Aquí puedes agregar tabs si necesitas */}
                    </div>
                </div>

                <div className={styles.calificacionesSection}>
                    <div className={styles.filtros}>
                        <select 
                            value={filtroEstado} 
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className={styles.filtroSelect}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="cursando">Cursando</option>
                            <option value="aprobado">Completado</option>
                            <option value="reprobado">Reprobado</option>
                            <option value="extraordinario">Extraordinario</option>
                        </select>

                        <select 
                            value={filtroCuatrimestre} 
                            onChange={(e) => setFiltroCuatrimestre(e.target.value)}
                            className={styles.filtroSelect}
                        >
                            <option value="todos">Todos los cuatrimestres</option>
                            {cuatrimestresDisponibles.map(cuatri => (
                                <option key={cuatri} value={cuatri}>
                                    {cuatri}° Cuatrimestre
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.calificacionesTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.headerCell}>Materia</div>
                            <div className={styles.headerCell}>Calificaciones</div>
                            <div className={styles.headerCell}>Cuatrimestre</div>
                            <div className={styles.headerCell}>Estado</div>
                        </div>

                        {calificacionesFiltradas.length > 0 ? (
                            calificacionesFiltradas.map((cal) => (
                                <div key={cal.id} className={styles.tableRow}>
                                    <div className={`${styles.tableCell} ${styles.materia}`}>
                                        <div className={styles.materiaInfo}>
                                            <h4>{cal.asignatura}</h4>
                                            <span className={styles.codigo}>{cal.codigo_asignatura}</span>
                                            <span className={styles.profesor}>Prof. {cal.profesor}</span>
                                        </div>
                                    </div>
                                    
                                    <div className={`${styles.tableCell} ${styles.calificaciones}`}>
                                        <div className={styles.calificacionBadge}>
                                            {cal.calificacion_final ? cal.calificacion_final.toFixed(1) : 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div className={`${styles.tableCell} ${styles.cuatrimestre}`}>
                                        {cal.cuatrimestre}°
                                    </div>
                                    
                                    <div className={`${styles.tableCell} ${styles.estado}`}>
                                        <span className={`${styles.estadoBadge} ${styles[obtenerEstadoClase(cal.estatus)]}`}>
                                            {obtenerEstadoTexto(cal.estatus)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noData}>
                                <p>No se encontraron calificaciones con los filtros seleccionados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalificacionesEstudiante;