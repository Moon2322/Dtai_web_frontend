import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HeaderEstudiante.module.css';

const HeaderEstudiante = ({ activeSection = 'dashboard' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleNavigation = (path) => {
        if (path === '/dashboard-alumno') {
            navigate('/dashboard-alumno');
        } else if (path === '/centro-ayuda-estudiante') {
            navigate('/centro-ayuda-estudiante');
        } else if (path === '/calificaciones-estudiante') {
            navigate('/calificaciones-estudiante');
        } else if (path === '/mi-perfil-estudiante') {
            navigate('/mi-perfil-estudiante');
        } else if (path === '/horarios-estudiante') {
            navigate('/horarios-estudiante');
        } else if (path === '/foro-estudiante') {
            navigate('/foro-estudiante');
        } else if (path === '/usuario-estudiante') {
            navigate('/usuario-estudiante');
        } else {
            console.log(`Navegando a: ${path}`);
        }
    };

    const navItems = [
        { key: 'dashboard', label: 'DTAI', path: '/dashboard-alumno' },
        { key: 'centro-ayuda', label: 'Centro de ayuda', path: '/centro-ayuda-estudiante' },
        { key: 'calificaciones', label: 'Calificaciones', path: '/calificaciones-estudiante' },
        { key: 'mi-perfil', label: 'Mi perfil', path: '/mi-perfil-estudiante' },
        { key: 'horarios', label: 'Horarios', path: '/horarios-estudiante' },
        { key: 'foro', label: 'Foro', path: '/foro-estudiante' },
        { key: 'usuario', label: 'Usuario', path: '/usuario-estudiante' }
    ];

    return (
        <header className="header-estudiante">
            <div className="header-content">
                <nav className="header-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            className={`nav-item ${activeSection === item.key ? 'active' : ''} ${item.key === 'dashboard' ? 'brand' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button 
                        className="nav-item logout"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default HeaderEstudiante;