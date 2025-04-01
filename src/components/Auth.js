import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
const ethers = require("ethers");

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signIn");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }
  async function signUp(e) {
    e.preventDefault();
    if (!walletAddress) {
      setError("Please connect your wallet first!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          email: userCredential.user.email,
          walletAddress: walletAddress,
        },
        { merge: true }
      );
      setUser({ ...userCredential.user, walletAddress });
      setError("");
      navigate("/marketplace");
    } catch (err) {
      setError(err.message);
    }
  }

  async function signIn(e) {
    e.preventDefault();
    if (!walletAddress) {
      setError("Please connect your wallet first!");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          email: userCredential.user.email,
          walletAddress: walletAddress,
        },
        { merge: true }
      );
      setUser({ ...userCredential.user, walletAddress });
      setError("");
      navigate("/marketplace");
    } catch (err) {
      setError(err.message);
    }
  }

  async function signOutUser() {
    await signOut(auth);
    setUser(null);
    setWalletAddress(null); // Reset wallet on sign out
    navigate("/");
  }

  // async function signUp(e) {
  //   e.preventDefault();
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     );
  //     const walletAddress = await connectWalletAndSave(userCredential.user);
  //     setUser({ ...userCredential.user, walletAddress });
  //     setError("");
  //     navigate("/marketplace");
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // }

  // async function signIn(e) {
  //   e.preventDefault();
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     );
  //     const walletAddress = await connectWalletAndSave(userCredential.user);
  //     setUser({ ...userCredential.user, walletAddress });
  //     setError("");
  //     navigate("/marketplace");
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // }

  // async function signOutUser() {
  //   await signOut(auth);
  //   setUser(null);
  //   navigate("/");
  // }

  // return (
  //   <div>
  //     {user ? (
  //       <div>
  //         <p>
  //           Welcome, {user.email}! Wallet: {user.walletAddress}
  //         </p>
  //         <button onClick={signOutUser}>Sign Out</button>
  //       </div>
  //     ) : (
  //       <div>
  //         <h2>Sign Up / Sign In</h2>
  //         <form>
  //           <input
  //             type="email"
  //             placeholder="Email"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //           />
  //           <input
  //             type="password"
  //             placeholder="Password"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //           />
  //           <button onClick={signUp}>Sign Up</button>
  //           <button onClick={signIn}>Sign In</button>
  //         </form>
  //         {error && <p style={{ color: "red" }}>{error}</p>}
  //       </div>
  //     )}
  //   </div>
  // );

  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
    //   {user ? (
    //     <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center transform transition-all duration-300 hover:scale-105">
    //       <h2 className="text-2xl font-bold text-white mb-4">Welcome Back!</h2>
    //       <p className="text-lg text-gray-300">{user.email}</p>
    //       <p className="text-sm text-green-400 mt-2 break-all">
    //         Wallet: {user.walletAddress.substring(0, 6)}...
    //         {user.walletAddress.slice(-4)}
    //       </p>
    //       <button
    //         onClick={signOutUser}
    //         className="mt-6 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-6 rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]"
    //       >
    //         Sign Out
    //       </button>
    //     </div>
    //   ) : (
    //     <div className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full transform transition-all duration-300">
    //       {/* Tabbed Header */}
    //       <div className="relative flex justify-center mb-8">
    //         <div className="flex space-x-8 border-b border-gray-700">
    //           <button
    //             onClick={() => setActiveTab("signIn")}
    //             className={`pb-2 text-lg font-semibold transition-colors duration-200 ${
    //               activeTab === "signIn"
    //                 ? "text-cyan-400"
    //                 : "text-gray-400 hover:text-gray-200"
    //             }`}
    //           >
    //             Sign In
    //           </button>
    //           <button
    //             onClick={() => setActiveTab("signUp")}
    //             className={`pb-2 text-lg font-semibold transition-colors duration-200 ${
    //               activeTab === "signUp"
    //                 ? "text-cyan-400"
    //                 : "text-gray-400 hover:text-gray-200"
    //             }`}
    //           >
    //             Sign Up
    //           </button>
    //         </div>
    //         {/* Sliding Underline */}
    //         <div
    //           className="absolute bottom-0 h-1 bg-cyan-400 transition-all duration-300"
    //           style={{
    //             width: "50%",
    //             left: activeTab === "signIn" ? "0%" : "50%",
    //           }}
    //         />
    //       </div>

    //       {/* Form */}
    //       <form className="space-y-5">
    //         <div>
    //           <input
    //             type="email"
    //             placeholder="Email"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //             className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 placeholder-gray-400"
    //           />
    //         </div>
    //         <div className="relative">
    //           <input
    //             type={showPassword ? "text" : "password"}
    //             placeholder="Password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 placeholder-gray-400"
    //           />
    //           <button
    //             type="button"
    //             onClick={() => setShowPassword(!showPassword)}
    //             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
    //           >
    //             {showPassword ? (
    //               <svg
    //                 className="h-5 w-5"
    //                 fill="none"
    //                 stroke="currentColor"
    //                 viewBox="0 0 24 24"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth="2"
    //                   d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8 0-1.347.333-2.61.915-3.732m0 0l8.11-8.11 8.11 8.11A10.05 10.05 0 0120 11c0 4.418-3.582 8-8 8z"
    //                 />
    //               </svg>
    //             ) : (
    //               <svg
    //                 className="h-5 w-5"
    //                 fill="none"
    //                 stroke="currentColor"
    //                 viewBox="0 0 24 24"
    //               >
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth="2"
    //                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    //                 />
    //                 <path
    //                   strokeLinecap="round"
    //                   strokeLinejoin="round"
    //                   strokeWidth="2"
    //                   d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    //                 />
    //               </svg>
    //             )}
    //           </button>
    //         </div>
    //         <button
    //           type="button"
    //           onClick={connectWallet}
    //           className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
    //             walletAddress
    //               ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_15px_rgba(34,197,94,0.7)]"
    //               : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)]"
    //           }`}
    //         >
    //           {walletAddress ? "Wallet Connected" : "Connect Wallet"}
    //         </button>
    //         <button
    //           onClick={activeTab === "signIn" ? signIn : signUp}
    //           disabled={!walletAddress}
    //           className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
    //             !walletAddress
    //               ? "bg-gray-500 opacity-50 cursor-not-allowed"
    //               : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)]"
    //           }`}
    //         >
    //           {activeTab === "signIn" ? "Sign In" : "Sign Up"}
    //         </button>
    //       </form>
    //       {error && (
    //         <div className="mt-5 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm text-center animate-fade-in">
    //           {error}
    //         </div>
    //       )}
    //       {walletAddress && (
    //         <p className="mt-4 text-green-400 text-center text-sm break-all">
    //           Wallet: {walletAddress.substring(0, 6)}...
    //           {walletAddress.slice(-4)}
    //         </p>
    //       )}
    //     </div>
    //   )}
    // </div>

    // <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
    //   {user ? (
    //     <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center transform transition-all duration-300 hover:scale-105">
    //       <h2 className="text-2xl font-bold text-white mb-4">Welcome Back!</h2>
    //       <p className="text-lg text-gray-300">{user.email}</p>
    //       <p className="text-sm text-green-400 mt-2 break-all">
    //         Wallet: {user.walletAddress.substring(0, 6)}...
    //         {user.walletAddress.slice(-4)}
    //       </p>
    //       <button
    //         onClick={signOutUser}
    //         className="mt-6 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-6 rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]"
    //       >
    //         Sign Out
    //       </button>
    //     </div>
    //   ) : (
    //     <div className="relative max-w-md w-full">
    //       {/* Animated Character */}
    //       <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-bounce-slow z-10">
    //         <svg
    //           width="80"
    //           height="80"
    //           viewBox="0 0 100 100"
    //           fill="none"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           {/* Pixelated Astronaut */}
    //           <rect x="40" y="20" width="20" height="20" fill="#00FFFF" />{" "}
    //           {/* Helmet */}
    //           <rect x="45" y="25" width="10" height="10" fill="#1F2937" />{" "}
    //           {/* Visor */}
    //           <rect x="30" y="40" width="40" height="30" fill="#A5B4FC" />{" "}
    //           {/* Body */}
    //           <rect x="30" y="70" width="15" height="15" fill="#A5B4FC" />{" "}
    //           {/* Left Leg */}
    //           <rect x="55" y="70" width="15" height="15" fill="#A5B4FC" />{" "}
    //           {/* Right Leg */}
    //           <rect x="25" y="40" width="10" height="15" fill="#A5B4FC" />{" "}
    //           {/* Left Arm */}
    //           <rect x="65" y="40" width="10" height="15" fill="#A5B4FC" />{" "}
    //           {/* Right Arm */}
    //           <circle cx="50" cy="85" r="5" fill="#FFFFFF" />{" "}
    //           {/* Jetpack Flame */}
    //         </svg>
    //       </div>

    //       {/* Login Card */}
    //       <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-full transform transition-all duration-300">
    //         <div className="relative flex justify-center mb-8">
    //           <div className="flex space-x-8 border-b border-gray-700">
    //             <button
    //               onClick={() => setActiveTab("signIn")}
    //               className={`pb-2 text-lg font-semibold transition-colors duration-200 ${
    //                 activeTab === "signIn"
    //                   ? "text-cyan-400"
    //                   : "text-gray-400 hover:text-gray-200"
    //               }`}
    //             >
    //               Sign In
    //             </button>
    //             <button
    //               onClick={() => setActiveTab("signUp")}
    //               className={`pb-2 text-lg font-semibold transition-colors duration-200 ${
    //                 activeTab === "signUp"
    //                   ? "text-cyan-400"
    //                   : "text-gray-400 hover:text-gray-200"
    //               }`}
    //             >
    //               Sign Up
    //             </button>
    //           </div>
    //           <div
    //             className="absolute bottom-0 h-1 bg-cyan-400 transition-all duration-300"
    //             style={{
    //               width: "50%",
    //               left: activeTab === "signIn" ? "0%" : "50%",
    //             }}
    //           />
    //         </div>

    //         <form className="space-y-5">
    //           <div>
    //             <input
    //               type="email"
    //               placeholder="Email"
    //               value={email}
    //               onChange={(e) => setEmail(e.target.value)}
    //               className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 placeholder-gray-400"
    //             />
    //           </div>
    //           <div className="relative">
    //             <input
    //               type={showPassword ? "text" : "password"}
    //               placeholder="Password"
    //               value={password}
    //               onChange={(e) => setPassword(e.target.value)}
    //               className="w-full p-3 pr-10 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 placeholder-gray-400"
    //             />
    //             <button
    //               type="button"
    //               onClick={() => setShowPassword(!showPassword)}
    //               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
    //             >
    //               {showPassword ? (
    //                 <svg
    //                   className="h-5 w-5"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth="2"
    //                     d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8 0-1.347.333-2.61.915-3.732m0 0l8.11-8.11 8.11 8.11A10.05 10.05 0 0120 11c0 4.418-3.582 8-8 8z"
    //                   />
    //                 </svg>
    //               ) : (
    //                 <svg
    //                   className="h-5 w-5"
    //                   fill="none"
    //                   stroke="currentColor"
    //                   viewBox="0 0 24 24"
    //                 >
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth="2"
    //                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    //                   />
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth="2"
    //                     d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    //                   />
    //                 </svg>
    //               )}
    //             </button>
    //           </div>
    //           <button
    //             type="button"
    //             onClick={connectWallet}
    //             className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
    //               walletAddress
    //                 ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_15px_rgba(34,197,94,0.7)]"
    //                 : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)]"
    //             }`}
    //           >
    //             {walletAddress ? "Wallet Connected" : "Connect Wallet"}
    //           </button>
    //           <button
    //             onClick={activeTab === "signIn" ? signIn : signUp}
    //             disabled={!walletAddress}
    //             className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
    //               !walletAddress
    //                 ? "bg-gray-500 opacity-50 cursor-not-allowed"
    //                 : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)]"
    //             }`}
    //           >
    //             {activeTab === "signIn" ? "Sign In" : "Sign Up"}
    //           </button>
    //         </form>
    //         {error && (
    //           <div className="mt-5 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm text-center animate-fade-in">
    //             {error}
    //           </div>
    //         )}
    //         {walletAddress && (
    //           <p className="mt-4 text-green-400 text-center text-sm break-all">
    //             Wallet: {walletAddress.substring(0, 6)}...
    //             {walletAddress.slice(-4)}
    //           </p>
    //         )}
    //       </div>
    //     </div>
    //   )}
    // </div>

    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {user ? (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center transform transition-all duration-300 hover:scale-105">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-lg text-gray-300">{user.email}</p>
          <p className="text-sm text-green-400 mt-2 break-all">
            Wallet: {user.walletAddress.substring(0, 6)}...
            {user.walletAddress.slice(-4)}
          </p>
          <button
            onClick={signOutUser}
            className="mt-6 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-6 rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:shadow-[0_0_15px_rgba(239,68,68,0.7)]"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="relative max-w-md w-full">
          {/* Animated Character */}
          <div
            className="absolute -top-20 animate-bounce-slow z-10 transition-all duration-1000 ease-in-out"
            style={{
              left: activeTab === "signIn" ? "10%" : "80%", // Left 10%, Right 80%
              transform:
                activeTab === "signIn"
                  ? "translateX(-10%)"
                  : "translateX(-80%)",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="40" y="20" width="20" height="20" fill="#00FFFF" />
              <rect x="45" y="25" width="10" height="10" fill="#1F2937" />
              <rect x="30" y="40" width="40" height="30" fill="#A5B4FC" />
              <rect x="30" y="70" width="15" height="15" fill="#A5B4FC" />
              <rect x="55" y="70" width="15" height="15" fill="#A5B4FC" />
              <rect x="25" y="40" width="10" height="15" fill="#A5B4FC" />
              <rect x="65" y="40" width="10" height="15" fill="#A5B4FC" />
              <circle cx="50" cy="85" r="5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Login Card */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-full transform transition-all duration-300">
            <div className="relative flex justify-center mb-8">
              <div className="flex space-x-8 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("signIn")}
                  className={`pb-2 text-lg font-semibold transition-colors duration-200 ${
                    activeTab === "signIn"
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab("signUp")}
                  className={`pb-2 text-lg font-semibold transition-colors duration-200 ${
                    activeTab === "signUp"
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>
              <div
                className="absolute bottom-0 h-1 bg-cyan-400 transition-all duration-300"
                style={{
                  width: "50%",
                  left: activeTab === "signIn" ? "0%" : "50%",
                }}
              />
            </div>

            <form className="space-y-5">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-10 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8 0-1.347.333-2.61.915-3.732m0 0l8.11-8.11 8.11 8.11A10.05 10.05 0 0120 11c0 4.418-3.582 8-8 8z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={connectWallet}
                className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
                  walletAddress
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_15px_rgba(34,197,94,0.7)]"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                }`}
              >
                {walletAddress ? "Wallet Connected" : "Connect Wallet"}
              </button>
              <button
                onClick={activeTab === "signIn" ? signIn : signUp}
                disabled={!walletAddress}
                className={`w-full py-3 rounded-md font-semibold text-white transition-all duration-200 ${
                  !walletAddress
                    ? "bg-gray-500 opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                }`}
              >
                {activeTab === "signIn" ? "Sign In" : "Sign Up"}
              </button>
            </form>
            {error && (
              <div className="mt-5 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm text-center animate-fade-in">
                {error}
              </div>
            )}
            {walletAddress && (
              <p className="mt-4 text-green-400 text-center text-sm break-all">
                Wallet: {walletAddress.substring(0, 6)}...
                {walletAddress.slice(-4)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
