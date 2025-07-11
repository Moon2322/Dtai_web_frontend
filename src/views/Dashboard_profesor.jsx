import Header from '../components/header_profesor';
import styles from '../css/Dashboard_profesor.module.css';

const Dashboard_profesor = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.welcomeSection}>
          <h2>Bienvenido ...</h2>
        </div>

        <div className={styles.quickActions}>
          <h3>Acciones Rápidas</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionButton}>
              <span>📚</span>
              Crear Nuevo Curso
            </button>
            <button className={styles.actionButton}>
              <span>📝</span>
              Crear Evaluación
            </button>
            <button className={styles.actionButton}>
              <span>👥</span>
              Ver Estudiantes
            </button>
            <button className={styles.actionButton}>
              <span>📊</span>
              Generar Reporte
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Cursos Activos</h3>
            <div className={styles.statNumber}>5</div>
            <p>Cursos en progreso</p>
          </div>

          <div className={styles.statCard}>
            <h3>Total Estudiantes</h3>
            <div className={styles.statNumber}>142</div>
            <p>Estudiantes inscritos</p>
          </div>

          <div className={styles.statCard}>
            <h3>Tareas Pendientes</h3>
            <div className={styles.statNumber}>8</div>
            <p>Por calificar</p>
          </div>

        </div>

        
      </main>
    </div>
  );
};

export default Dashboard_profesor;