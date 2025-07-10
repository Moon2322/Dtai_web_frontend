import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/GestionAsignaturas.css';

const GestionAsignaturas = () => {
    const [asignaturas, setAsignaturas] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editingAsignatura, setEditingAsignatura] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        area: 'todas',
        estado: 'todos'
    });
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        creditos: 5,
        horas_teoricas: 3,
        horas_practicas: 2,
        complejidad: 5,
        cuatrimestre: 1,
        carrera_id: '',
        prerequisitos: ''
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

        fetchCarreras();
        fetchAsignaturas();
    }, [navigate]);

    useEffect(() => {
        fetchAsignaturas();
    }, [filters]);

    const fetchCarreras = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/carreras', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCarreras(data.data);
            }
        } catch (error) {
            console.error('Error al cargar carreras:', error);
        }
    };

    const fetchAsignaturas = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`http://localhost:5000/api/asignaturas?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAsignaturas(data.data);
            }
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleNewAsignatura = () => {
        setEditingAsignatura(null);
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            creditos: 5,
            horas_teoricas: 3,
            horas_practicas: 2,
            complejidad: 5,
            cuatrimestre: 1,
            carrera_id: '',
            prerequisitos: ''
        });
        setShowModal(true);
    };

    const handleEditAsignatura = (asignatura) => {
        setEditingAsignatura(asignatura);
        setFormData({
            codigo: asignatura.codigo,
            nombre: asignatura.nombre,
            descripcion: asignatura.descripcion || '',
            creditos: asignatura.creditos,
            horas_teoricas: asignatura.horas_teoricas,
            horas_practicas: asignatura.horas_practicas,
            complejidad: asignatura.complejidad,
            cuatrimestre: asignatura.cuatrimestre,
            carrera_id: asignatura.carrera_id,
            prerequisitos: asignatura.prerequisitos || ''
        });
        setShowModal(true);
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingAsignatura 
                ? `http://localhost:5000/api/asignaturas/${editingAsignatura.id}`
                : 'http://localhost:5000/api/asignaturas';
            
            const response = await fetch(url, {
                method: editingAsignatura ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchAsignaturas();
                showSuccess(data.message);
            } else {
                showSuccess(data.message);
            }
        } catch (error) {
            console.error('Error al guardar asignatura:', error);
            showSuccess('Error al guardar la asignatura');
        }
    };

    const handleDelete = async (id, currentState) => {
        const action = currentState ? 'desactivar' : 'reactivar';
        
        try {
            const token = localStorage.getItem('token');
            const url = currentState 
                ? `http://localhost:5000/api/asignaturas/${id}`  
                : `http://localhost:5000/api/asignaturas/${id}/reactivar`;  
                
            const method = currentState ? 'DELETE' : 'PATCH';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                fetchAsignaturas();
                showSuccess(data.message);
            } else {
                showSuccess(data.message);
            }
        } catch (error) {
            console.error(`Error al ${action} asignatura:`, error);
            showSuccess(`Error al ${action} la asignatura`);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando asignaturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="asignaturas" />
            
            <main className="dashboard-main">
                <div className="asignaturas-content">
                    <div className="page-header">
                        <div className="header-info">
                            <h2>Gestión de asignaturas</h2>
                            <p>Administra el catálogo académico de la división</p>
                            <small>Registra, modifica y elimina asignaturas del plan de estudios</small>
                        </div>
                    </div>
                    <div className="controls-section">
                        <button className="btn-new" onClick={handleNewAsignatura}>
                            <span className="plus-icon">+</span>
                            Nueva Materia
                        </button>
                        
                        <div className="filters">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Buscar materias por nombre o código..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                            
                            <select
                                value={filters.area}
                                onChange={(e) => handleFilterChange('area', e.target.value)}
                                className="filter-select"
                            >
                                <option value="todas">Todas las áreas</option>
                                {carreras.map(carrera => (
                                    <option key={carrera.id} value={carrera.codigo}>
                                        {carrera.codigo}
                                    </option>
                                ))}
                            </select>
                            
                            <select
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                className="filter-select"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="activa">Activa</option>
                                <option value="inactiva">Inactiva</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="asignaturas-table">
                            <thead>
                                <tr>
                                    <th>Nombre de asignaturas</th>
                                    <th>Área</th>
                                    <th>Cuatrimestre</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {asignaturas.map(asignatura => (
                                    <tr key={asignatura.id}>
                                        <td className="asignatura-name">{asignatura.nombre}</td>
                                        <td>{asignatura.carrera_codigo}</td>
                                        <td>{asignatura.cuatrimestre}°</td>
                                        <td>
                                            <span className={`status-badge ${asignatura.activa ? 'active' : 'inactive'}`}>
                                                {asignatura.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditAsignatura(asignatura)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={`btn-toggle ${asignatura.activa ? 'btn-deactivate' : 'btn-activate'}`}
                                                onClick={() => handleDelete(asignatura.id, asignatura.activa)}
                                                title={asignatura.activa ? 'Desactivar' : 'Reactivar'}
                                            >
                                                {asignatura.activa ? '🔽' : '🔼'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingAsignatura ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cuatrimestre *</label>
                                    <select
                                        value={formData.cuatrimestre}
                                        onChange={(e) => setFormData({...formData, cuatrimestre: parseInt(e.target.value)})}
                                        required
                                    >
                                        {[1,2,3,4,5,6,7,8,9].map(n => (
                                            <option key={n} value={n}>{n}°</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Carrera *</label>
                                <select
                                    value={formData.carrera_id}
                                    onChange={(e) => setFormData({...formData, carrera_id: parseInt(e.target.value)})}
                                    required
                                >
                                    <option value="">Seleccionar carrera</option>
                                    {carreras.map(carrera => (
                                        <option key={carrera.id} value={carrera.id}>
                                            {carrera.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Créditos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.creditos}
                                        onChange={(e) => setFormData({...formData, creditos: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    rows="3"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingAsignatura ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showSuccessModal && (
                <div className="success-modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✅</div>
                        <h3>¡Listo!</h3>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default GestionAsignaturas;