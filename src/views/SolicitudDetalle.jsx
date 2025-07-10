import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/SolicitudDetalle.module.css';

const SolicitudDetalle = () => {
    const [solicitud, setSolicitud] = useState(null);
    const [chatHistorial, setChatHistorial] = useState([]);
    const [respuesta, setRespuesta] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const { id } = useParams();
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

        fetchSolicitudDetalle();
    }, [navigate, id]);

    const fetchSolicitudDetalle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes-ayuda/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSolicitud(data.data.solicitud);
                setChatHistorial(data.data.chatHistorial);
            }
        } catch (error) {
            console.error('Error al cargar solicitud:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVolver = () => {
        navigate('/centro-ayuda-directivo');
    };

    const handleEnviarRespuesta = async () => {
        if (!respuesta.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/solicitudes-ayuda/${id}/responder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    respuesta: respuesta,
                    estado: 'en_atencion'
                })
            });

            const data = await response.json();
            if (data.success) {
                setRespuesta('');
                fetchSolicitudDetalle(); 
            }
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
        } finally {
            setSending(false);
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.dashboardLoading}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Cargando solicitud...</p>
                </div>
            </div>
        );
    }

    if (!solicitud) {
        return (
            <div className={styles.dashboardContainer}>
                <HeaderDirectivo activeSection="ayuda" />
                <main className={styles.dashboardMain}>
                    <div className={styles.errorState}>
                        <h2>Solicitud no encontrada</h2>
                        <button onClick={handleVolver} className={styles.btnBack}>
                            Volver al Centro de Ayuda
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <HeaderDirectivo activeSection="ayuda" />
            
            <main className={styles.dashboardMain}>
                <div className={styles.solicitudDetalleContent}>
                    <div className={styles.pageHeader}>
                        <div className={styles.headerInfo}>
                            <h2>Respuesta a tu Solicitud de Ayuda</h2>
                        </div>
                    </div>

                    <div className={styles.solicitudCard}>
                        <div className={styles.solicitudHeader}>
                            <div className={styles.solicitudInfo}>
                                <h3>Solicitud #{solicitud.id.toString().padStart(3, '0')}</h3>
                                <span className={styles.fecha}>{formatFecha(solicitud.fecha_solicitud)}</span>
                            </div>
                        </div>

                        <div className={styles.solicitudOriginal}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionIcon}>👤</span>
                                <span>Tu Solicitud Original</span>
                            </div>
                            
                            <div className={styles.solicitudContent}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Asunto:</span>
                                    <span className={styles.value}>{solicitud.tipo_problema}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Descripción:</span>
                                    <p className={styles.descripcion}>{solicitud.descripcion_problema}</p>
                                </div>
                            </div>
                        </div>
                        
                        {solicitud.respuesta && (
                            <div className={styles.respuestaProfesor}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>👨‍🏫</span>
                                    <span>Respuesta del Profesor</span>
                                </div>
                                
                                <div className={styles.profesorInfo}>
                                    <span className={styles.profesorNombre}>
                                        Dr. {solicitud.directivo_nombre || 'Roberto'} {solicitud.directivo_apellido || 'Martínez'}
                                    </span>
                                    <span className={styles.profesorCargo}>Profesor de Estructuras de Datos</span>
                                    <span className={styles.fechaRespuesta}>
                                        Fecha respuesta: {formatFecha(solicitud.fecha_respuesta)}
                                    </span>
                                </div>
                                
                                <div className={styles.respuestaContent}>
                                    <p>{solicitud.respuesta}</p>
                                </div>
                            </div>
                        )}
                        
                        {!solicitud.respuesta && (
                            <div className={styles.nuevaRespuesta}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>✍️</span>
                                    <span>Proporcionar Respuesta</span>
                                </div>
                                
                                <div className={styles.respuestaForm}>
                                    <textarea
                                        value={respuesta}
                                        onChange={(e) => setRespuesta(e.target.value)}
                                        placeholder="Escribe tu respuesta al estudiante..."
                                        rows={6}
                                        className={styles.respuestaTextarea}
                                    />
                                    
                                    <div className={styles.formActions}>
                                        <button 
                                            onClick={handleVolver}
                                            className={styles.btnCancel}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleEnviarRespuesta}
                                            className={styles.btnSend}
                                            disabled={!respuesta.trim() || sending}
                                        >
                                            {sending ? 'Enviando...' : 'Enviar Respuesta'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {solicitud.respuesta && (
                            <div className={styles.actionsFooter}>
                                <button onClick={handleVolver} className={styles.btnClose}>
                                    ✕ Cerrar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SolicitudDetalle;