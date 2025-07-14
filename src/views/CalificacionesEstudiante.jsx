import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import styles from '../css/CalificacionesEstudiante.module.css'; 

const CalificacionesEstudiante = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [calificaciones, setCalificaciones] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroCuatrimestre, setFiltroCuatrimestre] = useState('todos');

    useEffect(() => {
        const userData = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);
        if (user.rol !== 'alumno') {
            window.location.href = '/login';
            return;
        }

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

            const response = await fetch('http://localhost:5000/api/alumno/calificaciones', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setCalificaciones(Array.isArray(data.data) ? data.data : []);
            } else {
                setError(data.message || 'Error al cargar calificaciones');
                setCalificaciones([]);
            }

        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
            setError('Error al cargar las calificaciones');
            setCalificaciones([]);
        } finally {
            setLoading(false);
        }
    };

    const calcularCalificacionActual = (cal) => {
        if (cal.calificacion_final !== null && cal.calificacion_final > 0) {
            return parseFloat(cal.calificacion_final).toFixed(1);
        }
        
        let calificacionesActuales = [];
        
        if (cal.parcial_1 !== null && cal.parcial_1 > 0) {
            calificacionesActuales.push(parseFloat(cal.parcial_1));
        }
        if (cal.parcial_2 !== null && cal.parcial_2 > 0) {
            calificacionesActuales.push(parseFloat(cal.parcial_2));
        }
        if (cal.parcial_3 !== null && cal.parcial_3 > 0) {
            calificacionesActuales.push(parseFloat(cal.parcial_3));
        }
        if (cal.calificacion_ordinario !== null && cal.calificacion_ordinario > 0) {
            calificacionesActuales.push(parseFloat(cal.calificacion_ordinario));
        }
        
        if (calificacionesActuales.length > 0) {
            const promedio = calificacionesActuales.reduce((sum, cal) => sum + cal, 0) / calificacionesActuales.length;
            return promedio.toFixed(1);
        }
        
        return 'N/A';
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
                                            {calcularCalificacionActual(cal)}
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