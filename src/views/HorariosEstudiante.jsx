import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import axios from '../api/axiosConfig.js';
import '../css/HorariosEstudiante.css';

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
            <div className="horarios-estudiante">
                <HeaderEstudiante activeSection="horarios" />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando horarios...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="horarios-estudiante">
                <HeaderEstudiante activeSection="horarios" />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={cargarHorarios} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="horarios-estudiante">
            <HeaderEstudiante activeSection="horarios" />
            
            <div className="horarios-content">
                <div className="header-section">
                    <h1>Horario</h1>
                    <div className="horario-info">
                        <h2>Horario del cuatrimestre {alumnoInfo?.cuatrimestre_actual || 'N/A'}</h2>
                        <p>{obtenerPeriodoActual()}</p>
                    </div>
                </div>

                <div className="horario-grid">
                    <div className="horario-table">
                        <div className="table-header">
                            <div className="hora-header">Hora</div>
                            {diasSemana.map(dia => (
                                <div key={dia} className="dia-header">
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                </div>
                            ))}
                        </div>

                        {horasDisponibles.map(hora => (
                            <div key={hora} className="table-row">
                                <div className="hora-cell">
                                    {formatearHora(hora)}
                                </div>
                                {diasSemana.map(dia => {
                                    const clase = obtenerClasePorDiaHora(dia, hora);
                                    return (
                                        <div key={`${dia}-${hora}`} className="dia-cell">
                                            {clase ? (
                                                <div className="clase-card">
                                                    <div className="materia-nombre">
                                                        {clase.asignatura}
                                                    </div>
                                                    <div className="profesor-nombre">
                                                        {clase.profesor}
                                                    </div>
                                                    <div className="aula-info">
                                                        {clase.aula}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="clase-vacia"></div>
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