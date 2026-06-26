// The left panel on the auth page — full-screen Spline 3D scene with a title overlay
import Spline from "@splinetool/react-spline";

function AuthHeroPanel() {
  return (
    <div className="relative hidden flex-1 overflow-hidden bg-black md:flex">
      {/* Spline 3D scene — fills the entire panel */}
      <Spline
        scene="https://prod.spline.design/02bUgE9-Rt7z7JY9/scene.splinecode"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Branding overlay at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
        <p className="text-xl font-bold text-white">SocketSphere</p>
        <p className="text-xs text-zinc-400">Real-time conversations, reimagined.</p>
      </div>
    </div>
  );
}

export default AuthHeroPanel;
