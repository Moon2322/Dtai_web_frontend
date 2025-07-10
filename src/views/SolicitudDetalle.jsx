import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/SolicitudDetalle.css';

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
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando solicitud...</p>
                </div>
            </div>
        );
    }

    if (!solicitud) {
        return (
            <div className="dashboard-container">
                <HeaderDirectivo activeSection="ayuda" />
                <main className="dashboard-main">
                    <div className="error-state">
                        <h2>Solicitud no encontrada</h2>
                        <button onClick={handleVolver} className="btn-back">
                            Volver al Centro de Ayuda
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="ayuda" />
            
            <main className="dashboard-main">
                <div className="solicitud-detalle-content">
                    <div className="page-header">
                        <div className="header-info">
                            <h2>Respuesta a tu Solicitud de Ayuda</h2>
                        </div>
                    </div>

                    <div className="solicitud-card">
                        <div className="solicitud-header">
                            <div className="solicitud-info">
                                <h3>Solicitud #{solicitud.id.toString().padStart(3, '0')}</h3>
                                <span className="fecha">{formatFecha(solicitud.fecha_solicitud)}</span>
                            </div>
                        </div>

                        <div className="solicitud-original">
                            <div className="section-header">
                                <span className="section-icon">👤</span>
                                <span>Tu Solicitud Original</span>
                            </div>
                            
                            <div className="solicitud-content">
                                <div className="info-row">
                                    <span className="label">Asunto:</span>
                                    <span className="value">{solicitud.tipo_problema}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Descripción:</span>
                                    <p className="descripcion">{solicitud.descripcion_problema}</p>
                                </div>
                            </div>
                        </div>
                        {solicitud.respuesta && (
                            <div className="respuesta-profesor">
                                <div className="section-header">
                                    <span className="section-icon">👨‍🏫</span>
                                    <span>Respuesta del Profesor</span>
                                </div>
                                
                                <div className="profesor-info">
                                    <span className="profesor-nombre">
                                        Dr. {solicitud.directivo_nombre || 'Roberto'} {solicitud.directivo_apellido || 'Martínez'}
                                    </span>
                                    <span className="profesor-cargo">Profesor de Estructuras de Datos</span>
                                    <span className="fecha-respuesta">
                                        Fecha respuesta: {formatFecha(solicitud.fecha_respuesta)}
                                    </span>
                                </div>
                                
                                <div className="respuesta-content">
                                    <p>{solicitud.respuesta}</p>
                                </div>
                            </div>
                        )}
                        {!solicitud.respuesta && (
                            <div className="nueva-respuesta">
                                <div className="section-header">
                                    <span className="section-icon">✍️</span>
                                    <span>Proporcionar Respuesta</span>
                                </div>
                                
                                <div className="respuesta-form">
                                    <textarea
                                        value={respuesta}
                                        onChange={(e) => setRespuesta(e.target.value)}
                                        placeholder="Escribe tu respuesta al estudiante..."
                                        rows={6}
                                        className="respuesta-textarea"
                                    />
                                    
                                    <div className="form-actions">
                                        <button 
                                            onClick={handleVolver}
                                            className="btn-cancel"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleEnviarRespuesta}
                                            className="btn-send"
                                            disabled={!respuesta.trim() || sending}
                                        >
                                            {sending ? 'Enviando...' : 'Enviar Respuesta'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {solicitud.respuesta && (
                            <div className="actions-footer">
                                <button onClick={handleVolver} className="btn-close">
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