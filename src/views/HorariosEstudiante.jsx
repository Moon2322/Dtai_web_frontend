import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import axios from '../api/axiosConfig.js';
import styles from '../css/HorariosEstudiante.module.css';

const HorariosEstudiante = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [alumnoInfo, setAlumnoInfo] = useState(null);

    useEffect(() => {
        cargarHorarios();
    }, []);

    const cargarHorarios = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const [horariosRes, perfilRes] = await Promise.all([
                axios.get('/api/estudiante/horarios'),
                axios.get('/api/estudiante/perfil')
            ]);

            setHorarios(Array.isArray(horariosRes.data) ? horariosRes.data : []);
            setAlumnoInfo(perfilRes.data);

        } catch (error) {
            console.error('Error al cargar horarios:', error);
            setError('Error al cargar los horarios');
            setHorarios([]);
        } finally {
            setLoading(false);
        }
    };

    const obtenerPeriodoActual = () => {
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        
        if (mes >= 1 && mes <= 4) return 'Enero - Abril 2024';
        if (mes >= 5 && mes <= 8) return 'Mayo - Agosto 2024';
        return 'Septiembre - Diciembre 2024';
    };

    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const horasDisponibles = ['17:00', '18:00', '19:00', '20:00', '21:00'];

    const obtenerClasePorDiaHora = (dia, hora) => {
        return horarios.find(h => 
            h.dia_semana === dia && 
            h.hora_inicio === `${hora}:00`
        );
    };

    const formatearHora = (hora) => {
        return `${hora} - ${parseInt(hora.split(':')[0]) + 1}:00`;
    };

    if (loading) {
        return (
            <div className={styles.horariosEstudiante}>
                <HeaderEstudiante activeSection="horarios" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando horarios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.horariosEstudiante}>
                <HeaderEstudiante activeSection="horarios" />
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button onClick={cargarHorarios} className={styles.retryButton}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.horariosEstudiante}>
            <HeaderEstudiante activeSection="horarios" />
            
            <div className={styles.horariosContent}>
                <div className={styles.headerSection}>
                    <h1>Horario</h1>
                    <div className={styles.horarioInfo}>
                        <h2>Horario del cuatrimestre {alumnoInfo?.cuatrimestre_actual || 'N/A'}</h2>
                        <p>{obtenerPeriodoActual()}</p>
                    </div>
                </div>

                <div className={styles.horarioGrid}>
                    <div className={styles.horarioTable}>
                        <div className={styles.tableHeader}>
                            <div className={styles.horaHeader}>Hora</div>
                            {diasSemana.map(dia => (
                                <div key={dia} className={styles.diaHeader}>
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                </div>
                            ))}
                        </div>

                        {horasDisponibles.map(hora => (
                            <div key={hora} className={styles.tableRow}>
                                <div className={styles.horaCell}>
                                    {formatearHora(hora)}
                                </div>
                                {diasSemana.map(dia => {
                                    const clase = obtenerClasePorDiaHora(dia, hora);
                                    return (
                                        <div key={`${dia}-${hora}`} className={styles.diaCell}>
                                            {clase ? (
                                                <div className={styles.claseCard}>
                                                    <div className={styles.materiaNombre}>
                                                        {clase.asignatura}
                                                    </div>
                                                    <div className={styles.profesorNombre}>
                                                        {clase.profesor}
                                                    </div>
                                                    <div className={styles.aulaInfo}>
                                                        {clase.aula}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={styles.claseVacia}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HorariosEstudiante;