import { NavLink, useNavigate } from "react-router-dom";
import styles from "../css/Header_profesor.module.css";

const Header = () => {
  const userName = "Prof. Juan Pérez";
  const navigate = useNavigate(); // ✅ Para redirigir

  const handleLogout = () => {
    // ✅ Borrar el token del localStorage
    localStorage.removeItem("token");

    // ✅ Redirigir a /login
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      {/* Logo/Título */}
      <div className={styles.logo}>
        <h1>DTAI</h1>
      </div>

      {/* Navegación */}
      <nav className={styles.navigation}>
        <NavLink to="/profesor/dashboard_profesor" className={styles.navButton}>
          Inicio
        </NavLink>
        <NavLink to="/profesor/Nueva_asignatura" className={styles.navButton}>
          Asignaturas
        </NavLink>
        <NavLink to="/profesor/Administracion_estudiantes" className={styles.navButton}>
          Estudiantes
        </NavLink>
        <NavLink to="/profesor/Gestion_calificaiones" className={styles.navButton}>
          Calificaciones
        </NavLink>
        <NavLink to="/profesor/foro_profesor" className={styles.navButton}>
          Foro
        </NavLink>
        <NavLink to="/profesor/Ayuda_alumno" className={styles.navButton}>
          Centro de Ayuda
        </NavLink>
        <NavLink to="/encuestas" className={styles.navButton}>
          Encuestas
        </NavLink>
      </nav>

      {/* Usuario y logout */}
      <div className={styles.userSection}>
        <span className={styles.userName}>{userName}</span>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
