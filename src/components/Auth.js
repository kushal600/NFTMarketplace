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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function connectWalletAndSave(user) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        walletAddress: walletAddress,
      },
      { merge: true }
    );
    return walletAddress;
  }

  async function signUp(e) {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const walletAddress = await connectWalletAndSave(userCredential.user);
      setUser({ ...userCredential.user, walletAddress });
      setError("");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  async function signIn(e) {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const walletAddress = await connectWalletAndSave(userCredential.user);
      setUser({ ...userCredential.user, walletAddress });
      setError("");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  async function signOutUser() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <div>
      {user ? (
        <div>
          <p>
            Welcome, {user.email}! Wallet: {user.walletAddress}
          </p>
          <button onClick={signOutUser}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h2>Sign Up / Sign In</h2>
          <form>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signUp}>Sign Up</button>
            <button onClick={signIn}>Sign In</button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
