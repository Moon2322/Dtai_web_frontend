import styles from '../css/Header_profesor.module.css';

const Header = () => {
  // Datos estáticos por ahora
  const userName = "Prof. Juan Pérez";
  
  const handleLogout = () => {
    // Por ahora solo un console.log, después conectarás con la lógica real
    console.log("Cerrando sesión...");
  };

  const handleNavigation = (section) => {
    // Por ahora solo console.log, después conectarás con React Router
    console.log(`Navegando a: ${section}`);
  };

  return (
    <header className={styles.header}>
      {/* Logo/Título */}
      <div className={styles.logo}>
        <h1>DTAI</h1>
      </div>

      {/* Navegación */}
      <nav className={styles.navigation}>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('asignaturas')}
        >
          Asignaturas
        </button>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('estudiantes')}
        >
          Estudiantes
        </button>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('calificaciones')}
        >
          Calificaciones
        </button>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('foro')}
        >
          Foro
        </button>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('ayuda')}
        >
          Centro de Ayuda
        </button>
        <button 
          className={styles.navButton}
          onClick={() => handleNavigation('encuentas')}
        >
          Encuestas
        </button>
      </nav>

      {/* Usuario y logout */}
      <div className={styles.userSection}>
        <span className={styles.userName}>{userName}</span>
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;