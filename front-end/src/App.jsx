import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NhanDoPage from "./pages/NhanDoPage";
import DanhSachDoPage from "./pages/DanhSachDoPage";
import ThuChiPage from "./pages/ThuChiPage";
import KetQuaKinhDoanhPage from "./pages/KetQuaKinhDoanhPage";
import BaoCaoDoanhThuPage from "./pages/BaoCaoDoanhThuPage";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/nhan-do" element={<NhanDoPage />} />
        <Route path="/danh-sach-do" element={<DanhSachDoPage />} />
        <Route path="/thu-chi" element={<ThuChiPage />} />
        <Route path="/ket-qua-kinh-doanh" element={<KetQuaKinhDoanhPage />} />
        <Route path="/bao-cao-doanh-thu" element={<BaoCaoDoanhThuPage />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
