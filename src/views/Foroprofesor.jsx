import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header_profesor';
import styles from '../css/Foroprofesor.module.css';

const Foroprofesor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Estados para filtros y búsqueda
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    estado: '',
    ordenar: 'fecha_desc'
  });

  // Estados para modales
  const [mostrarModalRespuesta, setMostrarModalRespuesta] = useState(false);
  const [mostrarModalComentarios, setMostrarModalComentarios] = useState(false);
  const [postSeleccionado, setPostSeleccionado] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [comentarios, setComentarios] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación
    const userData = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.rol !== 'profesor') {
      navigate('/login');
      return;
    }

    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Cargar posts del foro
      const postsRes = await fetch('http://localhost:5000/api/profesor/foro/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Cargar categorías del foro
      const categoriasRes = await fetch('http://localhost:5000/api/foro/categorias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const [postsData, categoriasData] = await Promise.all([
        postsRes.json(),
        categoriasRes.json()
      ]);

      if (postsData.success) {
        setPosts(postsData.data);
      }

      if (categoriasData.success) {
        setCategorias(categoriasData.data);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del foro');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar posts
  const postsFiltrados = posts.filter(post => {
    const coincideBusqueda = !filtros.busqueda || 
      post.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      post.contenido.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      post.autor_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());

    const coincideCategoria = !filtros.categoria || post.categoria_id.toString() === filtros.categoria;
    
    const coincideEstado = !filtros.estado || 
      (filtros.estado === 'respondido' && post.comentarios_count > 0) ||
      (filtros.estado === 'sin_responder' && post.comentarios_count === 0);

    return coincideBusqueda && coincideCategoria && coincideEstado;
  }).sort((a, b) => {
    switch (filtros.ordenar) {
      case 'fecha_desc':
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
      case 'fecha_asc':
        return new Date(a.fecha_creacion) - new Date(b.fecha_creacion);
      case 'likes_desc':
        return b.likes - a.likes;
      case 'comentarios_desc':
        return b.comentarios_count - a.comentarios_count;
      default:
        return 0;
    }
  });

  // Manejar cambios en filtros
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Dar like a un post
  const darLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/foro/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar el estado local
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: data.likes, user_liked: data.user_liked }
            : post
        ));
      }
    } catch (error) {
      console.error('Error al dar like:', error);
      alert('Error al procesar el like');
    }
  };

  // Abrir modal para responder
  const abrirModalRespuesta = (post) => {
    setPostSeleccionado(post);
    setTextoRespuesta('');
    setMostrarModalRespuesta(true);
  };

  // Enviar respuesta
  const enviarRespuesta = async (e) => {
    e.preventDefault();
    
    if (!textoRespuesta.trim()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/foro/posts/${postSeleccionado.id}/comentarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenido: textoRespuesta
        })
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar contador de comentarios
        setPosts(prev => prev.map(post => 
          post.id === postSeleccionado.id 
            ? { ...post, comentarios_count: post.comentarios_count + 1 }
            : post
        ));
        
        setMostrarModalRespuesta(false);
        setTextoRespuesta('');
        alert('Respuesta enviada exitosamente');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      alert('Error al enviar la respuesta');
    }
  };

  // Ver comentarios/respuestas
  const verComentarios = async (post) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/foro/posts/${post.id}/comentarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setComentarios(data.data);
        setPostSeleccionado(post);
        setMostrarModalComentarios(true);
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      alert('Error al cargar los comentarios');
    }
  };

  // Eliminar post
  const eliminarPost = async (postId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profesor/foro/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        alert('Pregunta eliminada exitosamente');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error al eliminar post:', error);
      alert('Error al eliminar la pregunta');
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color de categoría
  const obtenerColorCategoria = (categoria) => {
    const colores = {
      'Académico': '#3498db',
      'Proyecto': '#e74c3c',
      'Consulta': '#f39c12',
      'Técnico': '#9b59b6',
      'Sugerencia': '#27ae60',
      'General': '#95a5a6'
    };
    return colores[categoria] || '#95a5a6';
  };

  // Calcular estadísticas
  const estadisticas = {
    total: posts.length,
    pendientes: posts.filter(p => p.comentarios_count === 0).length,
    respondidas: posts.filter(p => p.comentarios_count > 0).length,
    likes_total: posts.reduce((sum, p) => sum + p.likes, 0)
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando foro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={cargarDatos} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1>Foro Estudiantil</h1>
          <p>Gestiona las preguntas y participación de tus estudiantes</p>
        </div>

        {/* Estadísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#e3f2fd'}}>📝</div>
            <div className={styles.statInfo}>
              <h3>Total Preguntas</h3>
              <div className={styles.statNumber}>{estadisticas.total}</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#ffebee'}}>❓</div>
            <div className={styles.statInfo}>
              <h3>Sin Responder</h3>
              <div className={styles.statNumber}>{estadisticas.pendientes}</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#e8f5e8'}}>✅</div>
            <div className={styles.statInfo}>
              <h3>Respondidas</h3>
              <div className={styles.statNumber}>{estadisticas.respondidas}</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#fff3e0'}}>👍</div>
            <div className={styles.statInfo}>
              <h3>Likes Totales</h3>
              <div className={styles.statNumber}>{estadisticas.likes_total}</div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Buscar preguntas, contenido o estudiantes..."
              value={filtros.busqueda}
              onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filtersSection}>
            <select
              value={filtros.categoria}
              onChange={(e) => manejarCambioFiltro('categoria', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            
            <select
              value={filtros.estado}
              onChange={(e) => manejarCambioFiltro('estado', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value="sin_responder">Sin responder</option>
              <option value="respondido">Respondidas</option>
            </select>
            
            <select
              value={filtros.ordenar}
              onChange={(e) => manejarCambioFiltro('ordenar', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="fecha_desc">Más recientes</option>
              <option value="fecha_asc">Más antiguas</option>
              <option value="likes_desc">Más likes</option>
              <option value="comentarios_desc">Más comentarios</option>
            </select>
          </div>
        </div>

        {/* Lista de Posts */}
        <div className={styles.postsContainer}>
          {postsFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>No hay preguntas</h3>
              <p>No se encontraron preguntas con los filtros aplicados</p>
            </div>
          ) : (
            postsFiltrados.map(post => (
              <div key={post.id} className={styles.postCard}>
                
                {/* Header del post */}
                <div className={styles.postHeader}>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{post.autor_nombre}</span>
                    <span className={styles.postDate}>
                      {formatearFecha(post.fecha_creacion)}
                    </span>
                  </div>
                  
                  <div className={styles.postMeta}>
                    <span 
                      className={styles.categoryTag}
                      style={{ backgroundColor: obtenerColorCategoria(post.categoria_nombre) }}
                    >
                      {post.categoria_nombre}
                    </span>
                    
                    {post.es_fijado && (
                      <span className={styles.pinnedTag}>📌 Fijado</span>
                    )}
                  </div>
                </div>

                {/* Contenido del post */}
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.titulo}</h3>
                  <p className={styles.postText}>
                    {post.contenido.length > 200 
                      ? `${post.contenido.substring(0, 200)}...` 
                      : post.contenido
                    }
                  </p>
                </div>

                {/* Footer del post */}
                <div className={styles.postFooter}>
                  <div className={styles.postStats}>
                    <button 
                      className={`${styles.likeButton} ${post.user_liked ? styles.liked : ''}`}
                      onClick={() => darLike(post.id)}
                    >
                      👍 {post.likes}
                    </button>
                    
                    <span className={styles.statItem}>
                      💬 {post.comentarios_count} respuestas
                    </span>
                    
                    <span className={styles.statItem}>
                      👁️ {post.vistas} vistas
                    </span>
                  </div>
                  
                  <div className={styles.postActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => abrirModalRespuesta(post)}
                    >
                      💬 Responder
                    </button>
                    
                    {post.comentarios_count > 0 && (
                      <button 
                        className={styles.actionButton}
                        onClick={() => verComentarios(post)}
                      >
                        👁️ Ver respuestas
                      </button>
                    )}
                    
                    <button 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => eliminarPost(post.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Modal para responder */}
        {mostrarModalRespuesta && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Responder Pregunta</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setMostrarModalRespuesta(false)}
                >
                  ❌
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.originalPost}>
                  <h4>Pregunta original:</h4>
                  <p><strong>{postSeleccionado?.titulo}</strong></p>
                  <p>{postSeleccionado?.contenido}</p>
                  <small>Por: {postSeleccionado?.autor_nombre}</small>
                </div>
                
                <form onSubmit={enviarRespuesta}>
                  <div className={styles.formGroup}>
                    <label>Tu respuesta:</label>
                    <textarea
                      value={textoRespuesta}
                      onChange={(e) => setTextoRespuesta(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      rows="6"
                      className={styles.textarea}
                      required
                    />
                  </div>
                  
                  <div className={styles.modalActions}>
                    <button 
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setMostrarModalRespuesta(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className={styles.submitButton}
                    >
                      Enviar Respuesta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver comentarios */}
        {mostrarModalComentarios && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Respuestas y Comentarios</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setMostrarModalComentarios(false)}
                >
                  ❌
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.originalPost}>
                  <h4>{postSeleccionado?.titulo}</h4>
                  <p>{postSeleccionado?.contenido}</p>
                  <small>Por: {postSeleccionado?.autor_nombre}</small>
                </div>
                
                <div className={styles.comentariosLista}>
                  <h4>Respuestas ({comentarios.length}):</h4>
                  {comentarios.length === 0 ? (
                    <p className={styles.noComentarios}>Aún no hay respuestas</p>
                  ) : (
                    comentarios.map(comentario => (
                      <div key={comentario.id} className={styles.comentarioItem}>
                        <div className={styles.comentarioHeader}>
                          <span className={styles.comentarioAutor}>
                            {comentario.autor_nombre}
                          </span>
                          <span className={styles.comentarioFecha}>
                            {formatearFecha(comentario.fecha_creacion)}
                          </span>
                        </div>
                        <p className={styles.comentarioContenido}>
                          {comentario.contenido}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Foroprofesor;