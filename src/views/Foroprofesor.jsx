import { useState } from 'react';
import Header from '../components/header_profesor';
import styles from '../css/Foroprofesor.module.css';

const Foroprofesor = () => {
  // Datos estáticos de posts del foro (simulando base de datos)
  const [posts, setPosts] = useState([
    {
      id: 1,
      titulo: "¿Cómo puedo mejorar mi promedio en Cálculo Diferencial?",
      contenido: "Hola profesor, he estado teniendo dificultades con las derivadas y me gustaría saber qué estrategias recomienda para mejorar mi comprensión del tema.",
      estudiante: "Ana García",
      matricula: "2022371054",
      categoria: "Académico",
      fecha: "2025-01-15",
      likes: 12,
      respuestas: 3,
      respondido: true,
      isLiked: false
    },
    {
      id: 2,
      titulo: "Dudas sobre el proyecto final de Programación",
      contenido: "Profesor, tengo dudas sobre los requerimientos del proyecto final. ¿Podríamos tener una sesión de preguntas y respuestas?",
      estudiante: "Carlos López",
      matricula: "2023451287",
      categoria: "Proyecto",
      fecha: "2025-01-14",
      likes: 8,
      respuestas: 1,
      respondido: true,
      isLiked: true
    },
    {
      id: 3,
      titulo: "¿Habrá clases de recuperación para Física?",
      contenido: "Buenos días profesor, quería saber si habrá oportunidad de tener clases de recuperación antes del examen final de Física II.",
      estudiante: "María Rodríguez",
      matricula: "2021298743",
      categoria: "Consulta",
      fecha: "2025-01-13",
      likes: 5,
      respuestas: 0,
      respondido: false,
      isLiked: false
    },
    {
      id: 4,
      titulo: "Problemas con el laboratorio de Química",
      contenido: "Profesor, el laboratorio de química estuvo cerrado la semana pasada. ¿Cómo podemos reponer las prácticas perdidas?",
      estudiante: "Diego Martínez",
      matricula: "2024156892",
      categoria: "Técnico",
      fecha: "2025-01-12",
      likes: 15,
      respuestas: 2,
      respondido: true,
      isLiked: false
    },
    {
      id: 5,
      titulo: "Sugerencia para mejorar las clases virtuales",
      contenido: "Profesor, me gustaría sugerir que las clases virtuales tengan más interacción. Quizás podríamos usar herramientas como Kahoot o encuestas en vivo.",
      estudiante: "Sofia Hernández",
      matricula: "2022583741",
      categoria: "Sugerencia",
      fecha: "2025-01-11",
      likes: 20,
      respuestas: 5,
      respondido: true,
      isLiked: true
    }
  ]);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('fecha');

  // Estados para modales
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [responseText, setResponseText] = useState('');

  // Datos de respuestas (simuladas)
  const [answers] = useState({
    1: [
      {
        id: 1,
        autor: "Prof. Juan Pérez",
        tipo: "profesor",
        contenido: "Te recomiendo practicar más ejercicios de derivadas básicas y revisar las reglas fundamentales. También puedes agendar una tutoría conmigo.",
        fecha: "2025-01-15",
        likes: 8
      },
      {
        id: 2,
        autor: "Carlos López",
        tipo: "estudiante",
        contenido: "A mí me ayudó mucho usar Khan Academy para practicar derivadas paso a paso.",
        fecha: "2025-01-15",
        likes: 3
      },
      {
        id: 3,
        autor: "Prof. Juan Pérez",
        tipo: "profesor",
        contenido: "Excelente sugerencia Carlos. Khan Academy es una herramienta muy útil para reforzar conceptos.",
        fecha: "2025-01-15",
        likes: 5
      }
    ],
    2: [
      {
        id: 4,
        autor: "Prof. Juan Pérez",
        tipo: "profesor",
        contenido: "Programaré una sesión de Q&A el viernes a las 2 PM. Les compartiré el enlace por correo.",
        fecha: "2025-01-14",
        likes: 6
      }
    ],
    4: [
      {
        id: 5,
        autor: "Prof. Juan Pérez",
        tipo: "profesor",
        contenido: "El laboratorio estará disponible la próxima semana. Programaremos sesiones de recuperación los sábados.",
        fecha: "2025-01-12",
        likes: 10
      },
      {
        id: 6,
        autor: "Ana García",
        tipo: "estudiante",
        contenido: "Perfecto profesor, ¿podríamos conocer los horarios disponibles?",
        fecha: "2025-01-12",
        likes: 2
      }
    ],
    5: [
      {
        id: 7,
        autor: "Prof. Juan Pérez",
        tipo: "profesor",
        contenido: "Excelente sugerencia Sofia. Implementaré Kahoot en la próxima clase virtual.",
        fecha: "2025-01-11",
        likes: 12
      },
      {
        id: 8,
        autor: "María Rodríguez",
        tipo: "estudiante",
        contenido: "¡Me encanta la idea! También podríamos usar Padlet para lluvia de ideas.",
        fecha: "2025-01-11",
        likes: 4
      },
      {
        id: 9,
        autor: "Diego Martínez",
        tipo: "estudiante",
        contenido: "Apoyo la moción. Las clases interactivas son más dinámicas.",
        fecha: "2025-01-11",
        likes: 3
      },
      {
        id: 10,
        autor: "Prof. Juan Pérez",
        tipo: "profesor",
        contenido: "Perfecto, también revisaré Padlet. Gracias por las sugerencias constructivas.",
        fecha: "2025-01-11",
        likes: 8
      },
      {
        id: 11,
        autor: "Carlos López",
        tipo: "estudiante",
        contenido: "¿Podríamos tener pequeños quizzes durante la clase para mantener la atención?",
        fecha: "2025-01-11",
        likes: 6
      }
    ]
  });

  // Filtrar y ordenar posts
  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.estudiante.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === '' || post.categoria === filterCategory;
      const matchesStatus = filterStatus === '' || 
                           (filterStatus === 'respondido' && post.respondido) ||
                           (filterStatus === 'sin_responder' && !post.respondido);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.fecha) - new Date(a.fecha);
        case 'likes':
          return b.likes - a.likes;
        case 'respuestas':
          return b.respuestas - a.respuestas;
        default:
          return 0;
      }
    });

  // Obtener categorías únicas
  const categories = [...new Set(posts.map(p => p.categoria))];

  // Funciones para manejar acciones
  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const handleDelete = (postId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta pregunta? Esta acción no se puede deshacer.')) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleResponse = (post) => {
    setSelectedPost(post);
    setResponseText('');
    setShowResponseModal(true);
  };

  const handleViewAnswers = (post) => {
    setSelectedPost(post);
    setShowAnswersModal(true);
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    // Simular agregar respuesta
    console.log(`Respuesta para post ${selectedPost.id}: ${responseText}`);
    
    // Marcar como respondido si no lo estaba
    setPosts(posts.map(post => 
      post.id === selectedPost.id 
        ? { ...post, respondido: true, respuestas: post.respuestas + 1 }
        : post
    ));
    
    setShowResponseModal(false);
    setResponseText('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Académico': '#3498db',
      'Proyecto': '#e74c3c', 
      'Consulta': '#f39c12',
      'Técnico': '#9b59b6',
      'Sugerencia': '#27ae60'
    };
    return colors[category] || '#95a5a6';
  };

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
              <div className={styles.statNumber}>{posts.length}</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#f3e5f5'}}>✅</div>
            <div className={styles.statInfo}>
              <h3>Respondidas</h3>
              <div className={styles.statNumber}>{posts.filter(p => p.respondido).length}</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#fff3e0'}}>⏳</div>
            <div className={styles.statInfo}>
              <h3>Pendientes</h3>
              <div className={styles.statNumber}>{posts.filter(p => !p.respondido).length}</div>
            </div>
          </div>
          
          
        </div>

        {/* Controles y filtros */}
        <div className={styles.controls}>
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Buscar por título, contenido o estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filters}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value="respondido">Respondidas</option>
              <option value="sin_responder">Sin responder</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="fecha">Más recientes</option>
              <option value="likes">Más likes</option>
              <option value="respuestas">Más respuestas</option>
            </select>
          </div>
        </div>

        {/* Lista de posts */}
        <div className={styles.postsContainer}>
          {filteredPosts.length === 0 ? (
            <div className={styles.noResults}>
              <p>No se encontraron preguntas con los filtros aplicados.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <div className={styles.postInfo}>
                    <h3 className={styles.postTitle}>{post.titulo}</h3>
                    <div className={styles.postMeta}>
                      <span className={styles.student}>{post.estudiante}</span>
                      <span className={styles.matricula}>({post.matricula})</span>
                      <span className={styles.date}>{formatDate(post.fecha)}</span>
                      <span 
                        className={styles.category}
                        style={{backgroundColor: getCategoryColor(post.categoria)}}
                      >
                        {post.categoria}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.postActions}>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(post.id)}
                      title="Eliminar pregunta"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className={styles.postContent}>
                  <p>{post.contenido}</p>
                </div>
                
                <div className={styles.postFooter}>
                  <div className={styles.postStats}>
                    <button 
                      className={`${styles.likeButton} ${post.isLiked ? styles.liked : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      ❤️ {post.likes}
                    </button>
                    
                    <span className={styles.responsesCount}>
                      💬 {post.respuestas} respuesta{post.respuestas !== 1 ? 's' : ''}
                    </span>
                    
                    <span className={`${styles.status} ${post.respondido ? styles.answered : styles.pending}`}>
                      {post.respondido ? '✅ Respondida' : '⏳ Pendiente'}
                    </span>
                  </div>
                  
                  <div className={styles.actionButtons}>
                    {post.respuestas > 0 && (
                      <button 
                        className={styles.viewAnswersButton}
                        onClick={() => handleViewAnswers(post)}
                      >
                        Ver Respuestas
                      </button>
                    )}
                    
                    <button 
                      className={styles.responseButton}
                      onClick={() => handleResponse(post)}
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal para responder */}
        {showResponseModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Responder Pregunta</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowResponseModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalContent}>
                <div className={styles.originalPost}>
                  <h4>Pregunta original:</h4>
                  <p><strong>{selectedPost?.titulo}</strong></p>
                  <p>{selectedPost?.contenido}</p>
                  <small>Por: {selectedPost?.estudiante}</small>
                </div>
                
                <form onSubmit={handleSubmitResponse} className={styles.responseForm}>
                  <div className={styles.formGroup}>
                    <label>Tu respuesta:</label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      required
                      rows={6}
                    />
                  </div>
                  
                  <div className={styles.modalActions}>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => setShowResponseModal(false)}
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

        {/* Modal para ver respuestas */}
        {showAnswersModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Todas las Respuestas</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowAnswersModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalContent}>
                <div className={styles.originalPost}>
                  <h4>{selectedPost?.titulo}</h4>
                  <p>{selectedPost?.contenido}</p>
                  <small>Por: {selectedPost?.estudiante} - {formatDate(selectedPost?.fecha)}</small>
                </div>
                
                <div className={styles.answersSection}>
                  <h4>Respuestas ({selectedPost?.respuestas}):</h4>
                  
                  {answers[selectedPost?.id]?.map(answer => (
                    <div key={answer.id} className={styles.answerCard}>
                      <div className={styles.answerHeader}>
                        <span className={`${styles.answerAuthor} ${answer.tipo === 'profesor' ? styles.professor : styles.student}`}>
                          {answer.autor}
                          {answer.tipo === 'profesor' && <span className={styles.professorBadge}>👨‍🏫 Profesor</span>}
                        </span>
                        <span className={styles.answerDate}>{formatDate(answer.fecha)}</span>
                      </div>
                      
                      <div className={styles.answerContent}>
                        <p>{answer.contenido}</p>
                      </div>
                      
                      <div className={styles.answerFooter}>
                        <span className={styles.answerLikes}>❤️ {answer.likes}</span>
                      </div>
                    </div>
                  ))}
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