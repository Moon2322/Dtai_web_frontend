import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/HeaderDirectivo.css';

const HeaderDirectivo = ({ activeSection = 'dashboard' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const handleNavigation = (path) => {
        if (path === '/dashboard-directivo') {
            navigate('/dashboard-directivo');
        } else if (path === '/asignaturas-directivo') {
            navigate('/asignaturas-directivo');
        } else if (path === '/profesores-directivo') {
            navigate('/profesores-directivo');
        } else if (path === '/encuesta-directivo') {
            navigate('/encuestas-directivo');
        } else if (path === '/ayuda-directivo') {
            navigate('/centro-ayuda-directivo');
        } else if (path === '/noticias-directivo') {
            navigate('/noticias-directivo');
        } else if (path === '/reportes-directivo') {
            navigate('/reportes-directivo');
        } else if (path === '/chatbot-directivo') {
            navigate('/chatbot-directivo');
        } else {
            console.log(`Navegando a: ${path}`);
        }
    };

    const navItems = [
        { key: 'dashboard', label: 'Dashboard', path: '/dashboard-directivo' },
        { key: 'chatbot', label: 'ChatBot', path: '/chatbot-directivo' },
        { key: 'noticias', label: 'Noticias', path: '/noticias-directivo' },
        { key: 'reportes', label: 'Reportes', path: '/reportes-directivo' },
        { key: 'profesores', label: 'Profesores', path: '/profesores-directivo' },
        { key: 'asignaturas', label: 'Asignaturas', path: '/asignaturas-directivo' },
        { key: 'encuesta', label: 'Encuesta', path: '/encuesta-directivo' },
        { key: 'ayuda', label: 'Centro de ayuda', path: '/ayuda-directivo' }
    ];

    return (
        <header className="header-directivo">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="header-title">DTAI</h1>
                </div>
                <nav className="header-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
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

export default HeaderDirectivo;