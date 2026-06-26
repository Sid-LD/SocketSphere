import { Show, SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/react";
import { Button } from "@heroui/react";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { WallpaperProvider } from "./context/WallpaperContext.jsx";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import PageLoader from "./components/PageLoader.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const {isSignedIn, isLoaded}=useAuth()

  const checkAuth = useAuthStore((state)=>state.checkAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(()=>{
    if(!isLoaded) return;
    if(isSignedIn) checkAuth()
    else clearAuth();
  }, [isLoaded, checkAuth, clearAuth])


  // const count = useCounterStore((state) => state.count);

  // const increment = useCounterStore((state) => state.increment);



  //make this a better component
  if(!isLoaded) return <PageLoader/>

  return (
    <ThemeProvider>
      <WallpaperProvider>

        <Routes>
          <Route path="/" element={isSignedIn ? <ChatPage/> : <Navigate to={"/auth"} replace /> } />
          <Route path="/auth" element={!isSignedIn ? <AuthPage/> : <Navigate to={"/"} replace />} />
        </Routes>
        <Toaster/>
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
