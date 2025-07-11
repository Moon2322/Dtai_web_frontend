import React, { useState, useEffect, useRef } from 'react';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/ChatBot.module.css'; 

const ChatBot = () => {
    const [mensajes, setMensajes] = useState([]);
    const [inputMensaje, setInputMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversacionId, setConversacionId] = useState(null);
    const [conversaciones, setConversaciones] = useState([]);
    const chatContainerRef = useRef(null);

    const preguntasSugeridas = [
        "Estadísticas generales",
        "Número de estudiantes",
        "Profesores activos"
    ];

    useEffect(() => {
        inicializarChat();
        cargarConversaciones();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [mensajes]);

    const inicializarChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chatbot/nueva-conversacion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConversacionId(data.conversacionId);
                
                const mensajeBienvenida = {
                    id: Date.now(),
                    tipo: 'respuesta',
                    contenido: '¡Hola! Soy el asistente virtual de DTAI. Puedo ayudarte con información sobre la división, estudiantes, profesores y más. ¿En qué puedo ayudarte?',
                    timestamp: new Date().toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                };
                
                setMensajes([mensajeBienvenida]);
            }
        } catch (error) {
            console.error('Error al inicializar chat:', error);
        }
    };

    const cargarConversaciones = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chatbot/conversaciones', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConversaciones(data);
            }
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
        }
    };

    const enviarMensaje = async (mensaje = inputMensaje) => {
        if (!mensaje.trim() || loading) return;

        const nuevoMensaje = {
            id: Date.now(),
            tipo: 'pregunta',
            contenido: mensaje,
            timestamp: new Date().toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        setMensajes(prev => [...prev, nuevoMensaje]);
        setInputMensaje('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chatbot/mensaje', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversacionId,
                    mensaje
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                const respuestaBot = {
                    id: Date.now() + 1,
                    tipo: 'respuesta',
                    contenido: data.respuesta,
                    timestamp: new Date().toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                };

                setMensajes(prev => [...prev, respuestaBot]);
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            
            const mensajeError = {
                id: Date.now() + 1,
                tipo: 'respuesta',
                contenido: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
                timestamp: new Date().toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };
            
            setMensajes(prev => [...prev, mensajeError]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    const nuevaConversacion = () => {
        setMensajes([]);
        setConversacionId(null);
        inicializarChat();
    };

    const seleccionarConversacion = async (convId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/chatbot/conversacion/${convId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConversacionId(convId);
                setMensajes(data.mensajes.map(msg => ({
                    id: msg.id,
                    tipo: msg.tipo_mensaje,
                    contenido: msg.contenido,
                    timestamp: new Date(msg.timestamp).toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                })));
            }
        } catch (error) {
            console.error('Error al cargar conversación:', error);
        }
    };

    return (
        <div className={styles.chatbotContainer}>
            <HeaderDirectivo activeSection="chatbot" />
            
            <div className={styles.chatbotContent}>
                <div className={styles.chatbotHeader}>
                    <h2>Dashboard ChatBot</h2>
                    <p>Panel de control y administración de DTAI</p>
                </div>

                <div className={styles.chatbotLayout}>
                    <div className={styles.chatbotSidebar}>
                        <button 
                            className={styles.btnNuevaConversacion}
                            onClick={nuevaConversacion}
                        >
                            + Nueva conversación
                        </button>
                        
                        <div className={styles.conversacionesLista}>
                            <h4>Conversaciones recientes</h4>
                            {conversaciones.map(conv => (
                                <div 
                                    key={conv.id}
                                    className={`${styles.conversacionItem} ${conversacionId === conv.id ? styles.active : ''}`}
                                    onClick={() => seleccionarConversacion(conv.id)}
                                >
                                    <div className={styles.conversacionTitulo}>{conv.titulo}</div>
                                    <div className={styles.conversacionFecha}>
                                        {new Date(conv.fecha_actualizacion).toLocaleDateString('es-MX')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className={styles.chatbotMain}>
                        <div className={styles.chatbotHeaderCard}>
                            <div className={styles.chatbotAvatar}>🤖</div>
                            <div className={styles.chatbotInfo}>
                                <h3>ChatBot</h3>
                                <p>Pregunta cualquier cosa sobre estadísticas, estudiantes, profesores y datos de la división</p>
                            </div>
                        </div>

                        <div className={styles.chatContainer} ref={chatContainerRef}>
                            {mensajes.map(mensaje => (
                                <div 
                                    key={mensaje.id} 
                                    className={`${styles.mensaje} ${mensaje.tipo === 'pregunta' ? styles.mensajeUsuario : styles.mensajeBot}`}
                                >
                                    <div className={styles.mensajeAvatar}>
                                        {mensaje.tipo === 'pregunta' ? '👤' : '🤖'}
                                    </div>
                                    <div className={styles.mensajeContenido}>
                                        <div className={styles.mensajeTexto}>{mensaje.contenido}</div>
                                        <div className={styles.mensajeTimestamp}>{mensaje.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                            
                            {loading && (
                                <div className={`${styles.mensaje} ${styles.mensajeBot}`}>
                                    <div className={styles.mensajeAvatar}>🤖</div>
                                    <div className={styles.mensajeContenido}>
                                        <div className={styles.typingIndicator}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {mensajes.length <= 1 && (
                            <div className={styles.preguntasSugeridas}>
                                {preguntasSugeridas.map((pregunta, index) => (
                                    <button
                                        key={index}
                                        className={styles.preguntaSugerida}
                                        onClick={() => enviarMensaje(pregunta)}
                                    >
                                        {pregunta}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={styles.chatInputContainer}>
                            <div className={styles.chatInputWrapper}>
                                <textarea
                                    value={inputMensaje}
                                    onChange={(e) => setInputMensaje(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu pregunta..."
                                    className={styles.chatInput}
                                    rows="1"
                                    disabled={loading}
                                />
                                <button 
                                    className={styles.btnAdjuntar}
                                    type="button"
                                >
                                    📎
                                </button>
                                <button 
                                    className={styles.btnEnviar}
                                    onClick={() => enviarMensaje()}
                                    disabled={loading || !inputMensaje.trim()}
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;