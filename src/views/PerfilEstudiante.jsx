import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import styles from '../css/PerfilEstudiante.module.css';

const PerfilEstudiante = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [calificaciones, setCalificaciones] = useState([]);

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

        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('http://localhost:5000/api/alumno/perfil', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setPerfil(data.data);
            } else {
                setError(data.message || 'Error al cargar perfil');
            }

            try {
                const calificacionesResponse = await fetch('http://localhost:5000/api/alumno/calificaciones', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const calificacionesData = await calificacionesResponse.json();
                if (calificacionesData.success && Array.isArray(calificacionesData.data)) {
                    setCalificaciones(calificacionesData.data);
                }
            } catch (error) {
                console.error('Error al cargar calificaciones:', error);
            }

        } catch (error) {
            console.error('Error al cargar perfil:', error);
            setError('Error al cargar la información del perfil');
            if (error.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const calcularPromedioActual = () => {
        if (!calificaciones || !Array.isArray(calificaciones) || calificaciones.length === 0) {
            return '0.0';
        }
        
        let totalCalificaciones = 0;
        let totalMaterias = 0;
        
        calificaciones.forEach(materia => {
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

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-MX');
    };

    const obtenerEstadoBadge = (estado) => {
        switch(estado) {
            case 'activo': return styles.estadoActivo;
            case 'baja_temporal': return styles.estadoBajaTemporal;
            case 'egresado': return styles.estadoEgresado;
            case 'baja_definitiva': return styles.estadoBajaDefinitiva;
            default: return styles.estadoActivo;
        }
    };

    if (loading) {
        return (
            <div className={styles.dashboardContainer}>
                <HeaderEstudiante activeSection="mi-perfil" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboardContainer}>
                <HeaderEstudiante activeSection="mi-perfil" />
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button onClick={cargarPerfil} className={styles.retryButton}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <HeaderEstudiante activeSection="mi-perfil" />
            
            <div className={styles.dashboardMain}>
                <div className={styles.headerSection}>
                    <h1>Mi Perfil</h1>
                    <p className={styles.subtitle}>Información académica y personal</p>
                </div>

                <div className={styles.perfilGrid}>
                    <div className={styles.perfilCard}>
                        <div className={styles.perfilHeader}>
                            <h2>{perfil?.nombre} {perfil?.apellido}</h2>
                            <p className={styles.carrera}>{perfil?.carrera}</p>
                            <div className={`${styles.estadoBadge} ${obtenerEstadoBadge(perfil?.estado_alumno)}`}>
                                ● {perfil?.estado_alumno === 'activo' ? 'Activo' : perfil?.estado_alumno}
                            </div>
                        </div>

                        <div className={styles.perfilInfo}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📧</div>
                                <div>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>{perfil?.correo}</span>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📱</div>
                                <div>
                                    <span className={styles.infoLabel}>Teléfono</span>
                                    <span className={styles.infoValue}>{perfil?.telefono || 'No registrado'}</span>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>🎓</div>
                                <div>
                                    <span className={styles.infoLabel}>Matrícula</span>
                                    <span className={styles.infoValue}>{perfil?.matricula}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.academicaCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIcon}>🎓</div>
                            <h3>Información Académica</h3>
                        </div>

                        <div className={styles.academicaStats}>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>{perfil?.cuatrimestre_actual}°</div>
                                <div className={styles.statLabel}>Cuatrimestre Actual</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statNumber}>{calcularPromedioActual()}</div>
                                <div className={styles.statLabel}>Promedio General</div>
                            </div>
                        </div>

                        <div className={styles.academicaDetails}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Carrera:</span>
                                <span className={styles.detailValue}>{perfil?.carrera}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Código:</span>
                                <span className={styles.detailValue}>{perfil?.codigo_carrera}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Duración:</span>
                                <span className={styles.detailValue}>{perfil?.duracion_cuatrimestres} cuatrimestres</span>
                            </div>
                           
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Fecha de Ingreso:</span>
                                <span className={styles.detailValue}>{formatearFecha(perfil?.fecha_ingreso)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h3>Información Personal</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoBox}>
                            <span className={styles.infoBoxLabel}>Fecha de Nacimiento</span>
                            <span className={styles.infoBoxValue}>{formatearFecha(perfil?.fecha_nacimiento)}</span>
                        </div>
                        <div className={styles.infoBox}>
                            <span className={styles.infoBoxLabel}>Dirección</span>
                            <span className={styles.infoBoxValue}>{perfil?.direccion || 'No registrada'}</span>
                        </div>
                        <div className={styles.infoBox}>
                            <span className={styles.infoBoxLabel}>Estado del Alumno</span>
                            <span className={`${styles.infoBoxValue} ${obtenerEstadoBadge(perfil?.estado_alumno)}`}>
                                {perfil?.estado_alumno === 'activo' ? 'Activo' : perfil?.estado_alumno}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilEstudiante;