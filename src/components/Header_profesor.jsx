import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../css/Header_profesor.module.css";

const Header = () => {
  const [nombreProfesor, setNombreProfesor] = useState("Profesor");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPerfilProfesor();
  }, []);

  const cargarPerfilProfesor = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNombreProfesor("Profesor");
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/profesor/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success && data.data) {
        const { nombre, apellido, titulo_academico } = data.data;
        const nombreCompleto = titulo_academico 
          ? `${titulo_academico} ${nombre} ${apellido}`
          : `Prof. ${nombre} ${apellido}`;
        setNombreProfesor(nombreCompleto);
      } else {
        setNombreProfesor("Profesor");
      }
    } catch (error) {
      console.error('Error al cargar perfil del profesor:', error);
      setNombreProfesor("Profesor");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Borrar datos del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    // Redirigir a login
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
        <span className={styles.userName}>
          {loading ? "Cargando..." : nombreProfesor}
        </span>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;