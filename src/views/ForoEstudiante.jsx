import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import styles from '../css/ForoEstudiante.module.css';

const ForoEstudiante = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        categoria_id: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);
        if (user.rol !== 'alumno') {
            window.location.href = '/login';
            return;
        }

        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const [postsResponse, categoriasResponse] = await Promise.all([
                fetch('http://localhost:5000/api/foro/posts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/foro/categorias', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const postsData = await postsResponse.json();
            const categoriasData = await categoriasResponse.json();

            if (postsData.success) {
                setPosts(postsData.data);
            }

            if (categoriasData.success) {
                setCategorias(categoriasData.data);
            }
        } catch (error) {
            console.error('Error al cargar datos del foro:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPost = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/foro/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                setShowModal(false);
                setFormData({ titulo: '', contenido: '', categoria_id: '' });
                cargarDatos();
                showSuccess('Post publicado exitosamente');
            } else {
                showSuccess(data.message || 'Error al publicar post');
            }
        } catch (error) {
            console.error('Error al crear post:', error);
            showSuccess('Error al publicar el post');
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 3000);
    };

    const handleVerPost = (postId) => {
        navigate(`/foro-post/${postId}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const postsFiltrados = posts.filter(post => {
        const cumpleCategoria = filtroCategoria === 'todas' || post.categoria_id.toString() === filtroCategoria;
        const cumpleBusqueda = post.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                              post.contenido.toLowerCase().includes(busqueda.toLowerCase());
        return cumpleCategoria && cumpleBusqueda;
    });

    if (loading) {
        return (
            <div className={styles.foroEstudiante}>
                <HeaderEstudiante activeSection="foro" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando foro...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.foroEstudiante}>
            <HeaderEstudiante activeSection="foro" />
            
            <div className={styles.foroContent}>
                <div className={styles.headerSection}>
                    <h1>Foro Estudiantil</h1>
                    <p className={styles.subtitle}>Conecta, discute y colabora con tus compañeros</p>
                </div>

                <div className={styles.controlsSection}>
                    <button 
                        className={styles.btnNuevoPost}
                        onClick={() => setShowModal(true)}
                    >
                        + Nuevo Post
                    </button>

                    <div className={styles.filtros}>
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="Buscar en el foro..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <span className={styles.searchIcon}>🔍</span>
                        </div>

                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className={styles.filtroSelect}
                        >
                            <option value="todas">Todas las categorías</option>
                            {categorias.map(categoria => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.postsSection}>
                    {postsFiltrados.length > 0 ? (
                        postsFiltrados.map((post) => (
                            <div key={post.id} className={styles.postCard}>
                                <div className={styles.postHeader}>
                                    <div className={styles.autorInfo}>
                                        <span className={styles.autorNombre}>{post.autor_nombre}</span>
                                        <span 
                                            className={styles.categoriaBadge}
                                            style={{ backgroundColor: post.categoria_color }}
                                        >
                                            {post.categoria_nombre}
                                        </span>
                                    </div>
                                    <span className={styles.fecha}>{formatDate(post.fecha_creacion)}</span>
                                </div>

                                <div className={styles.postContent}>
                                    <h3 
                                        className={styles.postTitulo}
                                        onClick={() => handleVerPost(post.id)}
                                    >
                                        {post.titulo}
                                    </h3>
                                    <p className={styles.postDescripcion}>
                                        {post.contenido.length > 150 
                                            ? `${post.contenido.substring(0, 150)}...` 
                                            : post.contenido
                                        }
                                    </p>
                                </div>

                                <div className={styles.postFooter}>
                                    <div className={styles.stats}>
                                        <span className={styles.stat}>
                                            👍 {post.likes || 0}
                                        </span>
                                        <span className={styles.stat}>
                                            💬 {post.comentarios_count || 0} comentarios
                                        </span>
                                        <span className={styles.stat}>
                                            👁️ {post.vistas || 0} vistas
                                        </span>
                                    </div>
                                    <button 
                                        className={styles.btnResponder}
                                        onClick={() => handleVerPost(post.id)}
                                    >
                                        Responder
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noPosts}>
                            <p>No se encontraron posts con los filtros seleccionados</p>
                            <button 
                                className={styles.btnNuevoPost}
                                onClick={() => setShowModal(true)}
                            >
                                Crear el primer post
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Crear Nuevo Post</h3>
                            <button 
                                className={styles.closeBtn} 
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.reglasSection}>
                            <h4>📋 Reglas del Foro</h4>
                            <div className={styles.reglas}>
                                <div className={styles.regla}>✅ Sé respetuoso con todos los miembros</div>
                                <div className={styles.regla}>✅ Usa categorías apropiadas para tu post</div>
                                <div className={styles.regla}>✅ Comparte recursos útiles que beneficien a la comunidad</div>
                                <div className={styles.regla}>✅ Usa títulos claros y descriptivos para tus posts</div>
                                <div className={styles.regla}>❌ No compartas información personal o datos sensibles</div>
                                <div className={styles.regla}>❌ No hagas spam o publicaciones repetitivas</div>
                                <div className={styles.regla}>❌ Mantén las discusiones enfocadas en temas académicos</div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitPost} className={styles.modalForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Título del Post</label>
                                    <input
                                        type="text"
                                        placeholder="Describe tu pregunta o tema brevemente"
                                        value={formData.titulo}
                                        onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Categoría</label>
                                    <select
                                        value={formData.categoria_id}
                                        onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Contenido</label>
                                <div className={styles.editorToolbar}>
                                    <button type="button" className={styles.editorBtn}>B</button>
                                    <button type="button" className={styles.editorBtn}>I</button>
                                    <button type="button" className={styles.editorBtn}>U</button>
                                    <button type="button" className={styles.editorBtn}>🔗</button>
                                </div>
                                <textarea
                                    rows="8"
                                    placeholder="Describe tu pregunta, comparte tu experiencia o inicia una discusión. Sé específico para obtener mejores respuestas de tus compañeros"
                                    value={formData.contenido}
                                    onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className={styles.modalActions}>
                                <button 
                                    type="button" 
                                    className={styles.btnCancel} 
                                    onClick={() => setShowModal(false)}
                                >
                                    × Cancelar
                                </button>
                                <button type="submit" className={styles.btnSubmit}>
                                    📤 Publicar Post
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

export default ForoEstudiante;