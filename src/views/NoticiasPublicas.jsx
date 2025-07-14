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

    if (loading) {
        return (
            <div className={styles.noticiasPublicas}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando noticias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.noticiasPublicas}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>DTAI</h1>
                    <nav className={styles.headerNav}>
                        <span className={styles.navItem}>Noticias</span>
                        <button 
                            className={styles.loginBtn}
                            onClick={handleIniciarSesion}
                        >
                            Iniciar sesión
                        </button>
                    </nav>
                </div>
            </header>

            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>Bienvenido a DTAI</h1>
                    <p>División de Tecnologías de la Información</p>
                </div>
            </div>

            <div className={styles.statsSection}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statNumber}>{stats.estudiantes.toLocaleString()}</div>
                    <div className={styles.statLabel}>Estudiantes</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👨‍🏫</div>
                    <div className={styles.statNumber}>{stats.profesores}</div>
                    <div className={styles.statLabel}>Profesores</div>
                </div>
            </div>

            <div className={styles.noticiasContainer}>
                <div className={styles.noticiasContent}>
                    <h2>Últimas Noticias</h2>
                    
                    {noticias.length > 0 ? (
                        <div className={styles.noticiasGrid}>
                            {noticias.map((noticia) => (
                                <div 
                                    key={noticia.id} 
                                    className={`${styles.noticiaCard} ${noticia.es_destacada ? styles.destacada : ''}`}
                                    onClick={() => handleVerNoticia(noticia.id)}
                                >
                                    {noticia.imagen_url && (
                                        <div className={styles.noticiaImagen}>
                                            <img src={noticia.imagen_url} alt={noticia.titulo} />
                                        </div>
                                    )}
                                    
                                    <div className={styles.noticiaContent}>
                                        <div className={styles.noticiaHeader}>
                                            <span 
                                                className={styles.categoriaBadge}
                                                style={{ backgroundColor: noticia.categoria_color }}
                                            >
                                                {noticia.categoria_nombre}
                                            </span>
                                            {noticia.es_destacada && (
                                                <span className={styles.destacadaBadge}>⭐ Destacada</span>
                                            )}
                                        </div>
                                        
                                        <h3 className={styles.noticiaTitle}>{noticia.titulo}</h3>
                                        
                                        <p className={styles.noticiaResumen}>
                                            {noticia.resumen || noticia.contenido.substring(0, 150) + '...'}
                                        </p>
                                        
                                        <div className={styles.noticiaFooter}>
                                            <span className={styles.fecha}>
                                                📅 {formatDate(noticia.fecha_publicacion)}
                                            </span>
                                            <span className={styles.vistas}>
                                                👁️ {noticia.vistas} vistas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noNoticias}>
                            <p>No hay noticias disponibles en este momento</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <p>© 2025 DTAI - División de Tecnologías de la Información. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default NoticiasPublicas;