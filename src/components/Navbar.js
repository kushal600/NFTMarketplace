import logo from "../logo_3.png";
import fullLogo from "../full_logo.png";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     if (currentUser && window.ethereum?.isConnected()) {
  //       getAddress();
  //       toggleConnect(true);
  //       updateButton();
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     if (currentUser && window.ethereum?.isConnected()) {
  //       getAddress();
  //       toggleConnect(true);
  //       updateButton();
  //     } else {
  //       toggleConnect(false);
  //       updateAddress("0x");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     if (!currentUser) {
  //       setWalletAddress(null); // Reset wallet when signed out
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch wallet address from Firebase
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setWalletAddress(data.walletAddress || null);
        } else {
          setWalletAddress(null); // No wallet yet if doc doesn’t exist
        }
      } else {
        setWalletAddress(null); // Reset when signed out
      }
    });
    return () => unsubscribe();
  }, []); // Runs on mount and auth state changes

  // async function connectWallet() {
  //   if (!window.ethereum) {
  //     alert("Please install MetaMask to connect!");
  //     return;
  //   }
  //   try {
  //     const chainId = await window.ethereum.request({ method: "eth_chainId" });
  //     if (chainId !== "0xaa36a7") {
  //       await window.ethereum.request({
  //         method: "wallet_switchEthereumChain",
  //         params: [{ chainId: "0xaa36a7" }],
  //       });
  //     }
  //     const ethers = require("ethers");
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     await provider.send("eth_requestAccounts", []);
  //     const signer = provider.getSigner();
  //     const address = await signer.getAddress();
  //     setWalletAddress(address);
  //   } catch (error) {
  //     console.error("Wallet connection failed:", error);
  //     alert("Failed to connect wallet: " + error.message);
  //   }
  // }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect!");
      return;
    }
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      }
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      // Store in Firebase if user is authenticated
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          { walletAddress: address },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  }

  async function getAddress() {
    console.log("Connect button clicked");
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    updateAddress(addr);
  }

  function updateButton() {
    const ethereumButton = document.querySelector(".enableEthereumButton");
    ethereumButton.textContent = "Connected";
    ethereumButton.classList.remove("hover:bg-blue-70");
    ethereumButton.classList.remove("bg-blue-500");
    ethereumButton.classList.add("hover:bg-green-70");
    ethereumButton.classList.add("bg-green-500");
  }

  async function connectWebsite() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0xaa36a7") {
      // Change to Sepolia chainId
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Switch to Sepolia
      });
    }
    await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(() => {
        updateButton();
        console.log("here");
        getAddress();
        window.location.replace(location.pathname);
      });
  }

  // useEffect(() => {
  //   if (window.ethereum == undefined) return;
  //   let val = window.ethereum.isConnected();
  //   if (val) {
  //     console.log("here");
  //     getAddress();
  //     toggleConnect(val);
  //     updateButton();
  //   }

  //   window.ethereum.on("accountsChanged", function (accounts) {
  //     window.location.replace(location.pathname);
  //   });
  // });
  async function handleSignOut() {
    try {
      await signOut(auth);
      setWalletAddress(null); // Reset wallet state
      navigate("/"); // Redirect to auth page
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("Failed to sign out: " + error.message);
    }
  }

  return (
    <div className="">
      <nav className="w-screen">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
            <Link to="/marketplace">
              {/* <img
                src={fullLogo}
                alt=""
                width={120}
                height={120}
                className="inline-block -mt-2"
              /> */}
              <div className="inline-block font-bold text-xl ml-2">
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold mr-10 text-lg">
              {location.pathname === "/marketplace" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/marketplace">Marketplace</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/marketplace">Marketplace</Link>
                </li>
              )}
              {location.pathname === "/sellNFT" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/sellNFT">List My NFT</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/sellNFT">List My NFT</Link>
                </li>
              )}
              {location.pathname === "/profile" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/profile">Profile</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/profile">Profile</Link>
                </li>
              )}
              <li>
                {/* <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={connectWebsite}
                >
                  {connected ? "Connected" : "Connect Wallet"}
                </button> */}
                {/* {user ? (
                  <button
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded text-sm"
                    disabled
                  >
                    Connected
                  </button>
                ) : (
                  <button
                    className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                    onClick={connectWebsite}
                  >
                    Connect Wallet
                  </button>
                )} */}
                {walletAddress ? (
                  <button
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded text-sm"
                    disabled
                  >
                    Connected
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </button>
                )}
                {user && (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                )}
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      {/* <div className="text-white text-bold text-right mr-10 text-sm">
        {currAddress !== "0x"
          ? "Connected to"
          : "Not Connected. Please login to view NFTs"}{" "}
        {currAddress !== "0x" ? currAddress.substring(0, 15) + "..." : ""}
      </div> */}
      <div className="text-white text-bold text-right mr-10 text-sm">
        {walletAddress
          ? "Connected to"
          : "Not Connected. Please login to view NFTs"}{" "}
        {walletAddress ? `${walletAddress.substring(0, 15)}...` : ""}
      </div>
    </div>
  );
}

export default Navbar;
