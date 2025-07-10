import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/EncuestaDetalle.css';

const EncuestaDetalle = () => {
    const [estudiante, setEstudiante] = useState(null);
    const [respuestas, setRespuestas] = useState([]);
    const [loading, setLoading] = useState(true);
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

        fetchEncuestaDetalle();
    }, [navigate, id]);

    const fetchEncuestaDetalle = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/encuestas/estudiante/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEstudiante(data.data.estudiante);
                setRespuestas(data.data.respuestas);
            }
        } catch (error) {
            console.error('Error al cargar encuesta:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVolver = () => {
        navigate('/encuestas-directivo');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando encuesta...</p>
                </div>
            </div>
        );
    }

    if (!estudiante) {
        return (
            <div className="dashboard-container">
                <HeaderDirectivo activeSection="encuesta" />
                <main className="dashboard-main">
                    <div className="error-state">
                        <h2>Estudiante no encontrado</h2>
                        <button onClick={handleVolver} className="btn-back">
                            Volver a Encuestas
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="encuesta" />
            
            <main className="dashboard-main">
                <div className="encuesta-detalle-content">
                    <div className="page-header">
                        <button onClick={handleVolver} className="btn-back">
                            ← Volver
                        </button>
                        <div className="header-info">
                            <h2>Formulario de Tutoría Académica - Evaluación Integral del Estudiante</h2>
                            <p>Registro las respuestas obtenidas en la entrevista presencial</p>
                        </div>
                    </div>

                    <div className="student-info-section">
                        <div className="section-header">
                            <span className="section-icon">👤</span>
                            <h3>Información del Estudiante</h3>
                        </div>
                        
                        <div className="student-info-grid">
                            <div className="info-group">
                                <label>Nombre Completo</label>
                                <div className="info-value">{estudiante.nombre} {estudiante.apellido}</div>
                            </div>
                            <div className="info-group">
                                <label>Matrícula</label>
                                <div className="info-value">{estudiante.matricula}</div>
                            </div>
                            <div className="info-group">
                                <label>Correo</label>
                                <div className="info-value">{estudiante.correo}</div>
                            </div>
                            <div className="info-group">
                                <label>Cuatrimestre</label>
                                <div className="info-value">{estudiante.cuatrimestre_actual}°</div>
                            </div>
                            <div className="info-group">
                                <label>Carrera</label>
                                <div className="info-value">{estudiante.carrera_nombre}</div>
                            </div>
                            <div className="info-group">
                                <label>Promedio</label>
                                <div className="info-value">{estudiante.promedio_general || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <div className="interview-info">
                            <div className="info-group">
                                <label>Fecha de Entrevista</label>
                                <div className="info-value">mm/dd/yyyy</div>
                            </div>
                            <div className="info-group">
                                <label>Lugar de Entrevista</label>
                                <div className="info-value">Si Aula 204, Oficina 50 Tutorías</div>
                            </div>
                        </div>
                    </div>

                    <div className="survey-sections">
                        <div className="survey-section">
                            <div className="section-header">
                                <span className="section-number">📚</span>
                                <h3>1. CONTEXTO ACADÉMICO</h3>
                            </div>
                            
                            <div className="question-group">
                                <label>¿Qué asignatura se le dificulta más?</label>
                                <div className="response-display">Matemáticas y Estructuras algorítmicas...</div>
                            </div>
                            
                            <div className="question-row">
                                <div className="question-group">
                                    <label>¿En qué asignaturas tienes mejor promedio?</label>
                                    <div className="response-display">Selecciona una asignatura</div>
                                </div>
                                <div className="question-group">
                                    <label>¿Cuántas horas dedicas al estudio diario?</label>
                                    <div className="response-display">Horas</div>
                                </div>
                            </div>
                            
                            <div className="question-row">
                                <div className="question-group">
                                    <label>¿Tienes periodos presenciales exento extraordinario?</label>
                                    <div className="response-options">
                                        <span className="option">Sí</span>
                                        <span className="option">No</span>
                                        <span className="option selected">A veces</span>
                                    </div>
                                </div>
                                <div className="question-group">
                                    <label>¿Cuentas con apoyo para tareas?</label>
                                    <div className="response-options">
                                        <span className="option">Sí</span>
                                        <span className="option">No</span>
                                        <span className="option selected">A veces</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="survey-section">
                            <div className="section-header">
                                <span className="section-number">👤</span>
                                <h3>2. SITUACIÓN PERSONAL</h3>
                            </div>
                            
                            <div className="question-group">
                                <label>¿Con quién vives actualmente?</label>
                                <div className="response-options">
                                    <span className="option">Padres</span>
                                    <span className="option selected">Madre</span>
                                    <span className="option">Otros</span>
                                </div>
                            </div>
                            
                            <div className="question-row">
                                <div className="question-group">
                                    <label>¿Trabajas mientras estudias?</label>
                                    <div className="response-options">
                                        <span className="option">Sí</span>
                                        <span className="option selected">No</span>
                                    </div>
                                </div>
                                <div className="question-group">
                                    <label>Si trabajas, ¿cuántas horas?</label>
                                    <div className="response-display">Horas semanales</div>
                                </div>
                            </div>
                            
                            <div className="question-group">
                                <label>¿Tienes responsabilidades familiares?</label>
                                <div className="response-display">Como por ej: responsabilidades familiares que tines...</div>
                            </div>
                            
                            <div className="question-group">
                                <label>¿Cómo te describes emocionalmente?</label>
                                <div className="response-display">Selecciona tu estado emocional</div>
                            </div>
                        </div>
                        <div className="survey-section">
                            <div className="section-header">
                                <span className="section-number">💰</span>
                                <h3>3. SITUACIÓN ECONÓMICA</h3>
                            </div>
                            
                            <div className="question-row">
                                <div className="question-group">
                                    <label>¿Recibes algún tipo de beca?</label>
                                    <div className="response-options">
                                        <span className="option">Sí</span>
                                        <span className="option selected">No</span>
                                    </div>
                                </div>
                                <div className="question-group">
                                    <label>¿Tienes dificultades para cubrir gastos escolares?</label>
                                    <div className="response-options">
                                        <span className="option">Sí</span>
                                        <span className="option selected">No</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="question-group">
                                <label>¿Trabajas para costear estudios?</label>
                                <div className="response-options">
                                    <span className="option">Sí</span>
                                    <span className="option selected">No</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EncuestaDetalle;