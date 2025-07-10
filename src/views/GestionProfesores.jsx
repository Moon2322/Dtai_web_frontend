import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/GestionProfesores.css';

const GestionProfesores = () => {
    const [profesores, setProfesores] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [stats, setStats] = useState({ totalProfesores: 0, areasAcademicas: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editingProfesor, setEditingProfesor] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        area: 'todas',
        estado: 'todos'
    });
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: '',
        telefono: '',
        numero_empleado: '',
        carrera_id: '',
        fecha_contratacion: '',
        titulo_academico: '',
        especialidad: '',
        cedula_profesional: '',
        experiencia_años: 0
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
        fetchProfesores();
        fetchStats();
    }, [navigate]);

    useEffect(() => {
        fetchProfesores();
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

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profesores/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const fetchProfesores = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`http://localhost:5000/api/profesores?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProfesores(data.data);
            }
        } catch (error) {
            console.error('Error al cargar profesores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 2000);
    };

    const handleNewProfesor = () => {
        setEditingProfesor(null);
        setFormData({
            nombre: '',
            apellido: '',
            correo: '',
            contraseña: '',
            telefono: '',
            numero_empleado: '',
            carrera_id: '',
            fecha_contratacion: '',
            titulo_academico: '',
            especialidad: '',
            cedula_profesional: '',
            experiencia_años: 0
        });
        setShowModal(true);
    };

    const handleEditProfesor = (profesor) => {
        setEditingProfesor(profesor);
        setFormData({
            nombre: profesor.nombre,
            apellido: profesor.apellido,
            correo: profesor.correo,
            contraseña: '', 
            telefono: profesor.telefono || '',
            numero_empleado: profesor.numero_empleado,
            carrera_id: profesor.carrera_id,
            fecha_contratacion: profesor.fecha_contratacion,
            titulo_academico: profesor.titulo_academico || '',
            especialidad: profesor.especialidad || '',
            cedula_profesional: profesor.cedula_profesional || '',
            experiencia_años: profesor.experiencia_años || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingProfesor 
                ? `http://localhost:5000/api/profesores/${editingProfesor.id}`
                : 'http://localhost:5000/api/profesores';
            const submitData = { ...formData };
            if (editingProfesor && !submitData.contraseña) {
                delete submitData.contraseña;
            }
            
            const response = await fetch(url, {
                method: editingProfesor ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchProfesores();
                fetchStats();
                showSuccess(data.message);
            } else {
                showSuccess(data.message);
            }
        } catch (error) {
            console.error('Error al guardar profesor:', error);
            showSuccess('Error al guardar el profesor');
        }
    };

    const handleToggleStatus = async (id, currentState) => {        
        try {
            const token = localStorage.getItem('token');
            const url = currentState 
                ? `http://localhost:5000/api/profesores/${id}` 
                : `http://localhost:5000/api/profesores/${id}/reactivar`;  
                
            const method = currentState ? 'DELETE' : 'PATCH';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                fetchProfesores();
                fetchStats();
                showSuccess(data.message);
            } else {
                showSuccess(data.message);
            }
        } catch (error) {
            console.error('Error al cambiar estado del profesor:', error);
            showSuccess('Error al cambiar el estado del profesor');
        }
    };

    const getMateriasAsignadas = (profesor) => {
        if (profesor.especialidad) {
            return profesor.especialidad.split(',').map(m => m.trim()).slice(0, 2).join(', ');
        }
        return 'Sin asignar';
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando profesores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="profesores" />
            
            <main className="dashboard-main">
                <div className="profesores-content">
                    <div className="page-header">
                        <div className="header-info">
                            <h2>Gestión de Profesores</h2>
                            <p>Administra el personal docente de DTAI</p>
                        </div>
                        <button className="btn-new" onClick={handleNewProfesor}>
                            <span className="plus-icon">+</span>
                            Nuevo Profesor
                        </button>
                    </div>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Profesores</div>
                                <div className="stat-number">{stats.totalProfesores}</div>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon green">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Áreas Académicas</div>
                                <div className="stat-number">{stats.areasAcademicas}</div>
                            </div>
                        </div>
                        <div className="horarios-buttons">
                            <button 
                                className="btn-horario ingenieria"
                                onClick={() => navigate('/horarios-ingenieria')}
                            >
                                <span className="horario-icon">🎓</span>
                                <div className="horario-info">
                                    <span className="horario-title">Ingeniería</span>
                                    <span className="horario-time">5:00 PM - 10:00 PM</span>
                                </div>
                            </button>
                            
                            <button 
                                className="btn-horario tsu"
                                onClick={() => navigate('/horarios-tsu')}
                            >
                                <span className="horario-icon">📚</span>
                                <div className="horario-info">
                                    <span className="horario-title">TSU</span>
                                    <span className="horario-time">7:00 AM - 3:00 PM</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="controls-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o número de empleado..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        
                        <div className="filters">
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
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="profesores-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Número Empleado</th>
                                    <th>Email</th>
                                    <th>Área</th>
                                    <th>Especialidad</th>
                                    <th>Materias Asignadas</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profesores.map(profesor => (
                                    <tr key={profesor.id}>
                                        <td className="profesor-name">
                                            {profesor.nombre} {profesor.apellido}
                                        </td>
                                        <td>{profesor.numero_empleado}</td>
                                        <td>{profesor.correo}</td>
                                        <td>{profesor.carrera_codigo}</td>
                                        <td>{profesor.especialidad || 'No especificada'}</td>
                                        <td>{getMateriasAsignadas(profesor)}</td>
                                        <td>
                                            <span className={`status-badge ${profesor.activo ? 'active' : 'inactive'}`}>
                                                {profesor.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditProfesor(profesor)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={`btn-toggle ${profesor.activo ? 'btn-deactivate' : 'btn-activate'}`}
                                                onClick={() => handleToggleStatus(profesor.id, profesor.activo)}
                                                title={profesor.activo ? 'Desactivar' : 'Reactivar'}
                                            >
                                                {profesor.activo ? '🔽' : '🔼'}
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
                            <h3>{editingProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-sections">
                                <div className="form-section">
                                    <h4>Datos Personales</h4>
                                    
                                    <div className="form-group">
                                        <label>Nombre Completo *</label>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                            placeholder="Ej. Juan Carlos"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Apellido *</label>
                                        <input
                                            type="text"
                                            value={formData.apellido}
                                            onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                                            placeholder="Ej. García López"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Correo Electrónico *</label>
                                        <input
                                            type="email"
                                            value={formData.correo}
                                            onChange={(e) => setFormData({...formData, correo: e.target.value})}
                                            placeholder="profesor@dtai.edu"
                                            required
                                        />
                                    </div>
                                    
                                    {!editingProfesor && (
                                        <div className="form-group">
                                            <label>Contraseña *</label>
                                            <input
                                                type="password"
                                                value={formData.contraseña}
                                                onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
                                                placeholder="••••••••"
                                                required={!editingProfesor}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Número de Empleado *</label>
                                        <input
                                            type="text"
                                            value={formData.numero_empleado}
                                            onChange={(e) => setFormData({...formData, numero_empleado: e.target.value})}
                                            placeholder="EMP003"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-section">
                                    <h4>Datos Académicos</h4>
                                    
                                    <div className="form-group">
                                        <label>Área *</label>
                                        <select
                                            value={formData.carrera_id}
                                            onChange={(e) => setFormData({...formData, carrera_id: parseInt(e.target.value)})}
                                            required
                                        >
                                            <option value="">Seleccionar área</option>
                                            {carreras.map(carrera => (
                                                <option key={carrera.id} value={carrera.id}>
                                                    {carrera.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Área/Especialidad</label>
                                        <input
                                            type="text"
                                            value={formData.especialidad}
                                            onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                                            placeholder="Ej. Desarrollo Web, Base de Datos"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Título Académico</label>
                                        <input
                                            type="text"
                                            value={formData.titulo_academico}
                                            onChange={(e) => setFormData({...formData, titulo_academico: e.target.value})}
                                            placeholder="Ej. Maestría en Ciencias Computacionales"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Cédula Profesional</label>
                                        <input
                                            type="text"
                                            value={formData.cedula_profesional}
                                            onChange={(e) => setFormData({...formData, cedula_profesional: e.target.value})}
                                            placeholder="1234567"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Experiencia (años)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={formData.experiencia_años}
                                            onChange={(e) => setFormData({...formData, experiencia_años: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Fecha de Contratación *</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_contratacion}
                                            onChange={(e) => setFormData({...formData, fecha_contratacion: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profesor-status">
                                <span className="status-icon">👨‍🏫</span>
                                <span>Profesor Activo</span>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingProfesor ? 'Actualizar' : 'Guardar'} Profesor
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

export default GestionProfesores;