import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/CentroAyuda.css';

const CentroAyuda = () => {
    const [solicitudes, setSolicitudes] = useState([]);
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
        fetchSolicitudes();
    }, [navigate]);

    useEffect(() => {
        fetchSolicitudes();
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

    const fetchSolicitudes = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`http://localhost:5000/api/solicitudes-ayuda?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSolicitudes(data.data);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewSolicitud = (solicitudId) => {
        navigate(`/solicitud-ayuda/${solicitudId}`);
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            'pendiente': { class: 'pending', text: 'Pendiente' },
            'en_atencion': { class: 'processing', text: 'En atención' },
            'resuelto': { class: 'resolved', text: 'Resuelto' },
            'cerrado': { class: 'closed', text: 'Cerrado' }
        };
        return estados[estado] || { class: 'pending', text: 'Pendiente' };
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="ayuda" />
            
            <main className="dashboard-main">
                <div className="ayuda-content">
                    <div className="page-header">
                        <div className="header-info">
                            <h2>Centro de ayuda al alumno</h2>
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
                        <table className="ayuda-table">
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Matrícula</th>
                                    <th>Email</th>
                                    <th>Grupo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map(solicitud => {
                                    const estadoInfo = getEstadoBadge(solicitud.estado);
                                    return (
                                        <tr key={solicitud.id}>
                                            <td className="estudiante-name">
                                                {solicitud.nombre} {solicitud.apellido}
                                            </td>
                                            <td>{solicitud.matricula}</td>
                                            <td>{solicitud.correo}</td>
                                            <td>{solicitud.grupo_codigo || 'Sin grupo'}</td>
                                            <td>
                                                <span className={`status-badge ${estadoInfo.class}`}>
                                                    {estadoInfo.text}
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleViewSolicitud(solicitud.id)}
                                                    title="Ver solicitud"
                                                >
                                                    👁️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {solicitudes.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">🎧</div>
                                <h3>No hay solicitudes</h3>
                                <p>No se encontraron solicitudes de ayuda con los filtros aplicados</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CentroAyuda;