export default function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-4 py-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 max-w-[100px]" style={{background:"linear-gradient(to right, transparent, rgba(37,99,235,0.25))"}} />
        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-[8px] font-bold">U</span>
          </div>
          <p>© 2025 <span className="font-semibold text-nav-bg">HỆ THỐNG QUẢN LÝ GIẶT ỦI TVWASH</span></p>
        </div>
        <div className="h-px flex-1 max-w-[100px]" style={{background:"linear-gradient(to left, transparent, rgba(37,99,235,0.25))"}} />
      </div>
    </footer>
  );
}
