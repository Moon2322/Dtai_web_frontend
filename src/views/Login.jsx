import styles from './../css/Login.module.css'; 

const Login = () => {
  return (
    <div className={styles.login_container}>
      <div className={styles.login_box}>
        <div className={styles.login_header}>
          <h2>Iniciar Sesión</h2>
        </div>
        <div className={styles.login_body}>
          <form>
            <input type="email" placeholder="Correo electrónico" required className={styles.input} />
            <input type="password" placeholder="Contraseña" required className={styles.input} />
            <button type="submit" className={styles.button}>Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
