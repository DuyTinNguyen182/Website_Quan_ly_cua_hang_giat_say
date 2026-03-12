import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { getActivityLogs, seedDemoLogs } from "../utils/activityLog";

// ─── Màu badge theo hành động ────────────────────────────
const ACTION_STYLE = {
  Thêm: "text-green-600",
  Sửa: "text-blue-500",
  Xóa: "text-red-500",
  "Giặt xong": "text-amber-500",
  "Giao khách": "text-violet-500",
  "Đăng nhập": "text-indigo-500",
  "Đăng xuất": "text-gray-400",
};

function getActionStyle(action) {
  return ACTION_STYLE[action] || "text-gray-500";
}

// ─── Format thời gian: "9:45 SA, 04/03/2026" ─────────────
function formatTime(isoString) {
  const d = new Date(isoString);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const period = hours < 12 ? "SA" : "CH";
  const h = (hours % 12 || 12).toString();
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${h}:${minutes} ${period}, ${day}/${month}/${year}`;
}

// ─── Render mô tả với **bold** ────────────────────────────
function renderDesc(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-gray-800">{part}</strong> : part
  );
}

export default function NhatKyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  // Auth guard
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Seed demo + load
  useEffect(() => {
    seedDemoLogs();
    setLogs(getActivityLogs());
  }, []);

  // Lọc theo search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.module?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.staffName?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <div className="min-h-screen bg-main-bg flex flex-col">
      <Header />

      {/* Thanh tiêu đề */}
      <div className="px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-nav-bg font-bold text-sm hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
          NHẬT KÝ
        </button>


      </div>

      {/* Vùng nội dung */}
      <div className="flex-1 bg-white mx-0 flex flex-col">
        {/* Thanh tìm kiếm */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
            <span className="material-symbols-outlined text-gray-400 text-xl leading-none shrink-0">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm trong ${logs.length} hành động...`}
              className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg leading-none">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Header bảng */}
        <div className="flex items-center px-6 py-3 border-b border-gray-200">
          <span className="flex-1 text-sm font-bold text-gray-600">Chức năng</span>
          <span className="w-60 shrink-0 text-sm font-bold text-gray-600">Nhân viên</span>
        </div>

        {/* Danh sách log */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-3">history</span>
              <p className="text-sm">
                {search ? "Không tìm thấy kết quả phù hợp" : "Chưa có nhật ký hoạt động"}
              </p>
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="flex items-start px-6 py-4 border-b border-gray-100 hover:bg-soft-blue-tint transition-colors"
              >
                {/* Cột trái: chức năng + mô tả */}
                <div className="flex-1 pr-6 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-700">{log.module}</span>
                    <span className={`text-xs font-semibold ${getActionStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {renderDesc(log.description)}
                  </p>
                </div>

                {/* Cột phải: nhân viên + thời gian */}
                <div className="w-60 shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-700 mb-1">{log.staffName}</p>
                  <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                    <span className="material-symbols-outlined text-xs leading-none">schedule</span>
                    {formatTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: số lượng */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
            Hiển thị{" "}
            <span className="font-semibold text-gray-500">{filtered.length}</span>
            {search && ` / ${logs.length}`} hành động
          </div>
        )}
      </div>


    </div>
  );
}
