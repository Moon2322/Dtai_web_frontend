import React, { useState, useEffect } from 'react';
import HeaderDirectivo from '../components/HeaderDirectivo';
import styles from '../css/Reportes.module.css';

const Reportes = () => {
    const [estudiantesActivos, setEstudiantesActivos] = useState({});
    const [reporteSeleccionado, setReporteSeleccionado] = useState('');
    const [datosReporte, setDatosReporte] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        carrera: '',
        cuatrimestre: '',
        area: '',
        grupo: ''
    });

    const tiposReportes = [
        { id: 'rendimiento-asignaturas', nombre: 'Rendimiento por asignaturas' },
        { id: 'indices-reprobacion', nombre: 'Índices de Reprobación' },
        { id: 'rendimiento-profesores', nombre: 'Rendimiento por profesor' },
        { id: 'riesgo-academico', nombre: 'Reportes de Riesgo Académico' },
        { id: 'analisis-desercion', nombre: 'Análisis de Deserción' },
        { id: 'promedio-carreras', nombre: 'Promedio por Carreras' },
        { id: 'solicitudes-ayuda', nombre: 'Solicitudes de Ayuda' },
        { id: 'distribucion-grupos', nombre: 'Distribución por Grupos' },
        { id: 'analisis-vulnerabilidad', nombre: 'Análisis de Vulnerabilidad' }
    ];

    useEffect(() => {
        cargarEstudiantesActivos();
    }, []);

    const cargarEstudiantesActivos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reportes/estudiantes-activos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setEstudiantesActivos(data);
        } catch (error) {
            console.error('Error al cargar estudiantes activos:', error);
        }
    };

    const cargarReporte = async (tipoReporte) => {
        if (!tipoReporte) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/${tipoReporte}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setDatosReporte(data);
        } catch (error) {
            console.error('Error al cargar reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReporteChange = (tipoReporte) => {
        setReporteSeleccionado(tipoReporte);
        cargarReporte(tipoReporte);
    };

    const generarPDF = async () => {
        if (!reporteSeleccionado || datosReporte.length === 0) {
            alert('Selecciona un reporte para generar el PDF');
            return;
        }

        try {
            const reporteNombre = tiposReportes.find(r => r.id === reporteSeleccionado)?.nombre;
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${reporteNombre}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #1C2A44; }
                        .date { color: #6E6E6E; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #2E4A7D; color: white; }
                        .summary { background-color: #F0F6FF; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>DTAI - ${reporteNombre}</h1>
                        <p class="date">Generado el: ${new Date().toLocaleDateString('es-MX')}</p>
                    </div>
                    <div class="summary">
                        <h3>Resumen Ejecutivo</h3>
                        <p>Total de registros: ${datosReporte.length}</p>
                        <p>Estudiantes activos: ${estudiantesActivos.activos || 0}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(datosReporte[0] || {}).map(key => `<th>${key}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${datosReporte.map(row => `
                                <tr>
                                    ${Object.values(row).map(value => `<td>${value || 'N/A'}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reporteNombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el reporte PDF');
        }
    };

    const renderVisualizacion = () => {
        if (!reporteSeleccionado) {
            return (
                <div className={styles.visualizacionPlaceholder}>
                    <div className={styles.placeholderIcon}>📊</div>
                    <p>Selecciona un reporte para visualizar</p>
                    <span>Los datos se cargarán automáticamente</span>
                </div>
            );
        }

        if (loading) {
            return (
                <div className={styles.visualizacionPlaceholder}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando datos...</p>
                </div>
            );
        }

        return (
            <div className={styles.datosTabla}>
                <h4>{tiposReportes.find(r => r.id === reporteSeleccionado)?.nombre}</h4>
                {datosReporte.length > 0 ? (
                    <div className={styles.tablaContainer}>
                        <table className={styles.tablaReportes}>
                            <thead>
                                <tr>
                                    {Object.keys(datosReporte[0]).map(key => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datosReporte.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>{value || 'N/A'}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.noDatos}>
                        <p>No hay datos disponibles para este reporte</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.reportesContainer}>
            <HeaderDirectivo activeSection="reportes" />
            
            <div className={styles.reportesContent}>
                <div className={styles.reportesHeader}>
                    <h2>Reportes</h2>
                    <p>Gestiona y visualiza los reportes</p>
                </div>

                <div className={styles.estudiantesActivosCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.icon}>👥</div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3>Estudiantes Activos</h3>
                            </div>
                            <div className={styles.cardNumber}>{estudiantesActivos.activos || 0}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.reportesFiltros}>
                    <select 
                        value={reporteSeleccionado} 
                        onChange={(e) => handleReporteChange(e.target.value)}
                        className={styles.filtroSelect}
                    >
                        <option value="">Selecciona un reporte</option>
                        {tiposReportes.map(reporte => (
                            <option key={reporte.id} value={reporte.id}>
                                {reporte.nombre}
                            </option>
                        ))}
                    </select>

                    <button 
                        className={styles.btnGenerarPdf}
                        onClick={generarPDF}
                        disabled={!reporteSeleccionado || datosReporte.length === 0}
                    >
                        📄 Generar Reporte PDF
                    </button>
                </div>

                <div className={styles.otrosReportes}>
                    <h3>Otros Reportes</h3>
                    <div className={styles.reportesGrid}>
                        {tiposReportes.slice(0, 3).map(reporte => (
                            <div 
                                key={reporte.id}
                                className={`${styles.reporteCard} ${reporteSeleccionado === reporte.id ? styles.active : ''}`}
                                onClick={() => handleReporteChange(reporte.id)}
                            >
                                <div className={styles.reporteIcon}>📈</div>
                                <span>{reporte.nombre}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.visualizacionDatos}>
                    <div className={styles.visualizacionHeader}>
                        <h3>Visualización de Datos</h3>
                        <button 
                            className={styles.btnGenerarPdfSmall}
                            onClick={generarPDF}
                            disabled={!reporteSeleccionado || datosReporte.length === 0}
                        >
                            📄 Generar Reporte PDF
                        </button>
                    </div>
                    
                    <div className={styles.visualizacionContent}>
                        {renderVisualizacion()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reportes;