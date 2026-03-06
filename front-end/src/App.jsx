import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NhanDoPage from "./pages/NhanDoPage";
import DanhSachDoPage from "./pages/DanhSachDoPage";
import ThuChiPage from "./pages/ThuChiPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/nhan-do" element={<NhanDoPage />} />
        <Route path="/danh-sach-do" element={<DanhSachDoPage />} />
        <Route path="/thu-chi" element={<ThuChiPage />} />
      </Routes>
    </Router>
  );
}

export default App;
