import React, { useState, useEffect } from 'react';

const PowerBIConfig = {
    workspaceId: process.env.REACT_APP_POWERBI_WORKSPACE_ID || 'your-workspace-id',
    tenantId: process.env.REACT_APP_POWERBI_TENANT_ID || 'your-tenant-id',
    clientId: process.env.REACT_APP_POWERBI_CLIENT_ID || 'your-client-id',
    baseEmbedUrl: 'https://app.powerbi.com/reportEmbed',
    reportes: {
        'rendimiento-asignaturas': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_RENDIMIENTO_ASIGNATURAS || 'report-id-1',
            title: 'Rendimiento por Asignaturas'
        },
        'indices-reprobacion': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_INDICES_REPROBACION || 'report-id-2',
            title: 'Índices de Reprobación'
        },
        'rendimiento-profesores': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_RENDIMIENTO_PROFESORES || 'report-id-3',
            title: 'Rendimiento por Profesor'
        },
        'analisis-riesgo': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_ANALISIS_RIESGO || 'report-id-4',
            title: 'Análisis de Riesgo'
        },
        'solicitudes-ayuda': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_SOLICITUDES_AYUDA || 'report-id-5',
            title: 'Solicitudes de Ayuda'
        },
        'distribucion-calificaciones': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_DISTRIBUCION_CALIFICACIONES || 'report-id-6',
            title: 'Distribución de Calificaciones'
        },
        'tutoria': {
            reportId: process.env.REACT_APP_POWERBI_REPORT_TUTORIA || 'report-id-7',
            title: 'Reportes de Tutoría'
        }
    }
};

const PowerBIEmbed = ({ reporteId, height = '600px' }) => {
    const [embedUrl, setEmbedUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarReporte = async () => {
            try {
                setLoading(true);
                setError(null);

                if (reporteId && PowerBIConfig.reportes[reporteId]) {
                    const reporte = PowerBIConfig.reportes[reporteId];
                    const url = `${PowerBIConfig.baseEmbedUrl}?reportId=${reporte.reportId}&autoAuth=true&ctid=${PowerBIConfig.tenantId}`;
                    setEmbedUrl(url);
                } else {
                    setEmbedUrl('https://app.powerbi.com/view?r=eyJrIjoiYWM0NGQ5NDktMGIzZC00NGViLTkwZTUtYzMzODk1MGU5MzZjIiwidCI6IjMwMGEzZGYzLTQyYjEtNGZiOC1hOWE3LTU4ZjM0ZjIzOWE4NiIsImMiOjN9');
                }
            } catch (err) {
                console.error('Error cargando reporte Power BI:', err);
                setError('Error al cargar el reporte');
            } finally {
                setLoading(false);
            }
        };

        cargarReporte();
    }, [reporteId]);

    if (loading) {
        return (
            <div style={{ 
                height, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#F8F9FA',
                borderRadius: '8px',
                color: '#6E6E6E'
            }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #F0F6FF',
                    borderTop: '4px solid #3BA6FF',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                }}></div>
                <span>Cargando reporte de Power BI...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                height, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#FEF2F2',
                borderRadius: '8px',
                color: '#DC2626',
                border: '1px solid #FECACA'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
                <span>{error}</span>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#DC2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height, position: 'relative' }}>
            <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={true}
                title={`Power BI Report - ${reporteId}`}
                style={{ 
                    border: 'none',
                    borderRadius: '8px'
                }}
                onLoad={() => setLoading(false)}
                onError={() => setError('Error al cargar el iframe')}
            />
        </div>
    );
};

export const PowerBIUtils = {
    getEmbedUrl: (reporteId) => {
        if (PowerBIConfig.reportes[reporteId]) {
            const reporte = PowerBIConfig.reportes[reporteId];
            return `${PowerBIConfig.baseEmbedUrl}?reportId=${reporte.reportId}&autoAuth=true&ctid=${PowerBIConfig.tenantId}`;
        }
        return null;
    },
    openInPowerBI: (reporteId) => {
        let url;
        if (reporteId && PowerBIConfig.reportes[reporteId]) {
            const reporte = PowerBIConfig.reportes[reporteId];
            url = `https://app.powerbi.com/groups/${PowerBIConfig.workspaceId}/reports/${reporte.reportId}`;
        } else {
            url = `https://app.powerbi.com/groups/${PowerBIConfig.workspaceId}/dashboards`;
        }
        
        window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    },
    exportToPDF: async (reporteId, reportName = 'reporte') => {
        try {
            const token = localStorage.getItem('token');
            const originalAlert = window.alert;
            window.alert = () => {}; // Suprimir alertas temporalmente
            
            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = `
                <div style="
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    height: 100%; 
                    background: rgba(0,0,0,0.5); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    z-index: 9999;
                    color: white;
                    font-family: Arial, sans-serif;
                ">
                    <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; color: #333;">
                        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3BA6FF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                        <p>Generando reporte PDF...</p>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingDiv);

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/reportes/export-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reporteId,
                    reportName,
                    format: 'PDF'
                })
            });

            document.body.removeChild(loadingDiv);
            window.alert = originalAlert; // Restaurar alertas

            if (response.ok) {
                const data = await response.json();
                
                alert(`PDF generado exitosamente: ${reportName}\nFecha: ${new Date().toLocaleString()}`);
                
                // en produccion:
                // const blob = await response.blob();
                // const url = window.URL.createObjectURL(blob);
                // const a = document.createElement('a');
                // a.href = url;
                // a.download = `${reportName}_${new Date().toISOString().split('T')[0]}.pdf`;
                // a.click();
                
            } else {
                throw new Error('Error del servidor al generar PDF');
            }

        } catch (error) {
            console.error('Error exportando PDF:', error);
            alert('Error al generar el PDF. Por favor, intenta nuevamente.');
        }
    },

    getConfig: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/reportes/powerbi-config`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.config;
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo configuración Power BI:', error);
            return null;
        }
    },
    isReportAvailable: (reporteId) => {
        return PowerBIConfig.reportes.hasOwnProperty(reporteId);
    },
    getReportTitle: (reporteId) => {
        return PowerBIConfig.reportes[reporteId]?.title || 'Reporte';
    }
};

export { PowerBIConfig };
export default PowerBIEmbed;