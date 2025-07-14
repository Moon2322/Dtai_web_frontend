import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import styles from '../css/SolicitudAyudaDetalle.module.css';

const SolicitudAyudaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [solicitud, setSolicitud] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [enviandoMensaje, setEnviandoMensaje] = useState(false);

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

        cargarSolicitudDetalle();
        cargarMensajes();
    }, [id]);

    const cargarSolicitudDetalle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/alumno/solicitudes-ayuda`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const solicitudEncontrada = data.data.find(s => s.id === parseInt(id));
                setSolicitud(solicitudEncontrada);
            }
        } catch (error) {
            console.error('Error al cargar solicitud:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarMensajes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/chat-ayuda/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMensajes(data.data);
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim()) return;

        try {
            setEnviandoMensaje(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/chat-ayuda/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mensaje: nuevoMensaje,
                    tipo_usuario: 'alumno'
                })
            });

            const data = await response.json();
            if (data.success) {
                setNuevoMensaje('');
                cargarMensajes();
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        } finally {
            setEnviandoMensaje(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'pendiente': { class: 'pendiente', text: 'Pendiente' },
            'en_atencion': { class: 'enAtencion', text: 'En Atención' },
            'resuelto': { class: 'resuelto', text: 'Resuelto' },
            'cerrado': { class: 'cerrado', text: 'Cerrado' }
        };
        return badges[estado] || badges['pendiente'];
    };

    if (loading) {
        return (
            <div className={styles.solicitudDetalle}>
                <HeaderEstudiante activeSection="centro-ayuda" />
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando solicitud...</p>
                </div>
            </div>
        );
    }

    if (!solicitud) {
        return (
            <div className={styles.solicitudDetalle}>
                <HeaderEstudiante activeSection="centro-ayuda" />
                <div className={styles.errorContainer}>
                    <p>Solicitud no encontrada</p>
                    <button onClick={() => navigate('/centro-ayuda-estudiante')}>
                        Volver al Centro de Ayuda
                    </button>
                </div>
            </div>
        );
    }

    const estadoBadge = getEstadoBadge(solicitud.estado);

    return (
        <div className={styles.solicitudDetalle}>
            <HeaderEstudiante activeSection="centro-ayuda" />
            
            <div className={styles.detalleContent}>
                <div className={styles.headerSection}>
                    <button 
                        className={styles.btnVolver}
                        onClick={() => navigate('/centro-ayuda-estudiante')}
                    >
                        ← Volver
                    </button>
                    <h1>Respuesta a tu Solicitud de Ayuda</h1>
                </div>

                <div className={styles.solicitudCard}>
                    <div className={styles.solicitudHeader}>
                        <h2>Solicitud #{solicitud.id.toString().padStart(3, '0')}</h2>
                        <span className={styles.fecha}>{formatDate(solicitud.fecha_solicitud)}</span>
                    </div>

                    <div className={styles.solicitudInfo}>
                        <div className={styles.infoSection}>
                            <h3>🔵 Tu Solicitud Original</h3>
                            <div className={styles.infoItem}>
                                <strong>Asunto:</strong>
                                <span>{solicitud.tipo_problema}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <strong>Descripción:</strong>
                                <p>{solicitud.descripcion_problema}</p>
                            </div>
                        </div>

                        <div className={styles.estadoSection}>
                            <span className={`${styles.estadoBadge} ${styles[estadoBadge.class]}`}>
                                {estadoBadge.text}
                            </span>
                            {solicitud.asignado_a_nombre && (
                                <p className={styles.asignado}>
                                    Asignado a: {solicitud.asignado_a_nombre}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.chatSection}>
                    <div className={styles.chatHeader}>
                        <h3>💬 Conversación</h3>
                    </div>
                    
                    <div className={styles.chatMessages}>
                        {mensajes.length > 0 ? (
                            mensajes.map((mensaje) => (
                                <div 
                                    key={mensaje.id} 
                                    className={`${styles.mensaje} ${
                                        mensaje.tipo_usuario === 'alumno' ? styles.mensajeAlumno : styles.mensajeProfesor
                                    }`}
                                >
                                    <div className={styles.mensajeHeader}>
                                        <span className={styles.autor}>
                                            {mensaje.tipo_usuario === 'alumno' ? 'Tú' : mensaje.nombre_usuario}
                                        </span>
                                        <span className={styles.hora}>
                                            {formatTime(mensaje.fecha_mensaje)}
                                        </span>
                                    </div>
                                    <div className={styles.mensajeContenido}>
                                        {mensaje.mensaje}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noMensajes}>
                                <p>Aún no hay mensajes en esta conversación</p>
                                <p>Escribe el primer mensaje para iniciar el diálogo</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={enviarMensaje} className={styles.chatForm}>
                        <div className={styles.inputGroup}>
                            <textarea
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Escribe tu mensaje aquí..."
                                rows="3"
                                disabled={enviandoMensaje}
                            />
                            <div className={styles.formActions}>
                                <button 
                                    type="submit" 
                                    disabled={!nuevoMensaje.trim() || enviandoMensaje}
                                    className={styles.btnEnviar}
                                >
                                    {enviandoMensaje ? 'Enviando...' : '+ Enviar respuesta'}
                                </button>
                                <button 
                                    type="button"
                                    className={styles.btnCerrar}
                                    onClick={() => navigate('/centro-ayuda-estudiante')}
                                >
                                    × Cerrar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SolicitudAyudaDetalle;