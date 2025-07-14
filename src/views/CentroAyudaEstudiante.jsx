import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderEstudiante from '../components/HeaderEstudiante.jsx';
import styles from '../css/CentroAyudaEstudiante.module.css';

const CentroAyudaEstudiante = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [solicitudes, setSolicitudes] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        tipo_problema: '',
        descripcion_problema: '',
        urgencia: 'media',
        contacto_preferido: 'correo'
    });

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

        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/alumno/solicitudes-ayuda', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSolicitudes(data.data);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:5000/api/alumno/solicitud-ayuda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.success) {
                setShowModal(false);
                setFormData({
                    tipo_problema: '',
                    descripcion_problema: '',
                    urgencia: 'media',
                    contacto_preferido: 'correo'
                });
                cargarSolicitudes();
                showSuccess('Solicitud enviada exitosamente');
            } else {
                showSuccess(data.message || 'Error al enviar solicitud');
            }
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            showSuccess('Error al enviar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleVerSolicitud = (solicitudId) => {
        navigate(`/solicitud-ayuda-detalle/${solicitudId}`);
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 3000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const getUrgenciaClass = (urgencia) => {
        const classes = {
            'alta': 'urgenciaAlta',
            'media': 'urgenciaMedia',
            'baja': 'urgenciaBaja'
        };
        return classes[urgencia] || 'urgenciaMedia';
    };

    return (
        <div className={styles.centroAyudaEstudiante}>
            <HeaderEstudiante activeSection="centro-ayuda" />
            
            <div className={styles.ayudaContent}>
                <div className={styles.headerSection}>
                    <div className={styles.ayudaIcon}>🆘</div>
                    <h1>Centro de Ayuda Estudiantil</h1>
                    <p className={styles.subtitle}>Expresa cómo te sientes y solicita apoyo</p>
                    <p className={styles.description}>
                        Tu bienestar es importante para nosotros. Comparte tu situación para 
                        recibir la ayuda adecuada y espera a que tu tutor se contacte contigo.
                    </p>
                    
                    <button 
                        className={styles.btnSolicitud}
                        onClick={() => setShowModal(true)}
                    >
                        📧 Solicitudes
                    </button>
                </div>

                <div className={styles.solicitudesSection}>
                    <h2>Mis Solicitudes</h2>
                    {solicitudes.length > 0 ? (
                        <div className={styles.solicitudesList}>
                            {solicitudes.map((solicitud) => {
                                const estadoBadge = getEstadoBadge(solicitud.estado);
                                return (
                                    <div key={solicitud.id} className={styles.solicitudCard}>
                                        <div className={styles.solicitudHeader}>
                                            <span className={styles.tipoProblema}>
                                                {solicitud.tipo_problema}
                                            </span>
                                            <div className={styles.headerActions}>
                                                <div className={styles.badges}>
                                                    <span className={`${styles.urgenciaBadge} ${styles[getUrgenciaClass(solicitud.urgencia)]}`}>
                                                        {solicitud.urgencia}
                                                    </span>
                                                    <span className={`${styles.estadoBadge} ${styles[estadoBadge.class]}`}>
                                                        {estadoBadge.text}
                                                    </span>
                                                </div>
                                                <button 
                                                    className={styles.btnVer}
                                                    onClick={() => handleVerSolicitud(solicitud.id)}
                                                    title="Ver detalles y chat"
                                                >
                                                    👁️
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.solicitudBody}>
                                            <p>{solicitud.descripcion_problema}</p>
                                            <div className={styles.solicitudFooter}>
                                                <span className={styles.fecha}>
                                                    {formatDate(solicitud.fecha_solicitud)}
                                                </span>
                                                {solicitud.asignado_a_nombre && (
                                                    <span className={styles.asignado}>
                                                        Asignado a: {solicitud.asignado_a_nombre}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noSolicitudes}>
                            <p>No tienes solicitudes de ayuda aún</p>
                            <p>Presiona el botón "Solicitudes" para crear una nueva</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>📋 Tipo de Ayuda</h3>
                            <button 
                                className={styles.closeBtn} 
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Tipo de Problema *</label>
                                <select
                                    value={formData.tipo_problema}
                                    onChange={(e) => setFormData({...formData, tipo_problema: e.target.value})}
                                    required
                                >
                                    <option value="">Selecciona el tipo de ayuda</option>
                                    <option value="academico">Académico</option>
                                    <option value="personal">Personal</option>
                                    <option value="economico">Económico</option>
                                    <option value="familiar">Familiar</option>
                                    <option value="salud_mental">Salud Mental</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>🔵 Descripción Detallada</label>
                                <textarea
                                    rows="6"
                                    placeholder="Comparte más detalles sobre tu situación. Mientras más información proporciones, mejor podremos ayudarte"
                                    value={formData.descripcion_problema}
                                    onChange={(e) => setFormData({...formData, descripcion_problema: e.target.value})}
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Urgencia</label>
                                    <select
                                        value={formData.urgencia}
                                        onChange={(e) => setFormData({...formData, urgencia: e.target.value})}
                                    >
                                        <option value="baja">Baja</option>
                                        <option value="media">Media</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Contacto Preferido</label>
                                    <select
                                        value={formData.contacto_preferido}
                                        onChange={(e) => setFormData({...formData, contacto_preferido: e.target.value})}
                                    >
                                        <option value="correo">Correo</option>
                                        <option value="telefono">Teléfono</option>
                                        <option value="presencial">Presencial</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className={styles.modalActions}>
                                <button 
                                    type="button" 
                                    className={styles.btnCancel} 
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.btnSubmit}
                                    disabled={loading}
                                >
                                    {loading ? '📤 Enviando...' : '📤 Enviar Solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className={styles.successModalOverlay}>
                    <div className={styles.successModal}>
                        <div className={styles.successIcon}>✅</div>
                        <h3>¡Listo!</h3>
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentroAyudaEstudiante;