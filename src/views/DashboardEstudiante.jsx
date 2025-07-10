import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import axios from '../api/axiosConfig.js';
import styles from '../css/DashboardEstudiante.module.css'; 

const DashboardEstudiante = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datos, setDatos] = useState({
        alumno: null,
        calificaciones: [],
        reportes: [],
        noticias: [],
        horarios: []
    });

    useEffect(() => {
        cargarDatosEstudiante();
    }, []);

    const cargarDatosEstudiante = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                window.location.href = '/login';
                return;
            }
            
            let datosTemp = {
                alumno: null,
                calificaciones: [],
                reportes: [],
                noticias: [],
                horarios: []
            };

            try {
                const requests = [
                    axios.get('/api/estudiante/perfil').catch(err => ({ data: null, error: err })),
                    axios.get('/api/estudiante/calificaciones').catch(err => ({ data: [], error: err })),
                    axios.get('/api/estudiante/reportes').catch(err => ({ data: [], error: err })),
                    axios.get('/api/noticias/publicas').catch(err => ({ data: [], error: err })),
                    axios.get('/api/estudiante/horarios').catch(err => ({ data: [], error: err }))
                ];
                const [alumnoRes, calificacionesRes, reportesRes, noticiasRes, horariosRes] = await Promise.all(requests);
                
                datosTemp.alumno = alumnoRes.data || null;
                datosTemp.calificaciones = Array.isArray(calificacionesRes.data) ? calificacionesRes.data : [];
                datosTemp.reportes = Array.isArray(reportesRes.data) ? reportesRes.data : [];
                datosTemp.noticias = Array.isArray(noticiasRes.data) ? noticiasRes.data : [];
                datosTemp.horarios = Array.isArray(horariosRes.data) ? horariosRes.data : [];
                console.log('Datos cargados:', datosTemp);

            } catch (error) {
                console.error('Error en una o más peticiones:', error);
            }

            setDatos(datosTemp);

        } catch (error) {
            console.error('Error general al cargar datos:', error);
            setError('Error al cargar la información del estudiante');
            setDatos({
                alumno: null,
                calificaciones: [],
                reportes: [],
                noticias: [],
                horarios: []
            });
        } finally {
            setLoading(false);
        }
    };

    const calcularPromedioActual = () => {
        if (!datos.calificaciones || !Array.isArray(datos.calificaciones) || datos.calificaciones.length === 0) {
            return '0.0';
        }
        
        const calificacionesValidas = datos.calificaciones.filter(c => 
            c.calificacion_final !== null && c.calificacion_final > 0
        );
        
        if (calificacionesValidas.length === 0) return '0.0';
        
        const suma = calificacionesValidas.reduce((acc, cal) => acc + parseFloat(cal.calificacion_final), 0);
        return (suma / calificacionesValidas.length).toFixed(1);
    };

    const obtenerMateriasPendientes = () => {
        if (!datos.calificaciones || !Array.isArray(datos.calificaciones)) {
            return 0;
        }
        return datos.calificaciones.filter(c => 
            c.estatus === 'cursando' || c.estatus === 'reprobado'
        ).length;
    };

    const obtenerProximasClases = () => {
        if (!datos.horarios || !Array.isArray(datos.horarios)) {
            return [];
        }
        
        const hoy = new Date();
        const diaActual = hoy.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();
        
        return datos.horarios.filter(h => h.dia_semana === diaActual)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
            .slice(0, 3);
    };

    if (loading) {
        return (
            <div className={styles.dashboardEstudiante}>
                <HeaderEstudiante activeSection="dashboard" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando información...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboardEstudiante}>
                <HeaderEstudiante activeSection="dashboard" />
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button onClick={cargarDatosEstudiante} className={styles.retryButton}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardEstudiante}>
            <HeaderEstudiante activeSection="dashboard" />
            
            <div className={styles.dashboardContent}>
                <div className={styles.welcomeSection}>
                    <h1>¡Bienvenido, {datos.alumno?.nombre}!</h1>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.promedio}`}>📊</div>
                        <div className={styles.statContent}>
                            <h3>Promedio General</h3>
                            <span className={styles.statNumber}>{calcularPromedioActual()}</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.cuatrimestre}`}>🎓</div>
                        <div className={styles.statContent}>
                            <h3>Cuatrimestre Actual</h3>
                            <span className={styles.statNumber}>{datos.alumno?.cuatrimestre_actual || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    <div className={styles.dashboardSection}>
                        <h2>📅 Próximas Clases de Hoy</h2>
                        <div className={styles.clasesContainer}>
                            {obtenerProximasClases().length > 0 ? (
                                obtenerProximasClases().map((clase, index) => (
                                    <div key={index} className={styles.claseItem}>
                                        <div className={styles.claseHora}>{clase.hora_inicio} - {clase.hora_fin}</div>
                                        <div className={styles.claseInfo}>
                                            <span className={styles.materia}>{clase.asignatura}</span>
                                            <span className={styles.aula}>Aula: {clase.aula}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noData}>No tienes clases programadas para hoy</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardEstudiante;