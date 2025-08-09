import React, { useState, useEffect, useRef } from 'react';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/ChatBot.module.css'; 

const ChatBot = () => {
    const [mensajes, setMensajes] = useState([]);
    const [inputMensaje, setInputMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

    const API_BASE_URL = 'http://localhost:5015';

const preguntasSugeridas = [
    "¿Cómo consulto la información completa de un estudiante?",
    "información del alumno Juan Pérez",
    "calificaciones del estudiante 2022371156",
    "promedio del alumno Miguel García",
    "historial académico de la matrícula 2023456789",
    "datos completos del estudiante María López",
    "¿Qué estudiantes tienen las mejores calificaciones?",
    "estudiantes con excelencia académica",
    "alumnos destacados del cuatrimestre",
    "mejores promedios por carrera",
    "estudiantes con calificaciones bajas",
    "alumnos reprobados",
    "estudiantes con buen rendimiento",
    "estudiantes en riesgo académico",
    "alumnos vulnerables económicamente",
    "estudiantes con problemas familiares",
    "alumnos en última oportunidad",
    "estudiantes que necesitan intervención urgente",
    "casos críticos de deserción",
    "estudiantes activos",
    "alumnos egresados",
    "estudiantes con baja temporal",
    "alumnos dados de baja definitiva",
    "estudiantes sin grupo asignado",
    "información del profesor EMP001",
    "datos del maestro María Hernández",
    "información completa del docente Pedro Sánchez",
    "perfil académico del profesor PA652S64",
    "carga académica del profesor López",
    "¿qué materias imparte el maestro EMP123?",
    "grupos asignados al profesor García",
    "profesores con mayor carga de trabajo",
    "maestros con mejor desempeño académico",
    "profesores más efectivos",
    "¿quién es el tutor del grupo iDGS10?",
    "grupos del tutor EMP001",
    "profesores tutores activos",
    "grupos sin tutor asignado",
    "estudiantes de la carrera de sistemas",
    "alumnos de ingeniería industrial",
    "rendimiento de la carrera de mecatrónica",
    "información del grupo iTUR08",
    "estudiantes del grupo iINF09",
    "materias con mayor reprobación",
    "comparar rendimiento entre profesores",
    "grupos con mejor promedio",
    "carreras con mejor aprovechamiento",
    "tendencias de calificaciones",
    "análisis de reprobación por materia",
    "estudiantes que requieren seguimiento",
    "predicción de deserción escolar",
    "correlación entre factores de riesgo",
    "efectividad docente por profesor",
    "top estudiantes",
    "profesores por carrera",
    "todos los grupos activos",
    "aulas más utilizadas",
    "noticias más vistas",
    "¿cómo va académicamente el alumno 2022371156?",
    "desempeño del profesor en la materia de matemáticas",
    "estudiantes de sistemas con promedio mayor a 9",
    "profesores que reprueban más alumnos",
    "grupos con mayor número de reportes de riesgo",
    "estudiantes en alerta temprana",
    "casos que necesitan atención inmediata",
    "alumnos en riesgo de abandono escolar",
    "estudiantes con múltiples reportes",
    "buscar por matrícula: 2023456789",
    "consultar por nombre: Ana Rodríguez", 
    "información del empleado: EMP001",
    "datos del grupo: iMEC07",
    "estudiantes de: gastronomía"
];

    useEffect(() => {
        inicializarChat();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [mensajes]);

    const inicializarChat = () => {
        const mensajeBienvenida = {
            id: Date.now(),
            tipo: 'respuesta',
            contenido: 'Hola, soy tu asistente virtual académico de DTAI. Puedo ayudarte con consultas sobre estudiantes, profesores, grupos, calificaciones, reportes de riesgo y estadísticas del sistema. También puedo generar recomendaciones basadas en el análisis de datos. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date().toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        setMensajes([mensajeBienvenida]);
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
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        const response = await fetch(`${API_BASE_URL}/webhooks/rest/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: `user_${userData.id || 1}`,
                message: mensaje
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            const respuestaTexto = data.map(item => item.text).join('\n');
            
            const respuestaBot = {
                id: Date.now() + 1,
                tipo: 'respuesta',
                contenido: respuestaTexto,
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
            contenido: 'Disculpa, hubo un problema procesando tu mensaje. El sistema puede estar iniciando. Por favor, intenta nuevamente en unos segundos.',
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
        inicializarChat();
    };

    const enviarPreguntaSugerida = (pregunta) => {
        enviarMensaje(pregunta);
    };

    const formatearMensaje = (contenido) => {
        return contenido.split('\n').map((line, index) => (
            <div key={index} className={styles.mensajeLine}>
                {line.trim() === '' ? <br /> : line}
            </div>
        ));
    };

    return (
        <div className={styles.chatbotContainer}>
            <HeaderDirectivo activeSection="chatbot" />
            
            <div className={styles.chatbotContent}>
                <div className={styles.chatbotHeader}>
                    <h2>Asistente Virtual Académico</h2>
                    <p>Sistema inteligente para consultas académicas y análisis de datos educativos</p>
                </div>

                <div className={styles.chatbotLayout}>
                    <div className={styles.chatbotSidebar}>
                        <button 
                            className={styles.btnNuevaConversacion}
                            onClick={nuevaConversacion}
                        >
                            Nueva conversación
                        </button>
                        
                        <div className={styles.preguntasSugeridas}>
                            <h4></h4>
                            <div className={styles.preguntasLista}>
                                {preguntasSugeridas.map((pregunta, index) => (
                                    <button 
                                        key={index}
                                        className={styles.preguntaSugerida}
                                        onClick={() => enviarPreguntaSugerida(pregunta)}
                                        disabled={loading}
                                    >
                                        {pregunta}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className={styles.funcionesInfo}>
                            <h4>Capacidades del sistema</h4>
                            <div className={styles.funcionesLista}>
                                <div className={styles.funcionItem}>Estadísticas generales</div>
                                <div className={styles.funcionItem}>Análisis de rendimiento</div>
                                <div className={styles.funcionItem}>Reportes de riesgo</div>
                                <div className={styles.funcionItem}>Distribución por carreras</div>
                                <div className={styles.funcionItem}>Información de profesores</div>
                                <div className={styles.funcionItem}>Datos de estudiantes</div>
                                <div className={styles.funcionItem}>Recomendaciones inteligentes</div>
                                <div className={styles.funcionItem}>Uso de instalaciones</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.chatbotMain}>
                        <div className={styles.chatbotHeaderCard}>
                            <div className={styles.chatbotAvatar}>🤖</div>
                            <div className={styles.chatbotInfo}>
                                <h3>Asistente Académico DTAI</h3>
                                <p>Consulta información detallada sobre el sistema educativo</p>
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
                                        <div className={styles.mensajeTexto}>
                                            {formatearMensaje(mensaje.contenido)}
                                        </div>
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
                                        <div className={styles.mensajeTimestamp}>Analizando datos...</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.chatInputContainer}>
                            <div className={styles.chatInputWrapper}>
                                <textarea
                                    value={inputMensaje}
                                    onChange={(e) => setInputMensaje(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu consulta sobre estudiantes, profesores, estadísticas o solicita recomendaciones..."
                                    className={styles.chatInput}
                                    rows="1"
                                    disabled={loading}
                                />
                                <button 
                                    className={styles.btnEnviar}
                                    onClick={() => enviarMensaje()}
                                    disabled={loading || !inputMensaje.trim()}
                                >
                                    Enviar
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