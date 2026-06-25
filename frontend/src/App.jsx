import { Show, SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/react";
import { Button } from "@heroui/react";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { WallpaperProvider } from "./context/WallpaperContext.jsx";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";

function App() {
  const {isSignedIn, isLoaded}=useAuth()

  //make this a better component
  if(!isLoaded) return <p> loading...</p>

  return (
    <ThemeProvider>
      <WallpaperProvider>

        <Routes>
          <Route path="/" element={isSignedIn ? <ChatPage/> : <Navigate to={"/auth"} replace /> } />
          <Route path="/auth" element={!isSignedIn ? <AuthPage/> : <Navigate to={"/chat"} replace />} />
        </Routes>

      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
