import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../css/NoticiaDetallePublico.module.css';

const NoticiaDetallePublico = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [noticia, setNoticia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const tiempoInicioRef = useRef(null);
    const vistaRegistradaRef = useRef(false);

    useEffect(() => {
        tiempoInicioRef.current = Date.now();
        cargarNoticia();
        
        return () => {
            registrarVistaAlSalir();
        };
    }, [id]);

    useEffect(() => {
        const interval = setInterval(() => {
            const tiempoTranscurrido = Date.now() - tiempoInicioRef.current;
            
            if (tiempoTranscurrido >= 10000 && !vistaRegistradaRef.current) {
                registrarVista();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const cargarNoticia = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/noticias/publicas/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setNoticia(data.data);
            } else {
                setError('Noticia no encontrada');
            }
        } catch (error) {
            console.error('Error al cargar noticia:', error);
            setError('Error al cargar la noticia');
        } finally {
            setLoading(false);
        }
    };

    const registrarVista = async () => {
        if (vistaRegistradaRef.current) return;
        
        try {
            await fetch(`http://localhost:5000/api/noticias/publicas/${id}/vista`, {
                method: 'POST'
            });
            vistaRegistradaRef.current = true;
            
            setNoticia(prev => prev ? { ...prev, vistas: prev.vistas + 1 } : null);
        } catch (error) {
            console.error('Error al registrar vista:', error);
        }
    };

    const registrarVistaAlSalir = () => {
        if (!vistaRegistradaRef.current && tiempoInicioRef.current) {
            const tiempoTranscurrido = Date.now() - tiempoInicioRef.current;
            if (tiempoTranscurrido >= 10000) {
                navigator.sendBeacon(`http://localhost:5000/api/noticias/publicas/${id}/vista`);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleVolver = () => {
        navigate('/noticias-publicas');
    };

    const handleIniciarSesion = () => {
        navigate('/login');
    };

    if (loading) {
        return (
            <div className={styles.noticiaDetalle}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando noticia...</p>
                </div>
            </div>
        );
    }

    if (error || !noticia) {
        return (
            <div className={styles.noticiaDetalle}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 onClick={handleVolver}>DTAI</h1>
                        <nav className={styles.headerNav}>
                            <button 
                                className={styles.navItem}
                                onClick={handleVolver}
                            >
                                ← Volver a Noticias
                            </button>
                            <button 
                                className={styles.loginBtn}
                                onClick={handleIniciarSesion}
                            >
                                Iniciar sesión
                            </button>
                        </nav>
                    </div>
                </header>
                
                <div className={styles.errorContainer}>
                    <h2>Noticia no encontrada</h2>
                    <p>{error}</p>
                    <button onClick={handleVolver} className={styles.volverBtn}>
                        Volver a Noticias
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.noticiaDetalle}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 onClick={handleVolver}>DTAI</h1>
                    <nav className={styles.headerNav}>
                        <button 
                            className={styles.navItem}
                            onClick={handleVolver}
                        >
                            ← Volver a Noticias
                        </button>
                        <button 
                            className={styles.loginBtn}
                            onClick={handleIniciarSesion}
                        >
                            Iniciar sesión
                        </button>
                    </nav>
                </div>
            </header>

            <div className={styles.detalleContainer}>
                <article className={styles.noticiaArticle}>
                    <div className={styles.noticiaHeader}>
                        <div className={styles.breadcrumb}>
                            <span onClick={handleVolver}>Noticias</span>
                            <span>›</span>
                            <span>{noticia.categoria_nombre}</span>
                        </div>
                        
                        <div className={styles.categoriasContainer}>
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
                    </div>

                    <h1 className={styles.noticiaTitle}>{noticia.titulo}</h1>

                    <div className={styles.noticiaMetadata}>
                        <div className={styles.metadata}>
                            <span className={styles.autor}>
                                Por: {noticia.autor_nombre}
                            </span>
                            <span className={styles.fecha}>
                                📅 {formatDate(noticia.fecha_publicacion)}
                            </span>
                            <span className={styles.vistas}>
                                👁️ {noticia.vistas} vistas
                            </span>
                        </div>
                    </div>

                    {noticia.resumen && (
                        <div className={styles.resumenContainer}>
                            <p className={styles.resumen}>{noticia.resumen}</p>
                        </div>
                    )}

                    {noticia.imagen_url && (
                        <div className={styles.imagenContainer}>
                            <img 
                                src={noticia.imagen_url} 
                                alt={noticia.titulo}
                                className={styles.noticiaImagen}
                            />
                        </div>
                    )}

                    <div className={styles.contenidoContainer}>
                        <div 
                            className={styles.noticiaContenido}
                            dangerouslySetInnerHTML={{ __html: noticia.contenido.replace(/\n/g, '<br>') }}
                        />
                    </div>

                </article>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <p>© 2025 DTAI - División de Tecnologías de la Información. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default NoticiaDetallePublico;