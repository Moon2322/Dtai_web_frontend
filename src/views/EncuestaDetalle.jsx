import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/EncuestaDetalle.module.css'; 

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
            <div className={styles.dashboardLoading}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Cargando encuesta...</p>
                </div>
            </div>
        );
    }

    if (!estudiante) {
        return (
            <div className={styles.dashboardContainer}>
                <HeaderDirectivo activeSection="encuesta" />
                <main className={styles.dashboardMain}>
                    <div className={styles.errorState}>
                        <h2>Estudiante no encontrado</h2>
                        <button onClick={handleVolver} className={styles.btnBack}>
                            Volver a Encuestas
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <HeaderDirectivo activeSection="encuesta" />
            
            <main className={styles.dashboardMain}>
                <div className={styles.encuestaDetalleContent}>
                    <div className={styles.pageHeader}>
                        <button onClick={handleVolver} className={styles.btnBack}>
                            ← Volver
                        </button>
                        <div className={styles.headerInfo}>
                            <h2>Formulario de Tutoría Académica - Evaluación Integral del Estudiante</h2>
                            <p>Registro las respuestas obtenidas en la entrevista presencial</p>
                        </div>
                    </div>

                    <div className={styles.studentInfoSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionIcon}>👤</span>
                            <h3>Información del Estudiante</h3>
                        </div>
                        
                        <div className={styles.studentInfoGrid}>
                            <div className={styles.infoGroup}>
                                <label>Nombre Completo</label>
                                <div className={styles.infoValue}>{estudiante.nombre} {estudiante.apellido}</div>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Matrícula</label>
                                <div className={styles.infoValue}>{estudiante.matricula}</div>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Correo</label>
                                <div className={styles.infoValue}>{estudiante.correo}</div>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Cuatrimestre</label>
                                <div className={styles.infoValue}>{estudiante.cuatrimestre_actual}°</div>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Carrera</label>
                                <div className={styles.infoValue}>{estudiante.carrera_nombre}</div>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Promedio</label>
                                <div className={styles.infoValue}>{estudiante.promedio_general || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <div className={styles.interviewInfo}>
                            <div className={styles.infoGroup}>
                                <label>Fecha de Entrevista</label>
                                <div className={styles.infoValue}>mm/dd/yyyy</div>
                            </div>
                            <div className={styles.infoGroup}>
                                <label>Lugar de Entrevista</label>
                                <div className={styles.infoValue}>Si Aula 204, Oficina 50 Tutorías</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.surveySections}>
                        <div className={styles.surveySection}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>📚</span>
                                <h3>1. CONTEXTO ACADÉMICO</h3>
                            </div>
                            
                            <div className={styles.questionGroup}>
                                <label>¿Qué asignatura se le dificulta más?</label>
                                <div className={styles.responseDisplay}>Matemáticas y Estructuras algorítmicas...</div>
                            </div>
                            
                            <div className={styles.questionRow}>
                                <div className={styles.questionGroup}>
                                    <label>¿En qué asignaturas tienes mejor promedio?</label>
                                    <div className={styles.responseDisplay}>Selecciona una asignatura</div>
                                </div>
                                <div className={styles.questionGroup}>
                                    <label>¿Cuántas horas dedicas al estudio diario?</label>
                                    <div className={styles.responseDisplay}>Horas</div>
                                </div>
                            </div>
                            
                            <div className={styles.questionRow}>
                                <div className={styles.questionGroup}>
                                    <label>¿Tienes periodos presenciales exento extraordinario?</label>
                                    <div className={styles.responseOptions}>
                                        <span className={styles.option}>Sí</span>
                                        <span className={styles.option}>No</span>
                                        <span className={`${styles.option} ${styles.selected}`}>A veces</span>
                                    </div>
                                </div>
                                <div className={styles.questionGroup}>
                                    <label>¿Cuentas con apoyo para tareas?</label>
                                    <div className={styles.responseOptions}>
                                        <span className={styles.option}>Sí</span>
                                        <span className={styles.option}>No</span>
                                        <span className={`${styles.option} ${styles.selected}`}>A veces</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.surveySection}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>👤</span>
                                <h3>2. SITUACIÓN PERSONAL</h3>
                            </div>
                            
                            <div className={styles.questionGroup}>
                                <label>¿Con quién vives actualmente?</label>
                                <div className={styles.responseOptions}>
                                    <span className={styles.option}>Padres</span>
                                    <span className={`${styles.option} ${styles.selected}`}>Madre</span>
                                    <span className={styles.option}>Otros</span>
                                </div>
                            </div>
                            
                            <div className={styles.questionRow}>
                                <div className={styles.questionGroup}>
                                    <label>¿Trabajas mientras estudias?</label>
                                    <div className={styles.responseOptions}>
                                        <span className={styles.option}>Sí</span>
                                        <span className={`${styles.option} ${styles.selected}`}>No</span>
                                    </div>
                                </div>
                                <div className={styles.questionGroup}>
                                    <label>Si trabajas, ¿cuántas horas?</label>
                                    <div className={styles.responseDisplay}>Horas semanales</div>
                                </div>
                            </div>
                            
                            <div className={styles.questionGroup}>
                                <label>¿Tienes responsabilidades familiares?</label>
                                <div className={styles.responseDisplay}>Como por ej: responsabilidades familiares que tines...</div>
                            </div>
                            
                            <div className={styles.questionGroup}>
                                <label>¿Cómo te describes emocionalmente?</label>
                                <div className={styles.responseDisplay}>Selecciona tu estado emocional</div>
                            </div>
                        </div>

                        <div className={styles.surveySection}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionNumber}>💰</span>
                                <h3>3. SITUACIÓN ECONÓMICA</h3>
                            </div>
                            
                            <div className={styles.questionRow}>
                                <div className={styles.questionGroup}>
                                    <label>¿Recibes algún tipo de beca?</label>
                                    <div className={styles.responseOptions}>
                                        <span className={styles.option}>Sí</span>
                                        <span className={`${styles.option} ${styles.selected}`}>No</span>
                                    </div>
                                </div>
                                <div className={styles.questionGroup}>
                                    <label>¿Tienes dificultades para cubrir gastos escolares?</label>
                                    <div className={styles.responseOptions}>
                                        <span className={styles.option}>Sí</span>
                                        <span className={`${styles.option} ${styles.selected}`}>No</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.questionGroup}>
                                <label>¿Trabajas para costear estudios?</label>
                                <div className={styles.responseOptions}>
                                    <span className={styles.option}>Sí</span>
                                    <span className={`${styles.option} ${styles.selected}`}>No</span>
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