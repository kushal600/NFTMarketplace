import "./App.css";
import Marketplace from "./components/Marketplace";
import Profile from "./components/Profile";
import SellNFT from "./components/SellNFT";
import NFTPage from "./components/NFTpage";
import UpdateNFT from "./components/UpdateNFT";
import Auth from "./components/Auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { testFirestore } from "./testFirebase.js";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track initial auth check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Auth state resolved
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
        Loading...
      </div>
    );
  }

  // Protected route component
  const ProtectedRoute = ({ element }) => {
    return user ? element : <Navigate to="/" />;
  };
  return (

   

    <div className="container">

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/marketplace"
            element={<ProtectedRoute element={<Marketplace />} />}
          />
          <Route
            path="/nftPage/:tokenId"
            element={<ProtectedRoute element={<NFTPage />} />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />
          <Route
            path="/sellNFT"
            element={<ProtectedRoute element={<SellNFT />} />}
          />
          <Route
            path="/updateNFT"
            element={<ProtectedRoute element={<UpdateNFT />} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
