import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderDirectivo from '../components/HeaderDirectivo';
import '../css/Horarios.css';

const HorariosTSU = () => {
    const [horarios, setHorarios] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        profesor: 'todos',
        grupo: 'todos'
    });
    const navigate = useNavigate();

    const horasTSU = [
        '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00'
    ];

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

    useEffect(() => {
        const userData = localStorage.getItem('usuario');
        if (!userData) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userData);
        if (user.rol !== 'directivo') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const horariosRes = await fetch(`http://localhost:5000/api/horarios/tsu`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const profesoresRes = await fetch(`http://localhost:5000/api/profesores/tsu`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const gruposRes = await fetch(`http://localhost:5000/api/grupos/tsu`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const [horariosData, profesoresData, gruposData] = await Promise.all([
                horariosRes.json(), profesoresRes.json(), gruposRes.json()
            ]);

            if (horariosData.success) {
                console.log('Horarios TSU cargados:', horariosData.data);
                setHorarios(horariosData.data);
            }
            if (profesoresData.success) {
                console.log('Profesores TSU cargados:', profesoresData.data);
                setProfesores(profesoresData.data);
            }
            if (gruposData.success) {
                console.log('Grupos TSU cargados:', gruposData.data);
                setGrupos(gruposData.data);
            }
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getHorarioCell = (dia, hora) => {
        const horaInicio = hora + ':00';
        const horaFin = (parseInt(hora.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
        
        const horario = horarios.find(h => {
            const matchDia = h.dia_semana === dia;
            const matchHora = h.hora_inicio <= horaInicio && h.hora_fin > horaInicio;
            const matchProfesor = filters.profesor === 'todos' || h.profesor_id == filters.profesor;
            const matchGrupo = filters.grupo === 'todos' || h.grupo_id == filters.grupo;
            const matchSearch = !filters.search || 
                h.asignatura_nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
                h.profesor_nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
                h.grupo_codigo.toLowerCase().includes(filters.search.toLowerCase());
            
            return matchDia && matchHora && matchProfesor && matchGrupo && matchSearch;
        });

        if (!horario) {
            return (
                <div className="horario-cell empty" key={`${dia}-${hora}`}>
                    <span className="empty-text">Libre</span>
                </div>
            );
        }

        return (
            <div className="horario-cell occupied" key={`${dia}-${hora}`}>
                <div className="materia-nombre">{horario.asignatura_nombre}</div>
                <div className="profesor-nombre">{horario.profesor_nombre}</div>
                <div className="grupo-codigo">{horario.grupo_codigo}</div>
                <div className="aula">{horario.aula || 'Sin aula'}</div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando horarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <HeaderDirectivo activeSection="profesores" />
            
            <main className="dashboard-main">
                <div className="horarios-content">
                    <div className="page-header">
                        <div className="header-info">
                            <h2>Horarios TSU</h2>
                            <p>Horario matutino: 7:00 AM - 3:00 PM</p>
                        </div>
                        <button 
                            className="btn-back"
                            onClick={() => navigate('/profesores-directivo')}
                        >
                            ← Volver
                        </button>
                    </div>

                    <div className="filters-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Buscar profesor, materia o grupo..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                            />
                        </div>
                        
                        <select
                            value={filters.profesor}
                            onChange={(e) => setFilters(prev => ({...prev, profesor: e.target.value}))}
                            className="filter-select"
                        >
                            <option value="todos">Todos los profesores</option>
                            {profesores.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre} {p.apellido}
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={filters.grupo}
                            onChange={(e) => setFilters(prev => ({...prev, grupo: e.target.value}))}
                            className="filter-select"
                        >
                            <option value="todos">Todos los grupos</option>
                            {grupos.map(g => (
                                <option key={g.id} value={g.id}>
                                    {g.codigo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="horario-grid-container">
                        <table className="horario-table">
                            <thead>
                                <tr>
                                    <th className="hora-header">Hora</th>
                                    {dias.map(dia => (
                                        <th key={dia} className="dia-header">
                                            {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {horasTSU.map(hora => (
                                    <tr key={hora}>
                                        <td className="hora-cell">{hora}</td>
                                        {dias.map(dia => (
                                            <td key={`${dia}-${hora}`} className="horario-slot">
                                                {getHorarioCell(dia, hora)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HorariosTSU;