import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiPhone,
  FiMoon,
  FiSun,
  FiAlertCircle,
} from "react-icons/fi";

const stores = ["TVU_Wash", "TVU_Wash_2", "TVU_Wash_3"];

/* Outlined input giống Material UI */
function OutlinedField({ label, labelColor = "#6b7280", children }) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          border: "1.5px solid #d1d5db",
          borderRadius: 12,
          padding: "14px 16px",
          transition: "border-color 0.2s",
        }}
      >
        {children}
      </div>
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 14,
          background: "#fff",
          padding: "0 6px",
          fontSize: 12,
          fontWeight: 500,
          color: labelColor,
          pointerEvents: "none",
          lineHeight: "20px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Tài khoản test
const TEST_ACCOUNTS = [
  { username: "admin", password: "123456", name: "Admin" },
  { username: "nhanvien", password: "123456", name: "Nhân Viên" },
  { username: "hoanglong", password: "123456", name: "Hoàng Long" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  const [storeOpen, setStoreOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setStoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
      return;
    }

    setLoading(true);

    // Giả lập delay gọi API
    setTimeout(() => {
      const account = TEST_ACCOUNTS.find(
        (acc) => acc.username === username && acc.password === password
      );

      if (account) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: account.username,
            name: account.name,
            store: selectedStore,
          })
        );
        navigate("/home");
      } else {
        setError("Tài khoản hoặc mật khẩu không đúng!");
      }
      setLoading(false);
    }, 800);
  };

  const bg = darkMode
    ? "#111827"
    : "linear-gradient(135deg, #dbeafe 0%, #e8e0fe 30%, #fce7f3 70%, #fecdd3 100%)";
  const cardBg = darkMode ? "#1f2937" : "#fff";
  const textColor = darkMode ? "#e5e7eb" : "#374151";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: bg,
        transition: "background 0.3s",
      }}
    >
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: darkMode ? "#374151" : "#fff",
          border: "none",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: darkMode ? "#fbbf24" : "#6b7280",
          zIndex: 50,
          padding: 0,
          transition: "all 0.2s",
        }}
        title="Chuyển chế độ sáng/tối"
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 440, margin: "0 16px" }}>
        <div
          style={{
            background: cardBg,
            borderRadius: 24,
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)",
            padding: "48px 40px 40px",
            transition: "background 0.3s",
          }}
        >
          {/* ===== Logo ===== */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                }}
              >
                <span
                  style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}
                >
                  U
                </span>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                <span style={{ color: "#f59e0b" }}>vi</span>
                <span style={{ color: textColor }}>wash</span>
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#9ca3af",
                fontWeight: 600,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Hệ thống giặt ủi Trà Vinh
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 4,
              }}
            >
              <FiAlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>
                {error}
              </span>
            </div>
          )}

          {/* ===== Form ===== */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Tài khoản */}
            <OutlinedField label="Tài khoản" labelColor="#6366f1">
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Nhập tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 15,
                    color: textColor,
                    background: "transparent",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                />
                <FiUser size={18} style={{ color: "#9ca3af", flexShrink: 0 }} />
              </div>
            </OutlinedField>

            {/* Mật khẩu */}
            <OutlinedField label="Mật khẩu">
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 15,
                    color: textColor,
                    background: "transparent",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#9ca3af",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </button>
              </div>
            </OutlinedField>

            {/* Cửa hàng */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <OutlinedField label="Cửa hàng">
                <button
                  type="button"
                  onClick={() => setStoreOpen(!storeOpen)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 15,
                    color: textColor,
                    fontFamily: "inherit",
                  }}
                >
                  <span>{selectedStore}</span>
                  <FiChevronDown
                    size={18}
                    style={{
                      color: "#9ca3af",
                      transition: "transform 0.2s",
                      transform: storeOpen ? "rotate(180deg)" : "none",
                      flexShrink: 0,
                    }}
                  />
                </button>
              </OutlinedField>

              {storeOpen && (
                <ul
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "calc(100% + 4px)",
                    zIndex: 30,
                    background: darkMode ? "#374151" : "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {stores.map((store) => (
                    <li
                      key={store}
                      onClick={() => {
                        setSelectedStore(store);
                        setStoreOpen(false);
                      }}
                      style={{
                        padding: "12px 18px",
                        cursor: "pointer",
                        fontSize: 15,
                        color: textColor,
                        backgroundColor:
                          store === selectedStore
                            ? darkMode
                              ? "#4b5563"
                              : "#eef2ff"
                            : "transparent",
                        fontWeight: store === selectedStore ? 500 : 400,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (store !== selectedStore)
                          e.currentTarget.style.backgroundColor = darkMode
                            ? "#4b5563"
                            : "#f5f3ff";
                      }}
                      onMouseLeave={(e) => {
                        if (store !== selectedStore)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {store}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quên mật khẩu */}
            <div style={{ textAlign: "right", marginTop: -6 }}>
              <a
                href="#"
                style={{
                  fontSize: 14,
                  color: "#6366f1",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px 0",
                borderRadius: 16,
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                background: loading
                  ? "#a5b4fc"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
                boxShadow: loading ? "none" : "0 8px 24px rgba(99,102,241,0.3)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: 0.5,
                fontFamily: "inherit",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Test account info */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#166534",
                lineHeight: 1.6,
              }}
            >
              <strong>Tài khoản test:</strong>
              <br />
              admin / 123456 &nbsp;|&nbsp; nhanvien / 123456 &nbsp;|&nbsp; hoanglong / 123456
            </div>
          </form>

          {/* Hotline */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 28,
            }}
          >
            <a
              href="tel:0931014232"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 999,
                border: "1px solid #fbcfe8",
                color: "#ec4899",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <FiPhone size={15} />
              <span>Hotline: 0931 014 232</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
