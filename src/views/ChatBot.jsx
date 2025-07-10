import React, { useState, useEffect, useRef } from 'react';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/ChatBot.css';

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
        <div className="chatbot-container">
            <HeaderDirectivo activeSection="chatbot" />
            
            <div className="chatbot-content">
                <div className="chatbot-header">
                    <h2>Dashboard ChatBot</h2>
                    <p>Panel de control y administración de DTAI</p>
                </div>

                <div className="chatbot-layout">
                    <div className="chatbot-sidebar">
                        <button 
                            className="btn-nueva-conversacion"
                            onClick={nuevaConversacion}
                        >
                            + Nueva conversación
                        </button>
                        
                        <div className="conversaciones-lista">
                            <h4>Conversaciones recientes</h4>
                            {conversaciones.map(conv => (
                                <div 
                                    key={conv.id}
                                    className={`conversacion-item ${conversacionId === conv.id ? 'active' : ''}`}
                                    onClick={() => seleccionarConversacion(conv.id)}
                                >
                                    <div className="conversacion-titulo">{conv.titulo}</div>
                                    <div className="conversacion-fecha">
                                        {new Date(conv.fecha_actualizacion).toLocaleDateString('es-MX')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="chatbot-main">
                        <div className="chatbot-header-card">
                            <div className="chatbot-avatar">🤖</div>
                            <div className="chatbot-info">
                                <h3>ChatBot</h3>
                                <p>Pregunta cualquier cosa sobre estadísticas, estudiantes, profesores y datos de la división</p>
                            </div>
                        </div>

                        <div className="chat-container" ref={chatContainerRef}>
                            {mensajes.map(mensaje => (
                                <div 
                                    key={mensaje.id} 
                                    className={`mensaje ${mensaje.tipo === 'pregunta' ? 'mensaje-usuario' : 'mensaje-bot'}`}
                                >
                                    <div className="mensaje-avatar">
                                        {mensaje.tipo === 'pregunta' ? '👤' : '🤖'}
                                    </div>
                                    <div className="mensaje-contenido">
                                        <div className="mensaje-texto">{mensaje.contenido}</div>
                                        <div className="mensaje-timestamp">{mensaje.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                            
                            {loading && (
                                <div className="mensaje mensaje-bot">
                                    <div className="mensaje-avatar">🤖</div>
                                    <div className="mensaje-contenido">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {mensajes.length <= 1 && (
                            <div className="preguntas-sugeridas">
                                {preguntasSugeridas.map((pregunta, index) => (
                                    <button
                                        key={index}
                                        className="pregunta-sugerida"
                                        onClick={() => enviarMensaje(pregunta)}
                                    >
                                        {pregunta}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="chat-input-container">
                            <div className="chat-input-wrapper">
                                <textarea
                                    value={inputMensaje}
                                    onChange={(e) => setInputMensaje(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu pregunta..."
                                    className="chat-input"
                                    rows="1"
                                    disabled={loading}
                                />
                                <button 
                                    className="btn-adjuntar"
                                    type="button"
                                >
                                    📎
                                </button>
                                <button 
                                    className="btn-enviar"
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