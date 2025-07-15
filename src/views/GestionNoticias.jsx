import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/GestionNoticias.module.css';

const GestionNoticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [stats, setStats] = useState({
        noticiasPublicadas: 0,
        borradores: 0,
        totalVistas: 0,
        categoriasActivas: 0
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editingNoticia, setEditingNoticia] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        categoria: 'todas',
        estado: 'todos'
    });
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        resumen: '',
        categoria_id: '',
        es_destacada: false,
        publicada: false,
        imagen: null
    });
    const [imagePreview, setImagePreview] = useState(null);
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

        fetchCategorias();
        fetchNoticias();
        fetchStats();
    }, [navigate]);

    useEffect(() => {
        fetchNoticias();
    }, [filters]);

    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/categorias-noticias', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setCategorias(data.data);
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/noticias/stats', {
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

    const fetchNoticias = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`http://localhost:5000/api/noticias?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNoticias(data.data);
            }
        } catch (error) {
            console.error('Error al cargar noticias:', error);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imagen: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNewNoticia = () => {
        setEditingNoticia(null);
        setFormData({
            titulo: '',
            contenido: '',
            resumen: '',
            categoria_id: '',
            es_destacada: false,
            publicada: false,
            imagen: null
        });
        setImagePreview(null);
        setShowModal(true);
    };

    const handleEditNoticia = (noticia) => {
        setEditingNoticia(noticia);
        setFormData({
            titulo: noticia.titulo,
            contenido: noticia.contenido,
            resumen: noticia.resumen || '',
            categoria_id: noticia.categoria_id,
            es_destacada: noticia.es_destacada,
            publicada: noticia.publicada,
            imagen: null
        });
        setImagePreview(noticia.imagen_url || null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingNoticia 
                ? `http://localhost:5000/api/noticias/${editingNoticia.id}`
                : 'http://localhost:5000/api/noticias';
            
            const formDataToSend = new FormData();
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('contenido', formData.contenido);
            formDataToSend.append('resumen', formData.resumen);
            formDataToSend.append('categoria_id', formData.categoria_id);
            formDataToSend.append('es_destacada', formData.es_destacada);
            formDataToSend.append('publicada', formData.publicada);
            
            if (formData.imagen) {
                formDataToSend.append('imagen', formData.imagen);
            }

            const response = await fetch(url, {
                method: editingNoticia ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                fetchNoticias();
                fetchStats();
                showSuccess(data.message);
            } else {
                showSuccess(data.message);
            }
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            showSuccess('Error al guardar la noticia');
        }
    };

    const handleToggleStatus = async (id, currentState) => {        
        try {
            const token = localStorage.getItem('token');
            const url = currentState 
                ? `http://localhost:5000/api/noticias/${id}`  
                : `http://localhost:5000/api/noticias/${id}/publicar`;  
                
            const method = currentState ? 'DELETE' : 'PATCH';
            const body = currentState ? undefined : JSON.stringify({ publicada: true });
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body
            });

            const data = await response.json();
            if (data.success) {
                fetchNoticias();
                fetchStats();
                showSuccess(data.message);
            } else {
                showSuccess(data.message);
            }
        } catch (error) {
            console.error('Error al cambiar estado de la noticia:', error);
            showSuccess('Error al cambiar el estado de la noticia');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const getEstadoBadge = (noticia) => {
        if (noticia.publicada) {
            return <span className={`${styles.statusBadge} ${styles.publicada}`}>Publicada</span>;
        } else {
            return <span className={`${styles.statusBadge} ${styles.borrador}`}>Borrador</span>;
        }
    };

    if (loading) {
        return (
            <div className={styles.dashboardLoading}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Cargando noticias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <HeaderDirectivo activeSection="noticias" />
            
            <main className={styles.dashboardMain}>
                <div className={styles.noticiasContent}>
                    <div className={styles.pageHeader}>
                        <div className={styles.headerInfo}>
                            <h2>Gestión de Noticias</h2>
                            <p>Administra las noticias y comunicados de DTAI</p>
                            <small>Crea, modifica y publica noticias institucionales</small>
                        </div>
                        <button className={styles.btnNew} onClick={handleNewNoticia}>
                            <span className={styles.plusIcon}>+</span>
                            Nueva Noticia
                        </button>
                    </div>

                    <div className={styles.statsCards}>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.blue}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Noticias Publicadas</div>
                                <div className={styles.statNumber}>{stats.noticiasPublicadas}</div>
                            </div>
                        </div>
                        
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.orange}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 3C17.5523 3 18 3.44772 18 4V20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20V4C6 3.44772 6.44772 3 7 3H17Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M10 7H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M10 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M10 15H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Borradores</div>
                                <div className={styles.statNumber}>{stats.borradores}</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.green}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 12S4 4 12 4s11 8 11 8-3 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Total Vistas</div>
                                <div className={styles.statNumber}>{stats.totalVistas.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.purple}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 7H17V17H7V7Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M9 1V7" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M15 1V7" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M9 17V23" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M15 17V23" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statLabel}>Categorías Activas</div>
                                <div className={styles.statNumber}>{stats.categoriasActivas}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.controlsSection}>
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="Buscar noticias por título o contenido..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <span className={styles.searchIcon}>🔍</span>
                        </div>
                        
                        <div className={styles.filters}>
                            <select
                                value={filters.categoria}
                                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="todas">Todas las categorías</option>
                                {categorias.map(categoria => (
                                    <option key={categoria.id} value={categoria.nombre}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                            
                            <select
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="publicada">Publicada</option>
                                <option value="borrador">Borrador</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className={styles.tableContainer}>
                        <table className={styles.noticiasTable}>
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Título</th>
                                    <th>Categoría</th>
                                    <th>Autor</th>
                                    <th>Fecha Publicación</th>
                                    <th>Estado</th>
                                    <th>Vistas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {noticias.map(noticia => (
                                    <tr key={noticia.id}>
                                        <td>
                                            {noticia.imagen_url ? (
                                                <img 
                                                    src={noticia.imagen_url} 
                                                    alt={noticia.titulo}
                                                    className={styles.noticiaImage}
                                                />
                                            ) : (
                                                <div className={styles.noImagePlaceholder}>
                                                    📰
                                                </div>
                                            )}
                                        </td>
                                        <td className={styles.noticiaTitle}>
                                            {noticia.titulo}
                                            {noticia.es_destacada && <span className={styles.destacadaBadge}>⭐</span>}
                                        </td>
                                        <td>
                                            <span 
                                                className={styles.categoriaBadge}
                                                style={{ backgroundColor: noticia.categoria_color }}
                                            >
                                                {noticia.categoria_nombre}
                                            </span>
                                        </td>
                                        <td>Dr. {noticia.apellido}</td>
                                        <td>{formatDate(noticia.fecha_publicacion)}</td>
                                        <td>{getEstadoBadge(noticia)}</td>
                                        <td>{noticia.vistas}</td>
                                        <td className={styles.actions}>
                                            <button
                                                className={styles.btnEdit}
                                                onClick={() => handleEditNoticia(noticia)}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={`${styles.btnToggle} ${noticia.publicada ? styles.btnDeactivate : styles.btnActivate}`}
                                                onClick={() => handleToggleStatus(noticia.id, noticia.publicada)}
                                                title={noticia.publicada ? 'Despublicar' : 'Publicar'}
                                            >
                                                {noticia.publicada ? '🔽' : '🔼'}
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
                    <div className={`${styles.modalContent} ${styles.large}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingNoticia ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Título *</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                    placeholder="Título de la noticia"
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Categoría *</label>
                                    <select
                                        value={formData.categoria_id}
                                        onChange={(e) => setFormData({...formData, categoria_id: parseInt(e.target.value)})}
                                        required
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={formData.es_destacada}
                                            onChange={(e) => setFormData({...formData, es_destacada: e.target.checked})}
                                        />
                                        <span className={styles.checkboxText}>Noticia destacada ⭐</span>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Imagen de la noticia</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={styles.fileInput}
                                />
                                {imagePreview && (
                                    <div className={styles.imagePreview}>
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Resumen</label>
                                <textarea
                                    rows="3"
                                    value={formData.resumen}
                                    onChange={(e) => setFormData({...formData, resumen: e.target.value})}
                                    placeholder="Breve resumen de la noticia..."
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label>Contenido *</label>
                                <textarea
                                    rows="8"
                                    value={formData.contenido}
                                    onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                                    placeholder="Contenido completo de la noticia..."
                                    required
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.publicada}
                                        onChange={(e) => setFormData({...formData, publicada: e.target.checked})}
                                    />
                                    <span className={styles.checkboxText}>Publicar inmediatamente</span>
                                </label>
                            </div>
                            
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSave}>
                                    {editingNoticia ? 'Actualizar' : 'Guardar'} Noticia
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

export default GestionNoticias;