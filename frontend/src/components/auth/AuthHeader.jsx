// The header bar at the top of the auth page — just app name, no logo image
function AuthHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-white/10 bg-black/60 px-5 py-3 backdrop-blur-md">
      <span className="text-base font-bold tracking-tight text-white">SocketSphere</span>
      <span className="text-xs text-zinc-500">· Private session</span>
    </header>
  );
}

export default AuthHeader;
