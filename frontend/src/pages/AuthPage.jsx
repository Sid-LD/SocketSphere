import { AuthActionPanel } from "../components/auth/AuthActionPanel.jsx";
import AuthHeader from "../components/auth/AuthHeader.jsx";
import AuthHeroPanel from "../components/auth/AuthHeroPanel.jsx";

// AuthPage — shown when the user is NOT signed in.
// Layout: header on top, then left = 3D Spline panel, right = sign-in card
function AuthPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <AuthHeader />
      <main className="flex flex-1 flex-col md:flex-row">
        <AuthHeroPanel />
        <AuthActionPanel />
      </main>
    </div>
  );
}

export default AuthPage;
