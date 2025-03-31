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
  // testFirestore();
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   console.log("App useEffect: Checking auth state...");
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     console.log(
  //       "Auth state changed:",
  //       currentUser ? currentUser.email : "No user"
  //     );
  //     setUser(currentUser);
  //     setLoading(false);
  //   });
  //   return () => {
  //     console.log("Cleaning up auth listener");
  //     unsubscribe();
  //   };
  // }, []);

  // if (loading) {
  //   console.log("App rendering: Loading...");
  //   return <div>Loading...</div>;
  // }

  // console.log("App rendering with user:", user ? user.email : "No user");
  return (
    <div className="container">
      {/* <Navbar user={user} /> */}
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/nftPage" element={<NFTPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sellNFT" element={<SellNFT />} />
        <Route path="/updateNFT" element={<UpdateNFT />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
      {/* <Routes>
        {user ? (
          <>
            <Route path="/" element={<Marketplace />} />
            <Route path="/nftPage" element={<NFTPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sellNFT" element={<SellNFT />} />
            <Route path="/updateNFT" element={<UpdateNFT />} />
            <Route path="*" element={<Navigate to="/" />} />{" "}
           
          </>
        ) : (
          <>
            <Route path="/auth" element={<Auth setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/auth" />} />{" "}
          
          </>
        )}
      </Routes> */}
    </div>
  );
}

export default App;
