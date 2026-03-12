import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NhanDoPage from "./pages/NhanDoPage";
import DanhSachDoPage from "./pages/DanhSachDoPage";
import ThuChiPage from "./pages/ThuChiPage";
import KetQuaKinhDoanhPage from "./pages/KetQuaKinhDoanhPage";
import BaoCaoDoanhThuPage from "./pages/BaoCaoDoanhThuPage";
import CuaHangPage from "./pages/CuaHangPage";
import KhachHangPage from "./pages/KhachHangPage";
import KeLuuDoPage from "./pages/KeLuuDoPage";
import DonViTinhPage from "./pages/DonViTinhPage";
import BangGiaDichVuPage from "./pages/BangGiaDichVuPage";
import TaiKhoanNganHangPage from "./pages/TaiKhoanNganHangPage";
import PhanQuyenPage from "./pages/PhanQuyenPage";

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
        <Route path="/cua-hang" element={<CuaHangPage />} />
        <Route path="/khach-hang" element={<KhachHangPage />} />
        <Route path="/ke-luu-do" element={<KeLuuDoPage />} />
        <Route path="/don-vi-tinh" element={<DonViTinhPage />} />
        <Route path="/bang-gia-dich-vu" element={<BangGiaDichVuPage />} />
        <Route path="/tai-khoan-ngan-hang" element={<TaiKhoanNganHangPage />} />
        <Route path="/phan-quyen" element={<PhanQuyenPage />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
