import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './views/Login';
import Dashboard_profesor from './views/Dashboard_profesor';
import Admin_estudiantes_profesor from "./views/Admin_estudiantes_profesor";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/profesor/dashboard_profesor" element={<Dashboard_profesor />} />
    <Route path="/profesor/Administracion_estudiantes" element={<Admin_estudiantes_profesor />} />


    {/* Add more routes here as needed */}

  </Routes>
</Router>
);
