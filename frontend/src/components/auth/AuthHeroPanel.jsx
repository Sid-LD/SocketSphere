import Spline from '@splinetool/react-spline';

const AuthHeroPanel = () => {
  return (
    <div className="relative hidden flex-1 overflow-hidden border-r border-border bg-black md:flex">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]" />

      {/* 3D Scene fills the entire panel */}
      <div className="absolute inset-0 w-full h-full">
        <Spline scene="https://prod.spline.design/02bUgE9-Rt7z7JY9/scene.splinecode" />
      </div>

      {/* Bottom branding badge — centered, frosted glass, non-intrusive */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3 px-6">
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-black/40 px-6 py-3 text-center backdrop-blur-md">
          <p className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            SocketSphere
          </p>
          <p className="text-xs text-zinc-500">Real-time conversations, reimagined.</p>
        </div>

        {/* Pulsing live indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span>Interactive 3D Workspace Active</span>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroPanel;

