import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from './views/Login';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />

    {/* Add more routes here as needed */}

  </Routes>
</Router>
);
