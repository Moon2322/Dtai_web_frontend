import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/HeaderDirectivo.module.css';

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
        <header className={styles.headerDirectivo}>
            <div className={styles.headerContent}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerTitle}>DTAI</h1>
                </div>
                <nav className={styles.headerNav}>
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            className={`${styles.navItem} ${activeSection === item.key ? styles.active : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button 
                        className={`${styles.navItem} ${styles.logout}`}
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