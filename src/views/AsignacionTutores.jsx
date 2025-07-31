import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/AsignacionTutores.module.css';

const AsignacionTutores = () => {
    const [profesores, setProfesores] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('asignar');
    const [selectedProfesor, setSelectedProfesor] = useState('');
    const [selectedGrupos, setSelectedGrupos] = useState([]);
    const [editingAsignacion, setEditingAsignacion] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [filters, setFilters] = useState({
        carrera: '',
        cuatrimestre: '',
        ciclo: ''
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

        cargarDatos();
    }, [navigate]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const [profesoresRes, gruposRes, asignacionesRes] = await Promise.all([
                fetch('http://localhost:5000/api/tutores/profesores', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/tutores/grupos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/tutores/asignaciones', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const profesoresData = await profesoresRes.json();
            const gruposData = await gruposRes.json();
            const asignacionesData = await asignacionesRes.json();

            if (profesoresData.success) setProfesores(profesoresData.data);
            if (gruposData.success) setGrupos(gruposData.data);
            if (asignacionesData.success) setAsignaciones(asignacionesData.data);

        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 2000);
    };

    const handleAsignarTutor = () => {
        setModalMode('asignar');
        setSelectedProfesor('');
        setSelectedGrupos([]);
        setEditingAsignacion(null);
        setShowModal(true);
    };

    const handleEditarAsignacion = (asignacion) => {
        setModalMode('editar');
        setSelectedProfesor(asignacion.profesor_id.toString());
        setSelectedGrupos(asignacion.grupos ? asignacion.grupos.split(',').map(id => parseInt(id)) : []);
        setEditingAsignacion(asignacion);
        setShowModal(true);
    };

    const handleGrupoToggle = (grupoId) => {
        setSelectedGrupos(prev => {
            if (prev.includes(grupoId)) {
                return prev.filter(id => id !== grupoId);
            } else {
                return [...prev, grupoId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedProfesor || selectedGrupos.length === 0) {
            alert('Selecciona un profesor y al menos un grupo');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const url = modalMode === 'asignar' 
                ? 'http://localhost:5000/api/tutores/asignar'
                : `http://localhost:5000/api/tutores/actualizar/${editingAsignacion.profesor_id}`;
            
            const response = await fetch(url, {
                method: modalMode === 'asignar' ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    profesor_id: parseInt(selectedProfesor),
                    grupos: selectedGrupos
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                cargarDatos();
                showSuccess(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        }
    };

    const handleRemoverAsignacion = async (profesorId) => {
        if (!confirm('¿Estás seguro de remover todas las asignaciones de este profesor?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/tutores/remover/${profesorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                cargarDatos();
                showSuccess(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al remover asignación');
        }
    };

    const gruposFiltrados = grupos.filter(grupo => {
        return (!filters.carrera || grupo.carrera_nombre.includes(filters.carrera)) &&
               (!filters.cuatrimestre || grupo.cuatrimestre.toString() === filters.cuatrimestre) &&
               (!filters.ciclo || grupo.ciclo_escolar.includes(filters.ciclo));
    });

    const gruposDisponibles = gruposFiltrados.filter(grupo => {
        const yaAsignado = asignaciones.some(asig => 
            asig.grupos && asig.grupos.split(',').includes(grupo.id.toString())
        );
        const seleccionadoActualmente = selectedGrupos.includes(grupo.id);
        const esDelProfesorActual = editingAsignacion && 
            editingAsignacion.grupos && 
            editingAsignacion.grupos.split(',').includes(grupo.id.toString());
        
        return !yaAsignado || seleccionadoActualmente || esDelProfesorActual;
    });

    return (
        <div className={styles.asignacionContainer}>
            <HeaderDirectivo activeSection="profesores" />
            
            <main className={styles.asignacionMain}>
                <div className={styles.asignacionContent}>
                    <div className={styles.pageHeader}>
                        <div className={styles.headerInfo}>
                            <h2>Asignación de Tutores</h2>
                        </div>
                        <button className={styles.btnNew} onClick={handleAsignarTutor}>
                            <span className={styles.plusIcon}>+</span>
                            Asignar Tutor
                        </button>
                    </div>

                    <div className={styles.statsSection}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👨‍🏫</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{profesores.length}</div>
                                <div className={styles.statLabel}>Profesores Disponibles</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{grupos.length}</div>
                                <div className={styles.statLabel}>Grupos Totales</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🎯</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{asignaciones.length}</div>
                                <div className={styles.statLabel}>Tutores Asignados</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.asignacionesSection}>
                        <h3>Asignaciones Actuales</h3>
                        {asignaciones.length > 0 ? (
                            <div className={styles.asignacionesGrid}>
                                {asignaciones.map(asignacion => (
                                    <div key={asignacion.profesor_id} className={styles.asignacionCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.profesorInfo}>
                                                <h4>{asignacion.profesor_nombre}</h4>
                                                <span className={styles.empleadoNum}>#{asignacion.numero_empleado}</span>
                                            </div>
                                            <div className={styles.cardActions}>
                                                <button
                                                    className={styles.btnEdit}
                                                    onClick={() => handleEditarAsignacion(asignacion)}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={() => handleRemoverAsignacion(asignacion.profesor_id)}
                                                    title="Remover"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.gruposAsignados}>
                                            <div className={styles.gruposHeader}>
                                                <span>Grupos Asignados ({asignacion.total_grupos})</span>
                                            </div>
                                            <div className={styles.gruposList}>
                                                {asignacion.grupos_detalle ? asignacion.grupos_detalle.split('|').map((grupo, index) => (
                                                    <div key={index} className={styles.grupoTag}>
                                                        {grupo}
                                                    </div>
                                                )) : 'Sin grupos asignados'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noAsignaciones}>
                                <p>No hay asignaciones de tutores</p>
                                <button className={styles.btnAsignar} onClick={handleAsignarTutor}>
                                    Crear primera asignación
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{modalMode === 'asignar' ? 'Asignar Tutor' : 'Editar Asignación'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Profesor *</label>
                                <select
                                    value={selectedProfesor}
                                    onChange={(e) => setSelectedProfesor(e.target.value)}
                                    required
                                    disabled={modalMode === 'editar'}
                                >
                                    <option value="">Seleccionar profesor</option>
                                    {profesores.map(profesor => (
                                        <option key={profesor.id} value={profesor.id}>
                                            {profesor.nombre} {profesor.apellido} - #{profesor.numero_empleado}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Filtros de Grupos</label>
                                <div className={styles.filtrosRow}>
                                    <select
                                        value={filters.carrera}
                                        onChange={(e) => setFilters({...filters, carrera: e.target.value})}
                                        className={styles.filtroSelect}
                                    >
                                        <option value="">Todas las carreras</option>
                                        {[...new Set(grupos.map(g => g.carrera_nombre))].map(carrera => (
                                            <option key={carrera} value={carrera}>{carrera}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filters.cuatrimestre}
                                        onChange={(e) => setFilters({...filters, cuatrimestre: e.target.value})}
                                        className={styles.filtroSelect}
                                    >
                                        <option value="">Todos los cuatrimestres</option>
                                        {[...new Set(grupos.map(g => g.cuatrimestre))].sort().map(cuatri => (
                                            <option key={cuatri} value={cuatri}>Cuatrimestre {cuatri}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Grupos Disponibles *</label>
                                <div className={styles.gruposContainer}>
                                    {gruposDisponibles.length > 0 ? gruposDisponibles.map(grupo => (
                                        <div key={grupo.id} className={styles.grupoItem}>
                                            <label className={styles.grupoLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGrupos.includes(grupo.id)}
                                                    onChange={() => handleGrupoToggle(grupo.id)}
                                                />
                                                <div className={styles.grupoInfo}>
                                                    <span className={styles.grupoCodigo}>{grupo.codigo}</span>
                                                    <span className={styles.grupoDetalle}>
                                                        {grupo.carrera_nombre} - Cuatri {grupo.cuatrimestre}
                                                    </span>
                                                    <span className={styles.grupoCiclo}>{grupo.ciclo_escolar}</span>
                                                </div>
                                            </label>
                                        </div>
                                    )) : (
                                        <p className={styles.noGrupos}>No hay grupos disponibles con los filtros seleccionados</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSave}>
                                    {modalMode === 'asignar' ? 'Asignar' : 'Actualizar'}
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

export default AsignacionTutores;