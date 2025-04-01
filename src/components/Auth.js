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
  const navigate = useNavigate();

  // async function connectWalletAndSave(user) {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   await provider.send("eth_requestAccounts", []);
  //   const signer = provider.getSigner();
  //   const walletAddress = await signer.getAddress();
  //   await setDoc(
  //     doc(db, "users", user.uid),
  //     {
  //       email: user.email,
  //       walletAddress: walletAddress,
  //     },
  //     { merge: true }
  //   );
  //   return walletAddress;
  // }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {user ? (
        <div className="text-center">
          <p className="text-xl">
            Welcome, {user.email}! <br />
            Wallet: {user.walletAddress}
          </p>
          <button
            onClick={signOutUser}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Sign Up / Sign In</h2>
          <form className="flex flex-col space-y-4 w-80">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white border border-gray-700"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white border border-gray-700"
            />
            <button
              type="button"
              onClick={connectWallet}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                walletAddress ? "bg-green-500 hover:bg-green-700" : ""
              }`}
            >
              {walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </button>
            <button
              onClick={signUp}
              disabled={!walletAddress}
              className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${
                !walletAddress
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={signIn}
              disabled={!walletAddress}
              className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${
                !walletAddress
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              Sign In
            </button>
          </form>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {walletAddress && (
            <p className="mt-4 text-green-500">
              Wallet: {walletAddress.substring(0, 6)}...
              {walletAddress.slice(-4)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
