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
import { useLocation } from "react-router";

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");

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

  useEffect(() => {
    if (window.ethereum == undefined) return;
    let val = window.ethereum.isConnected();
    if (val) {
      console.log("here");
      getAddress();
      toggleConnect(val);
      updateButton();
    }

    window.ethereum.on("accountsChanged", function (accounts) {
      window.location.replace(location.pathname);
    });
  });

  return (
    <div className="">
      <nav className="w-screen">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
            <Link to="/">
              <img
                src={fullLogo}
                alt=""
                width={120}
                height={120}
                className="inline-block -mt-2"
              />
              <div className="inline-block font-bold text-xl ml-2">
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold mr-10 text-lg">
              {location.pathname === "/" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/">Marketplace</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/">Marketplace</Link>
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
                <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={connectWebsite}
                >
                  {connected ? "Connected" : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="text-white text-bold text-right mr-10 text-sm">
        {currAddress !== "0x"
          ? "Connected to"
          : "Not Connected. Please login to view NFTs"}{" "}
        {currAddress !== "0x" ? currAddress.substring(0, 15) + "..." : ""}
      </div>
    </div>
  );
}

export default Navbar;

// import logo from "../logo_3.png";
// import fullLogo from "../full_logo.png";
// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router";
// import { auth } from "../firebase";
// import { signOut } from "firebase/auth";
// const ethers = require("ethers");

// function Navbar({ user }) {
//   const [connected, toggleConnect] = useState(false);
//   const location = useLocation();
//   const [currAddress, updateAddress] = useState("0x");
//   console.log("Navbar rendering with user:", user ? user.email : "No user");

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       toggleConnect(false); // Reset MetaMask connection state on sign-out
//       updateAddress("0x");
//     } catch (error) {
//       console.error("Sign out error:", error);
//     }
//   };

//   async function getAddress() {
//     console.log("Fetching wallet address");
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     const addr = await signer.getAddress();
//     updateAddress(addr);
//     toggleConnect(true);
//   }

//   function updateButton() {
//     const ethereumButton = document.querySelector(".enableEthereumButton");
//     if (ethereumButton) {
//       ethereumButton.textContent = "Connected";
//       ethereumButton.classList.remove("hover:bg-blue-700", "bg-blue-500");
//       ethereumButton.classList.add("hover:bg-green-700", "bg-green-500");
//     }
//   }

//   async function connectWebsite() {
//     if (!user) return; // Only allow connection if authenticated
//     try {
//       const chainId = await window.ethereum.request({ method: "eth_chainId" });
//       if (chainId !== "0xaa36a7") {
//         // Sepolia chainId
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: "0xaa36a7" }],
//         });
//       }
//       await window.ethereum.request({ method: "eth_requestAccounts" });
//       updateButton();
//       await getAddress();
//     } catch (error) {
//       console.error("Error connecting wallet:", error);
//     }
//   }

//   useEffect(() => {
//     if (!window.ethereum || !user) return; // Only proceed if MetaMask exists and user is authenticated
//     const checkConnection = async () => {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const accounts = await provider.listAccounts();
//       if (accounts.length > 0) {
//         await getAddress();
//         updateButton();
//       }
//     };
//     checkConnection();

//     window.ethereum.on("accountsChanged", (accounts) => {
//       if (accounts.length > 0) {
//         getAddress();
//       } else {
//         toggleConnect(false);
//         updateAddress("0x");
//       }
//     });

//     return () => {
//       window.ethereum.removeAllListeners("accountsChanged");
//     };
//   }, [user]); // Re-run effect when user changes

//   return (
//     <div className="">
//       <nav className="w-screen">
//         <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
//           <li className="flex items-end ml-5 pb-2">
//             <Link to="/">
//               <img
//                 src={fullLogo}
//                 alt=""
//                 width={120}
//                 height={120}
//                 className="inline-block -mt-2"
//               />
//               <div className="inline-block font-bold text-xl ml-2">
//                 NFT Marketplace
//               </div>
//             </Link>
//           </li>
//           <li className="w-2/6">
//             {user ? (
//               <ul className="lg:flex justify-between font-bold mr-10 text-lg">
//                 {location.pathname === "/" ? (
//                   <li className="border-b-2 hover:pb-0 p-2">
//                     <Link to="/">Marketplace</Link>
//                   </li>
//                 ) : (
//                   <li className="hover:border-b-2 hover:pb-0 p-2">
//                     <Link to="/">Marketplace</Link>
//                   </li>
//                 )}
//                 {location.pathname === "/sellNFT" ? (
//                   <li className="border-b-2 hover:pb-0 p-2">
//                     <Link to="/sellNFT">List My NFT</Link>
//                   </li>
//                 ) : (
//                   <li className="hover:border-b-2 hover:pb-0 p-2">
//                     <Link to="/sellNFT">List My NFT</Link>
//                   </li>
//                 )}
//                 {location.pathname === "/profile" ? (
//                   <li className="border-b-2 hover:pb-0 p-2">
//                     <Link to="/profile">Profile</Link>
//                   </li>
//                 ) : (
//                   <li className="hover:border-b-2 hover:pb-0 p-2">
//                     <Link to="/profile">Profile</Link>
//                   </li>
//                 )}
//                 {location.pathname === "/updateNFT" ? (
//                   <li className="border-b-2 hover:pb-0 p-2">
//                     <Link to="/updateNFT">Update Price</Link>
//                   </li>
//                 ) : (
//                   <li className="hover:border-b-2 hover:pb-0 p-2">
//                     <Link to="/updateNFT">Update Price</Link>
//                   </li>
//                 )}
//                 <li>
//                   <button
//                     className={`enableEthereumButton ${
//                       connected
//                         ? "bg-green-500 hover:bg-green-700"
//                         : "bg-blue-500 hover:bg-blue-700"
//                     } text-white font-bold py-2 px-4 rounded text-sm`}
//                     onClick={connectWebsite}
//                   >
//                     {connected ? "Connected" : "Connect Wallet"}
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
//                     onClick={handleSignOut}
//                   >
//                     Sign Out
//                   </button>
//                 </li>
//               </ul>
//             ) : (
//               <ul>
//                 <li className="hover:border-b-2 hover:pb-0 p-2">
//                   <Link to="/auth">Sign In</Link>
//                 </li>
//               </ul>
//             )}
//           </li>
//         </ul>
//       </nav>
//       <div className="text-white text-bold text-right mr-10 text-sm">
//         {user ? (
//           <>
//             {`Logged in as ${user.email} | Wallet: ${
//               currAddress !== "0x"
//                 ? currAddress.substring(0, 15) + "..."
//                 : "Not Connected"
//             }`}
//           </>
//         ) : (
//           "Please sign in to view NFTs"
//         )}
//       </div>
//     </div>
//   );
// }

// export default Navbar;
