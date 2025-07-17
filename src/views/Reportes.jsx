import React, { useState, useEffect, useRef } from 'react';
import HeaderDirectivo from '../components/HeaderDirectivo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import html2canvas from 'html2canvas';
import styles from '../css/Reportes.module.css';

const Reportes = () => {
    const [estudiantesActivos, setEstudiantesActivos] = useState({});
    const [reporteSeleccionado, setReporteSeleccionado] = useState('');
    const [datosReporte, setDatosReporte] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vistaActual, setVistaActual] = useState('tabla');
    const chartRef = useRef();
    const [filtros, setFiltros] = useState({
        carrera: '',
        cuatrimestre: '',
        area: '',
        grupo: ''
    });

    const COLORS = ['#1C2A44', '#2E4A7D', '#3BA6FF', '#F0F6FF', '#6E6E6E', '#2C2C2C'];

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
        setVistaActual('tabla');
        cargarReporte(tipoReporte);
    };

    const prepararDatosGrafica = () => {
        if (!datosReporte.length) return [];

        switch (reporteSeleccionado) {
            case 'rendimiento-asignaturas':
                return datosReporte.slice(0, 10).map(item => ({
                    name: item.asignatura?.substring(0, 20) + '...' || 'N/A',
                    promedio: parseFloat(item.promedio_general) || 0,
                    aprobados: parseInt(item.aprobados) || 0,
                    reprobados: parseInt(item.reprobados) || 0
                }));
            
            case 'indices-reprobacion':
                return datosReporte.map(item => ({
                    name: item.carrera || 'N/A',
                    reprobacion: parseFloat(item.porcentaje_reprobacion) || 0,
                    extraordinario: parseFloat(item.porcentaje_extraordinario) || 0
                }));
            
            case 'rendimiento-profesores':
                return datosReporte.slice(0, 10).map(item => ({
                    name: item.profesor?.substring(0, 15) + '...' || 'N/A',
                    promedio: parseFloat(item.promedio_calificaciones) || 0,
                    aprobacion: parseFloat(item.porcentaje_aprobacion) || 0
                }));
            
            case 'riesgo-academico':
                const riesgoData = {};
                datosReporte.forEach(item => {
                    const nivel = item.nivel_riesgo || 'Sin nivel';
                    riesgoData[nivel] = (riesgoData[nivel] || 0) + (parseInt(item.total_reportes) || 0);
                });
                return Object.entries(riesgoData).map(([nivel, total]) => ({
                    name: nivel,
                    value: total
                }));
            
            case 'promedio-carreras':
                return datosReporte.map(item => ({
                    name: item.carrera || 'N/A',
                    promedio: parseFloat(item.promedio_carrera) || 0,
                    estudiantes: parseInt(item.total_estudiantes) || 0
                }));
            
            case 'distribucion-grupos':
                return datosReporte.map(item => ({
                    name: item.grupo || 'N/A',
                    ocupacion: parseFloat(item.porcentaje_ocupacion) || 0,
                    inscritos: parseInt(item.estudiantes_inscritos) || 0,
                    capacidad: parseInt(item.capacidad_maxima) || 0
                }));
            
            default:
                return [];
        }
    };

    const renderGrafica = () => {
        const datos = prepararDatosGrafica();
        if (!datos.length) return <div className={styles.noDatos}><p>No hay datos para graficar</p></div>;

        switch (reporteSeleccionado) {
            case 'rendimiento-asignaturas':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="promedio" fill="#2E4A7D" name="Promedio" />
                            <Bar dataKey="aprobados" fill="#3BA6FF" name="Aprobados" />
                            <Bar dataKey="reprobados" fill="#DC2626" name="Reprobados" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            
            case 'indices-reprobacion':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="reprobacion" fill="#DC2626" name="% Reprobación" />
                            <Bar dataKey="extraordinario" fill="#F59E0B" name="% Extraordinario" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            
            case 'rendimiento-profesores':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="promedio" stroke="#2E4A7D" name="Promedio" />
                            <Line type="monotone" dataKey="aprobacion" stroke="#3BA6FF" name="% Aprobación" />
                        </LineChart>
                    </ResponsiveContainer>
                );
            
            case 'riesgo-academico':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={datos}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {datos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );
            
            case 'promedio-carreras':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="promedio" fill="#2E4A7D" name="Promedio" />
                            <Bar dataKey="estudiantes" fill="#3BA6FF" name="Estudiantes" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            
            case 'distribucion-grupos':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ocupacion" fill="#2E4A7D" name="% Ocupación" />
                            <Bar dataKey="inscritos" fill="#3BA6FF" name="Inscritos" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            
            default:
                return <div className={styles.noDatos}><p>Gráfica no disponible para este reporte</p></div>;
        }
    };

    const generarPDF = async () => {
        if (!reporteSeleccionado || datosReporte.length === 0) {
            alert('Selecciona un reporte para generar el PDF');
            return;
        }

        const reporteNombre = tiposReportes.find(r => r.id === reporteSeleccionado)?.nombre;
        
        let chartImageUrl = '';
        
        if (chartRef.current) {
            try {
                const canvas = await html2canvas(chartRef.current, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                });
                chartImageUrl = canvas.toDataURL('image/png');
            } catch (error) {
                console.error('Error capturing chart:', error);
            }
        }

        const ventanaPDF = window.open('', '_blank');
        
        ventanaPDF.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>DTAI - ${reporteNombre}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                        .chart-container { page-break-inside: avoid; }
                    }
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px;
                        color: #000;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #1C2A44;
                        padding-bottom: 20px;
                    }
                    .header h1 { 
                        color: #1C2A44;
                        margin: 0;
                        font-size: 24px;
                    }
                    .date { 
                        color: #6E6E6E;
                        margin: 10px 0;
                    }
                    .summary { 
                        background-color: #F5F5F5; 
                        padding: 15px; 
                        border-radius: 5px; 
                        margin-bottom: 30px;
                        border-left: 4px solid #2E4A7D;
                    }
                    .summary h3 {
                        margin-top: 0;
                        color: #1C2A44;
                    }
                    .chart-container {
                        text-align: center;
                        margin: 30px 0;
                        page-break-inside: avoid;
                    }
                    .chart-container img {
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
                    .chart-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #1C2A44;
                        margin-bottom: 15px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left;
                        word-wrap: break-word;
                    }
                    th { 
                        background-color: #2E4A7D; 
                        color: white;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .btn-print {
                        background: #2E4A7D;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 20px 0;
                        font-size: 16px;
                    }
                    .btn-print:hover {
                        background: #1C2A44;
                    }
                    @page {
                        margin: 1cm;
                    }
                </style>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            </head>
            <body>
                <div class="header">
                    <h1>DTAI - ${reporteNombre}</h1>
                    <p class="date">Generado el: ${new Date().toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
                
                <div class="summary">
                    <h3>Resumen Ejecutivo</h3>
                    <p><strong>Total de registros:</strong> ${datosReporte.length}</p>
                    <p><strong>Estudiantes:</strong> ${estudiantesActivos.activos || 0}</p>
                    <p><strong>Reporte:</strong> ${reporteNombre}</p>
                    <p><strong>Vista:</strong> ${vistaActual === 'grafica' ? 'Gráfica y Tabla' : 'Tabla'}</p>
                </div>

                <button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
                
                ${chartImageUrl ? `
                    <div class="chart-container">
                        <div class="chart-title">Gráfica - ${reporteNombre}</div>
                        <img src="${chartImageUrl}" alt="Gráfica del reporte" style="max-width: 100%; height: auto; margin: 20px 0;" />
                    </div>
                ` : ''}
                
                <table>
                    <thead>
                        <tr>
                            ${Object.keys(datosReporte[0] || {}).map(key => 
                                `<th>${key.replace(/_/g, ' ').toUpperCase()}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${datosReporte.map(row => `
                            <tr>
                                ${Object.values(row).map(value => {
                                    let displayValue = value || 'N/A';
                                    if (typeof value === 'number' && value % 1 !== 0) {
                                        displayValue = parseFloat(value).toFixed(2);
                                    }
                                    return `<td>${displayValue}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #6E6E6E; font-size: 12px;">
                    <p>DTAI - Sistema de Gestión Académica</p>
                </div>
            </body>
            </html>
        `);
        
        ventanaPDF.document.close();
        
        setTimeout(() => {
            ventanaPDF.focus();
            ventanaPDF.print();
        }, 500);
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

        if (vistaActual === 'grafica') {
            return (
                <div className={styles.graficaContainer}>
                    <h4>{tiposReportes.find(r => r.id === reporteSeleccionado)?.nombre}</h4>
                    <div ref={chartRef}>
                        {renderGrafica()}
                    </div>
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
                                <h3>Estudiantes</h3>
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
                        <div className={styles.headerControls}>
                            <div className={styles.vistaControls}>
                                <button 
                                    className={`${styles.btnVista} ${vistaActual === 'tabla' ? styles.active : ''}`}
                                    onClick={() => setVistaActual('tabla')}
                                    disabled={!reporteSeleccionado}
                                >
                                    📋 Tabla
                                </button>
                                <button 
                                    className={`${styles.btnVista} ${vistaActual === 'grafica' ? styles.active : ''}`}
                                    onClick={() => setVistaActual('grafica')}
                                    disabled={!reporteSeleccionado}
                                >
                                    📊 Gráfica
                                </button>
                            </div>
                            <button 
                                className={styles.btnGenerarPdfSmall}
                                onClick={generarPDF}
                                disabled={!reporteSeleccionado || datosReporte.length === 0}
                            >
                                📄 PDF
                            </button>
                        </div>
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