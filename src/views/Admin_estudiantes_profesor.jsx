import { useState } from 'react';
import Header from '../components/header_profesor';
import styles from '../css/Admin_estudiantes_profesor.module.css';

const Admin_estudiantes_profesor = () => {
  // Datos estáticos de estudiantes (simulando base de datos)
  const [students, setStudents] = useState([
    { 
      id: 1, 
      nombre: 'Ana García', 
      email: 'ana.garcia@email.com', 
      carrera: 'Ingeniería en Sistemas', 
      matricula: '2022371054', 
      promedio: 8.5,
      estatus: 'Activo'
    },
    { 
      id: 2, 
      nombre: 'Carlos López', 
      email: 'carlos.lopez@email.com', 
      carrera: 'Ingeniería Industrial', 
      matricula: '2023451287', 
      promedio: 7.8,
      estatus: 'Activo'
    },
    { 
      id: 3, 
      nombre: 'María Rodríguez', 
      email: 'maria.rodriguez@email.com', 
      carrera: 'Ingeniería en Sistemas', 
      matricula: '2021298743', 
      promedio: 9.2,
      estatus: 'Activo'
    },
    { 
      id: 4, 
      nombre: 'Diego Martínez', 
      email: 'diego.martinez@email.com', 
      carrera: 'Ingeniería Civil', 
      matricula: '2024156892', 
      promedio: 6.9,
      estatus: 'En Prueba'
    },
    { 
      id: 5, 
      nombre: 'Sofia Hernández', 
      email: 'sofia.hernandez@email.com', 
      carrera: 'Ingeniería Industrial', 
      matricula: '2022583741', 
      promedio: 8.8,
      estatus: 'Activo'
    }
  ]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');

  // Estados para modal
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    carrera: '',
    semestre: '',
    promedio: '',
    fechaIngreso: '',
    estatus: 'Activo'
  });

  // Filtrar estudiantes
  const filteredStudents = students.filter(student => {
    return (
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCarrera === '' || student.carrera === filterCarrera) &&
      (filterEstatus === '' || student.estatus === filterEstatus)
    );
  });

  // Obtener opciones únicas para filtros
  const carreras = [...new Set(students.map(s => s.carrera))];
  const estatuses = [...new Set(students.map(s => s.estatus))];

  // Funciones CRUD
  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      nombre: '',
      email: '',
      carrera: '',
      matricula: '',
      promedio: '',
      estatus: 'Activo'
    });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingStudent) {
      // Editar estudiante existente
      setStudents(students.map(s => 
        s.id === editingStudent.id ? { ...formData, id: editingStudent.id } : s
      ));
    } else {
      // Agregar nuevo estudiante
      const newStudent = {
        ...formData,
        id: Math.max(...students.map(s => s.id)) + 1,
        promedio: parseFloat(formData.promedio)
      };
      setStudents([...students, newStudent]);
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1>Gestión de Estudiantes</h1>
          <p>Administra a tus estudiantes tutorados</p>
        </div>

        {/* Card con total de estudiantes */}
        <div className={styles.statsCard}>
          <div className={styles.statInfo}>
            <h3>Total de Estudiantes</h3>
            <div className={styles.totalNumber}>{filteredStudents.length}</div>
            <p>de {students.length} estudiantes registrados</p>
          </div>
          <div className={styles.statIcon}>👥</div>
        </div>

        {/* Controles y filtros */}
        <div className={styles.controls}>
          <div className={styles.leftControls}>
            <button 
              className={styles.addButton}
              onClick={handleAdd}
            >
              + Agregar Estudiante
            </button>
          </div>
          
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            
            <select
              value={filterCarrera}
              onChange={(e) => setFilterCarrera(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas las carreras</option>
              {carreras.map(carrera => (
                <option key={carrera} value={carrera}>{carrera}</option>
              ))}
            </select>
            
            <select
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todos los estatus</option>
              {estatuses.map(estatus => (
                <option key={estatus} value={estatus}>{estatus}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de estudiantes */}
        <div className={styles.tableContainer}>
          <table className={styles.studentsTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Carrera</th>
                <th>Matrícula</th>
                <th>Promedio</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td className={styles.nameCell}>{student.nombre}</td>
                  <td>{student.email}</td>
                  <td>{student.carrera}</td>
                  <td className={styles.centerCell}>{student.matricula}</td>
                  <td className={styles.centerCell}>
                    <span className={`${styles.gradeCell} ${
                      student.promedio >= 8 ? styles.goodGrade : 
                      student.promedio >= 7 ? styles.averageGrade : 
                      styles.lowGrade
                    }`}>
                      {student.promedio}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      student.estatus === 'Activo' ? styles.active : 
                      student.estatus === 'En Prueba' ? styles.trial : 
                      styles.inactive
                    }`}>
                      {student.estatus}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(student)}
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(student.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className={styles.noResults}>
              <p>No se encontraron estudiantes con los filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Modal para agregar/editar estudiante */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Carrera</label>
                    <select
                      name="carrera"
                      value={formData.carrera}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar carrera</option>
                      <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
                      <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                      <option value="Ingeniería Civil">Ingeniería Civil</option>
                      <option value="Ingeniería Mecánica">Ingeniería Mecánica</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Matrícula</label>
                    <input
                      type="text"
                      name="matricula"
                      value={formData.matricula}
                      onChange={handleInputChange}
                      placeholder="2022371054"
                      pattern="[0-9]{10}"
                      title="La matrícula debe tener 10 dígitos"
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Promedio</label>
                    <input
                      type="number"
                      name="promedio"
                      value={formData.promedio}
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                      step="0.1"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Estatus</label>
                    <select
                      name="estatus"
                      value={formData.estatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Activo">Activo</option>
                      <option value="En Prueba">En Prueba</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                  >
                    {editingStudent ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin_estudiantes_profesor;