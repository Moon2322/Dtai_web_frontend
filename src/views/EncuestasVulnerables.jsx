import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/EncuestasVulnerables.css';

const EncuestasVulnerables = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        grupo: 'todos',
        cuatrimestre: 'todos'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userData);
        if (user.rol !== 'directivo') {
            navigate('/login');
            return;
        }

        fetchGrupos();
        fetchEstudiantes();
    }, [navigate]);

    useEffect(() => {
        fetchEstudiantes();
    }, [filters]);

    const fetchGrupos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/grupos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setGrupos(data.data);
            }
        } catch (error) {
            console.error('Error al cargar grupos:', error);
        }
    };

    const fetchEstudiantes = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`http://localhost:5000/api/encuestas/respuestas?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEstudiantes(data.data);
            }
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewEncuesta = (estudianteId) => {
        navigate(`/encuesta-detalle/${estudianteId}`);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando encuestas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="encuesta" />
            
            <main className="dashboard-main">
                <div className="encuestas-content">
                    <div className="page-header">
                        <div className="header-info">
                            <h2>Encuestas de preguntas vulnerables</h2>
                            <p>Visualiza las solicitudes</p>
                        </div>
                    </div>

                    <div className="controls-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, matrícula o email..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <div className="filters">
                            <select
                                value={filters.grupo}
                                onChange={(e) => handleFilterChange('grupo', e.target.value)}
                                className="filter-select"
                            >
                                <option value="todos">Todos los grupos</option>
                                {grupos.map(grupo => (
                                    <option key={grupo.codigo} value={grupo.codigo}>
                                        {grupo.codigo}
                                    </option>
                                ))}
                            </select>
                            
                            <select
                                value={filters.cuatrimestre}
                                onChange={(e) => handleFilterChange('cuatrimestre', e.target.value)}
                                className="filter-select"
                            >
                                <option value="todos">Todos los cuatrimestres</option>
                                {[1,2,3,4,5,6,7,8,9].map(n => (
                                    <option key={n} value={n}>{n}°</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="encuestas-table">
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Matrícula</th>
                                    <th>Email</th>
                                    <th>Grupo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map(estudiante => (
                                    <tr key={estudiante.id}>
                                        <td className="estudiante-name">
                                            {estudiante.nombre} {estudiante.apellido}
                                        </td>
                                        <td>{estudiante.matricula}</td>
                                        <td>{estudiante.correo}</td>
                                        <td>{estudiante.grupo_codigo || 'Sin grupo'}</td>
                                        <td className="actions">
                                            <button
                                                className="btn-view"
                                                onClick={() => handleViewEncuesta(estudiante.id)}
                                                title="Ver encuesta"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {estudiantes.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
                                <h3>No hay estudiantes</h3>
                                <p>No se encontraron estudiantes con los filtros aplicados</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EncuestasVulnerables;