import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/GestionAsignaturas.module.css';

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
        horas_teoricas: 3,
        horas_practicas: 2,
        complejidad: 5,
        cuatrimestre: 1,
        carrera_id: '',
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
            horas_teoricas: 3,
            horas_practicas: 2,
            complejidad: 5,
            cuatrimestre: 1,
            carrera_id: '',
        });
        setShowModal(true);
    };

    const handleEditAsignatura = (asignatura) => {
        setEditingAsignatura(asignatura);
        setFormData({
            codigo: asignatura.codigo,
            nombre: asignatura.nombre,
            descripcion: asignatura.descripcion || '',
            horas_teoricas: asignatura.horas_teoricas,
            horas_practicas: asignatura.horas_practicas,
            complejidad: asignatura.complejidad,
            cuatrimestre: asignatura.cuatrimestre,
            carrera_id: asignatura.carrera_id,
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
            <div className={styles.dashboardLoading}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Cargando asignaturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <HeaderDirectivo activeSection="asignaturas" />
            
            <main className={styles.dashboardMain}>
                <div className={styles.asignaturasContent}>
                    <div className={styles.pageHeader}>
                        <div className={styles.headerInfo}>
                            <h2>Gestión de asignaturas</h2>
                            <p>Administra el catálogo académico de la división</p>
                            <small>Registra, modifica y elimina asignaturas del plan de estudios</small>
                        </div>
                    </div>
                    <div className={styles.controlsSection}>
                        <button className={styles.btnNew} onClick={handleNewAsignatura}>
                            <span className={styles.plusIcon}>+</span>
                            Nueva Materia
                        </button>
                        
                        <div className={styles.filters}>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Buscar materias por nombre o código..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                                <span className={styles.searchIcon}>🔍</span>
                            </div>
                            
                            <select
                                value={filters.area}
                                onChange={(e) => handleFilterChange('area', e.target.value)}
                                className={styles.filterSelect}
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
                                className={styles.filterSelect}
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="activa">Activa</option>
                                <option value="inactiva">Inactiva</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.asignaturasTable}>
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
                                        <td className={styles.asignaturaName}>{asignatura.nombre}</td>
                                        <td>{asignatura.carrera_codigo}</td>
                                        <td>{asignatura.cuatrimestre}°</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${asignatura.activa ? styles.active : styles.inactive}`}>
                                                {asignatura.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className={styles.actions}>
                                            <button
                                                className={styles.btnEdit}
                                                onClick={() => handleEditAsignatura(asignatura)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={`${styles.btnToggle} ${asignatura.activa ? styles.btnDeactivate : styles.btnActivate}`}
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
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingAsignatura ? 'Editar Asignatura' : 'Nueva Asignatura'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
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
                            
                            <div className={styles.formGroup}>
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
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
                            
                            
                            <div className={styles.formGroup}>
                                <label>Descripción</label>
                                <textarea
                                    rows="3"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>
                            
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSave}>
                                    {editingAsignatura ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showSuccessModal && (
                <div className={styles.successModalOverlay}>
                    <div className={styles.successModal}>
                        <div className={styles.successIcon}>✅</div>
                        <h3>¡Listo!</h3>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAsignaturas;