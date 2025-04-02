
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Menu, X } from "lucide-react"; // Icons for mobile menu

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setWalletAddress(userDoc.data().walletAddress || null);
        }
      } else {
        setWalletAddress(null);
      }
    });
    return () => unsubscribe();
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      if (user) {
        await setDoc(doc(db, "users", user.uid), { walletAddress: address }, { merge: true });
      }
    } catch (error) {
      alert("Failed to connect wallet: " + error.message);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setWalletAddress(null);
      navigate("/");
    } catch (error) {
      alert("Failed to sign out: " + error.message);
    }
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/60 backdrop-blur-lg shadow-lg z-50">
      <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/marketplace" className="text-white font-bold text-2xl">
          NFT Marketplace
        </Link>

        {/* Hamburger Menu for Small Screens */}
        <button className="text-white lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-4">
          <Button to="/marketplace" isActive={location.pathname === "/marketplace"}>
            Marketplace
          </Button>
          <Button to="/sellNFT" isActive={location.pathname === "/sellNFT"}>
            List My NFT
          </Button>
          <Button to="/profile" isActive={location.pathname === "/profile"}>
            Profile
          </Button>
          {walletAddress ? (
            <button className="bg-green-500 text-white px-4 py-2 rounded-full">Connected</button>
          ) : (
            <button className="btn bg-blue-500 hover:bg-blue-700 text-white rounded-full px-4 py-2" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          {user && (
            <button className="btn bg-red-500 hover:bg-red-700 text-white rounded-full px-4 py-2" onClick={handleSignOut}>
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-black/80 backdrop-blur-lg flex flex-col items-center space-y-4 py-4">
          <Button to="/marketplace" isActive={location.pathname === "/marketplace"} onClick={() => setIsOpen(false)}>
            Marketplace
          </Button>
          <Button to="/sellNFT" isActive={location.pathname === "/sellNFT"} onClick={() => setIsOpen(false)}>
            List My NFT
          </Button>
          <Button to="/profile" isActive={location.pathname === "/profile"} onClick={() => setIsOpen(false)}>
            Profile
          </Button>
          {walletAddress ? (
            <button className="btn bg-green-500 text-white w-48 rounded-full px-4 py-2">Connected</button>
          ) : (
            <button className="btn bg-blue-500 hover:bg-blue-700 text-white w-48 rounded-full px-4 py-2" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          {user && (
            <button className="btn bg-red-500 hover:bg-red-700 text-white w-48 rounded-full px-4 py-2" onClick={handleSignOut}>
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

const Button = ({ to, isActive, children, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`btn px-6 py-2 rounded-full text-white transition ${
        isActive ? "bg-blue-600" : "bg-gray-700 hover:bg-blue-500"
      }`}
    >
      {children}
    </Link>
  );
};
