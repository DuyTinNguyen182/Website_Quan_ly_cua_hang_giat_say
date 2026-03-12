import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { Eye, EyeOff, ChevronLeft, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const PasswordInput = ({ label, value, onChange, show, onToggle, icon: Icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}<span className="text-red-400 ml-0.5">*</span>
    </label>
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all bg-slate-50
      ${value ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200 hover:border-slate-300"}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${value ? "text-indigo-500" : "text-slate-400"}`} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-300 font-medium"
      />
      <button
        type="button"
        onClick={onToggle}
        className={`transition-colors flex-shrink-0 ${value ? "text-indigo-400 hover:text-indigo-600" : "text-slate-300 hover:text-slate-500"}`}
        tabIndex={-1}
      >
        {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export default function DoiMatKhauPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/users/${user.id}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message ?? "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-main-bg font-sans">
      <Header activePage="" />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Card chính */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            {/* Header card – gradient tím */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">Tài khoản</p>
                <h1 className="text-white text-xl font-extrabold tracking-tight">Đổi mật khẩu</h1>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="px-8 py-7">
              {/* Thông báo lỗi */}
              {error && (
                <div className="mb-5 flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}
              {/* Thông báo thành công */}
              {success && (
                <div className="mb-5 flex items-start gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <PasswordInput
                  label="Mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((v) => !v)}
                  icon={Lock}
                />

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mật khẩu mới</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <PasswordInput
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  show={showNew}
                  onToggle={() => setShowNew((v) => !v)}
                  icon={Lock}
                />
                <PasswordInput
                  label="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                  icon={ShieldCheck}
                />

                {/* Nút submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>

                {/* Nút quay lại */}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Quay lại
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
