import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import axios from '../api/axiosConfig.js';
import '../css/DashboardEstudiante.css';

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
            <div className="dashboard-estudiante">
                <HeaderEstudiante activeSection="dashboard" />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando información...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-estudiante">
                <HeaderEstudiante activeSection="dashboard" />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={cargarDatosEstudiante} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-estudiante">
            <HeaderEstudiante activeSection="dashboard" />
            
            <div className="dashboard-content">
                <div className="welcome-section">
                    <h1>¡Bienvenido, {datos.alumno?.nombre}!</h1>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon promedio">📊</div>
                        <div className="stat-content">
                            <h3>Promedio General</h3>
                            <span className="stat-number">{calcularPromedioActual()}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon cuatrimestre">🎓</div>
                        <div className="stat-content">
                            <h3>Calificación del cuatrimestre Actual</h3>
                            <span className="stat-number">{datos.alumno?.cuatrimestre_actual || 'N/A'}</span>
                        </div>
                    </div>

                    

                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-section">
                        <h2>📅 Próximas Clases de Hoy</h2>
                        <div className="clases-container">
                            {obtenerProximasClases().length > 0 ? (
                                obtenerProximasClases().map((clase, index) => (
                                    <div key={index} className="clase-item">
                                        <div className="clase-hora">{clase.hora_inicio} - {clase.hora_fin}</div>
                                        <div className="clase-info">
                                            <span className="materia">{clase.asignatura}</span>
                                            <span className="aula">Aula: {clase.aula}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No tienes clases programadas para hoy</p>
                            )}
                        </div>
                    </div>

                   

                 

                </div>
            </div>
        </div>
    );
};

export default DashboardEstudiante;