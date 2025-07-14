import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import styles from '../css/PostDetalle.module.css';

const PostDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);

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

        cargarPostDetalle();
        cargarComentarios();
    }, [id]);

    const cargarPostDetalle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/foro/posts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPost(data.data);
            }
        } catch (error) {
            console.error('Error al cargar post:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarComentarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/foro/posts/${id}/comentarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setComentarios(data.data);
            }
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
        }
    };

    const enviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        try {
            setEnviandoComentario(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/foro/posts/${id}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comentario: nuevoComentario
                })
            });

            const data = await response.json();
            if (data.success) {
                setNuevoComentario('');
                cargarComentarios();
            }
        } catch (error) {
            console.error('Error al enviar comentario:', error);
        } finally {
            setEnviandoComentario(false);
        }
    };

    const darLike = async (comentarioId = null) => {
        try {
            const token = localStorage.getItem('token');
            const url = comentarioId 
                ? `http://localhost:5000/api/foro/comentarios/${comentarioId}/like`
                : `http://localhost:5000/api/foro/posts/${id}/like`;
                
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                if (comentarioId) {
                    cargarComentarios();
                } else {
                    cargarPostDetalle();
                }
            }
        } catch (error) {
            console.error('Error al dar like:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.postDetalle}>
                <HeaderEstudiante activeSection="foro" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando post...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.postDetalle}>
                <HeaderEstudiante activeSection="foro" />
                <div className={styles.errorContainer}>
                    <p>Post no encontrado</p>
                    <button onClick={() => navigate('/foro-estudiante')}>
                        Volver al Foro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.postDetalle}>
            <HeaderEstudiante activeSection="foro" />
            
            <div className={styles.detalleContent}>
                <div className={styles.breadcrumb}>
                    <span onClick={() => navigate('/foro-estudiante')}>Foro</span>
                    <span>›</span>
                    <span>{post.categoria_nombre}</span>
                    <span>›</span>
                    <span>{post.titulo}</span>
                </div>

                <div className={styles.postCard}>
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
                    </div>

                    <h1 className={styles.postTitulo}>{post.titulo}</h1>
                    
                    <div className={styles.postContent}>
                        <p>{post.contenido}</p>
                    </div>

                    <div className={styles.postFooter}>
                        <button 
                            className={styles.likeBtn}
                            onClick={() => darLike()}
                        >
                            👍 {post.likes || 0}
                        </button>
                        <span className={styles.fecha}>{formatDate(post.fecha_creacion)}</span>
                    </div>
                </div>

                <div className={styles.comentariosSection}>
                    <h3>Comentarios</h3>
                    
                    {comentarios.map((comentario) => (
                        <div key={comentario.id} className={styles.comentarioCard}>
                            <div className={styles.comentarioHeader}>
                                <span className={styles.autorNombre}>{comentario.autor_nombre}</span>
                                <span className={styles.fecha}>{formatDate(comentario.fecha_creacion)}</span>
                            </div>
                            <div className={styles.comentarioContent}>
                                <p>{comentario.comentario}</p>
                            </div>
                            <div className={styles.comentarioFooter}>
                                <button 
                                    className={styles.likeBtn}
                                    onClick={() => darLike(comentario.id)}
                                >
                                    👍 {comentario.likes || 0}
                                </button>
                            </div>
                        </div>
                    ))}

                    {comentarios.length === 0 && (
                        <div className={styles.noComentarios}>
                            <p>Aún no hay comentarios en este post</p>
                            <p>¡Sé el primero en comentar!</p>
                        </div>
                    )}
                </div>

                <div className={styles.reglasSection}>
                    <h4>📋 Reglas del Foro</h4>
                    <div className={styles.reglas}>
                        <div className={styles.regla}>✅ Sé respetuoso con todos los miembros</div>
                        <div className={styles.regla}>✅ Usa categorías apropiadas para tu post</div>
                        <div className={styles.regla}>✅ Busca antes de preguntar</div>
                        <div className={styles.regla}>✅ Usa títulos claros y descriptivos para tus posts</div>
                        <div className={styles.regla}>❌ No compartas información personal o datos sensibles</div>
                        <div className={styles.regla}>❌ No hagas spam o publicaciones repetitivas</div>
                        <div className={styles.regla}>❌ Mantén las discusiones enfocadas en temas académicos</div>
                        <div className={styles.regla}>❌ No uses el foro para quejas personales contra profesores</div>
                        <div className={styles.regla}>✅ Agradece a quienes te ayuden respondiendo tus dudas</div>
                        <div className={styles.regla}>❌ No publiques información falsa o rumores</div>
                        <div className={styles.regla}>✅ Participa activamente pero con calidad, no cantidad</div>
                        <div className={styles.regla}>✅ Mantén un ambiente constructivo y de aprendizaje</div>
                        <div className={styles.regla}>✅ Comparte recursos útiles que beneficien a la comunidad</div>
                    </div>
                </div>

                <div className={styles.responderSection}>
                    <h3>Responder</h3>
                    <form onSubmit={enviarComentario} className={styles.comentarioForm}>
                        <textarea
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            rows="5"
                            disabled={enviandoComentario}
                        />
                        <div className={styles.formActions}>
                            <button 
                                type="button"
                                className={styles.btnRegresar}
                                onClick={() => navigate('/foro-estudiante')}
                            >
                                Regresar
                            </button>
                            <button 
                                type="submit" 
                                disabled={!nuevoComentario.trim() || enviandoComentario}
                                className={styles.btnPublicar}
                            >
                                {enviandoComentario ? 'Publicando...' : 'Publicar Respuesta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostDetalle;