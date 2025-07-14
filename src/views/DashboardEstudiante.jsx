import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
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
                const perfilResponse = await fetch('http://localhost:5000/api/alumno/perfil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const perfilData = await perfilResponse.json();
                if (perfilData.success) {
                    datosTemp.alumno = perfilData.data;
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }

            try {
                const calificacionesResponse = await fetch('http://localhost:5000/api/alumno/calificaciones', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const calificacionesData = await calificacionesResponse.json();
                if (calificacionesData.success && Array.isArray(calificacionesData.data)) {
                    datosTemp.calificaciones = calificacionesData.data;
                }
            } catch (error) {
                console.error('Error al cargar calificaciones:', error);
            }

            try {
                const reportesResponse = await fetch('http://localhost:5000/api/alumno/reportes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const reportesData = await reportesResponse.json();
                if (reportesData.success && Array.isArray(reportesData.data)) {
                    datosTemp.reportes = reportesData.data;
                }
            } catch (error) {
                console.error('Error al cargar reportes:', error);
            }

            try {
                const noticiasResponse = await fetch('http://localhost:5000/api/noticias', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const noticiasData = await noticiasResponse.json();
                if (noticiasData.success && Array.isArray(noticiasData.data)) {
                    datosTemp.noticias = noticiasData.data.filter(n => n.publicada).slice(0, 5);
                }
            } catch (error) {
                console.error('Error al cargar noticias:', error);
            }

            try {
                const horariosResponse = await fetch('http://localhost:5000/api/alumno/horarios', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const horariosData = await horariosResponse.json();
                if (horariosData.success && Array.isArray(horariosData.data)) {
                    datosTemp.horarios = horariosData.data;
                }
            } catch (error) {
                console.error('Error al cargar horarios:', error);
            }

            console.log('Datos cargados:', datosTemp);
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
        
        let totalCalificaciones = 0;
        let totalMaterias = 0;
        
        datos.calificaciones.forEach(materia => {
            if (materia.calificacion_final !== null && materia.calificacion_final > 0) {
                totalCalificaciones += parseFloat(materia.calificacion_final);
                totalMaterias++;
            } else {
                let calificacionesActuales = [];
                
                if (materia.parcial_1 !== null && materia.parcial_1 > 0) {
                    calificacionesActuales.push(parseFloat(materia.parcial_1));
                }
                if (materia.parcial_2 !== null && materia.parcial_2 > 0) {
                    calificacionesActuales.push(parseFloat(materia.parcial_2));
                }
                if (materia.parcial_3 !== null && materia.parcial_3 > 0) {
                    calificacionesActuales.push(parseFloat(materia.parcial_3));
                }
                if (materia.calificacion_ordinario !== null && materia.calificacion_ordinario > 0) {
                    calificacionesActuales.push(parseFloat(materia.calificacion_ordinario));
                }
                
                if (calificacionesActuales.length > 0) {
                    const promedioMateria = calificacionesActuales.reduce((sum, cal) => sum + cal, 0) / calificacionesActuales.length;
                    totalCalificaciones += promedioMateria;
                    totalMaterias++;
                }
            }
        });
        
        if (totalMaterias === 0) return '0.0';
        
        return (totalCalificaciones / totalMaterias).toFixed(1);
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