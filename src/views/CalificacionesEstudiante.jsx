import React, { useState, useEffect } from 'react';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import axios from '../api/axiosConfig.js';
import '../css/CalificacionesEstudiante.css';

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
            <div className="calificaciones-estudiante">
                <HeaderEstudiante activeSection="calificaciones" />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando calificaciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="calificaciones-estudiante">
                <HeaderEstudiante activeSection="calificaciones" />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={cargarCalificaciones} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="calificaciones-estudiante">
            <HeaderEstudiante activeSection="calificaciones" />
            
            <div className="calificaciones-content">
                <div className="header-section">
                    <h1>Calificaciones</h1>
                    <div className="tabs">
                        
                    </div>
                </div>

                <div className="calificaciones-section">
                    
                    <div className="filtros">
                        <select 
                            value={filtroEstado} 
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="filtro-select"
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
                            className="filtro-select"
                        >
                            <option value="todos">Todos los cuatrimestres</option>
                            {cuatrimestresDisponibles.map(cuatri => (
                                <option key={cuatri} value={cuatri}>
                                    {cuatri}° Cuatrimestre
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="calificaciones-table">
                        <div className="table-header">
                            <div className="header-cell">Materia</div>
                            <div className="header-cell">Calificaciones</div>
                            <div className="header-cell">Cuatrimestre</div>
                            <div className="header-cell">Estado</div>
                        </div>

                        {calificacionesFiltradas.length > 0 ? (
                            calificacionesFiltradas.map((cal) => (
                                <div key={cal.id} className="table-row">
                                    <div className="table-cell materia">
                                        <div className="materia-info">
                                            <h4>{cal.asignatura}</h4>
                                            <span className="codigo">{cal.codigo_asignatura}</span>
                                            <span className="profesor">Prof. {cal.profesor}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="table-cell calificaciones">
                                        <div className="calificacion-badge">
                                            {cal.calificacion_final ? cal.calificacion_final.toFixed(1) : 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div className="table-cell cuatrimestre">
                                        {cal.cuatrimestre}°
                                    </div>
                                    
                                    <div className="table-cell estado">
                                        <span className={`estado-badge ${obtenerEstadoClase(cal.estatus)}`}>
                                            {obtenerEstadoTexto(cal.estatus)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">
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