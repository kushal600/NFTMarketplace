import "./App.css";
import Navbar from "./components/Navbar.js";
import Marketplace from "./components/Marketplace";
import Profile from "./components/Profile";
import SellNFT from "./components/SellNFT";
import NFTPage from "./components/NFTpage";
import UpdateNFT from "./components/UpdateNFT";
import Auth from "./components/Auth";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { testFirestore } from "./testFirebase.js";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ element }) => {
    return user ? element : <Navigate to="/" />;
  };
  return (
    <div className="container">
      {/* <Navbar user={user} /> */}
      {/* <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/nftPage" element={<NFTPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sellNFT" element={<SellNFT />} />
        <Route path="/updateNFT" element={<UpdateNFT />} />
        <Route path="/auth" element={<Auth />} />
      </Routes> */}
      <BrowserRouter>
        {/* <Navbar /> */}
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
