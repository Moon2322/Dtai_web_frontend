import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/NoticiasPublicas.module.css';

const NoticiasPublicas = () => {
    const navigate = useNavigate();
    const [noticias, setNoticias] = useState([]);
    const [stats, setStats] = useState({
        estudiantes: 0,
        profesores: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            const [noticiasResponse, statsResponse] = await Promise.all([
                fetch('http://localhost:5000/api/noticias/publicas'),
                fetch('http://localhost:5000/api/stats/publicas')
            ]);

            const noticiasData = await noticiasResponse.json();
            const statsData = await statsResponse.json();

            if (noticiasData.success) {
                setNoticias(noticiasData.data);
            }

            if (statsData.success) {
                setStats(statsData.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerNoticia = (noticiaId) => {
        navigate(`/noticia-detalle/${noticiaId}`);
    };

    const handleIniciarSesion = () => {
        navigate('/login');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getCategoriaColor = (categoria) => {
        const colores = {
            'academico': '#3BA6FF',
            'eventos': '#10B981',
            'avisos': '#F59E0B',
            'becas': '#8B5CF6',
            'deportes': '#EF4444',
            'cultura': '#EC4899'
        };
        return colores[categoria] || '#6B7280';
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando noticias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* ✨ Header mejorado - mismo estilo que Login */}
            <header className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.logoSection}>
                        <div className={styles.logoIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className={styles.logoText}>
                            <h1>DTAI</h1>
                            <p>Universidad Tecnológica de Querétaro</p>
                        </div>
                    </div>
                    
                    <nav className={styles.headerNav}>
                        <button className={styles.navButton}>
                            Noticias
                        </button>
                        
                        
                        <button 
                            className={styles.loginButton}
                            onClick={handleIniciarSesion}
                        >
                            Iniciar Sesión
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section mejorado */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>Noticias y Eventos DTAI</h1>
                    <p>Mantente informado de las últimas noticias, eventos y actividades de nuestra universidad</p>
                </div>
            </section>

            {/* Stats Section mejorado */}
            <section className={styles.statsSection}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👨‍🎓</div>
                    <span className={styles.statNumber}>{stats.estudiantes || '1,500+'}</span>
                    <span className={styles.statLabel}>Estudiantes Activos</span>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👨‍🏫</div>
                    <span className={styles.statNumber}>{stats.profesores || '150+'}</span>
                    <span className={styles.statLabel}>Profesores</span>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📰</div>
                    <span className={styles.statNumber}>{noticias.length}</span>
                    <span className={styles.statLabel}>Noticias Publicadas</span>
                </div>
                
            </section>

            {/* Contenido de Noticias */}
            <main className={styles.noticiasContainer}>
                <div className={styles.noticiasContent}>
                    <h2>Últimas Noticias</h2>
                    {noticias.length > 0 ? (
                        <div className={styles.noticiasGrid}>
                            {noticias.map((noticia) => (
                                <article 
                                    key={noticia.id} 
                                    className={`${styles.noticiaCard} ${noticia.destacada ? styles.destacada : ''}`}
                                    onClick={() => handleVerNoticia(noticia.id)}
                                >
                                    {noticia.imagen_url && (
                                        <div className={styles.noticiaImagen}>
                                            <img 
                                                src={noticia.imagen_url} 
                                                alt={noticia.titulo}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className={styles.noticiaContent}>
                                        <div className={styles.noticiaHeader}>
                                            <span 
                                                className={styles.categoriaBadge}
                                                style={{ backgroundColor: getCategoriaColor(noticia.categoria) }}
                                            >
                                                {noticia.categoria}
                                            </span>
                                            {noticia.destacada && (
                                                <span className={styles.destacadaBadge}>
                                                    ⭐ Destacada
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className={styles.noticiaTitle}>{noticia.titulo}</h3>
                                        <p className={styles.noticiaResumen}>{noticia.resumen}</p>
                                        
                                        <div className={styles.noticiaFooter}>
                                            <div className={styles.fecha}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {formatDate(noticia.fecha_publicacion)}
                                            </div>
                                            <div className={styles.vistas}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                                </svg>
                                                {noticia.vistas || 0} vistas
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noNoticias}>
                            <h3>No hay noticias disponibles</h3>
                            <p>Revisa más tarde para ver las últimas actualizaciones</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer mejorado */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <div className={styles.footerLogo}>
                            <div className={styles.footerLogoIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h3>DTAI</h3>
                                <p>Universidad Tecnológica de Querétaro</p>
                            </div>
                        </div>
                        <p>Formando profesionales de excelencia para el futuro tecnológico de México.</p>
                    </div>
                    
                    <div className={styles.footerLinks}>
                        <div className={styles.linkColumn}>
                            <h4>Universidad</h4>
                            <ul>
                                <li><a href="https://www.uteq.edu.mx/Aspirante/OfertaEducativa.aspx">Carreras</a></li>
                                <li><a href="https://admisiones.uteq.edu.mx/">Admisiones</a></li>
                            </ul>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4>Estudiantes</h4>
                            <ul>
                                <li><a href="https://www.uteq.edu.mx/Alumno/Default.aspx?gI2Sr=251">Calendario</a></li>
                                <li><a href="https://www.uteq.edu.mx/Alumno/Default.aspx?gI2Sr=232">Biblioteca</a></li>
                            </ul>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4>Conecta</h4>
                            <ul>
                                <li><a href="https://www.facebook.com/UTEQro/">Facebook</a></li>
                                
                                <li><a href="https://www.linkedin.com/school/uteq/">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className={styles.footerBottom}>
                    <p>&copy; 2025 DTAI - Universidad Tecnológica de Querétaro. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default NoticiasPublicas;