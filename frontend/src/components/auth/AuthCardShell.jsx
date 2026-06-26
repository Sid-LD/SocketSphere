// Simple card wrapper used in AuthActionPanel
export function AuthCardShell({ children }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1c] p-8 shadow-2xl">
      {children}
    </div>
  );
}
