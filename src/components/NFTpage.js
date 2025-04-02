import Navbar from "./Navbar";
import { useParams, Link } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import bgImage from '../bg.png';
import { FaRegHeart, FaHeart } from 'react-icons/fa';
import { BsBagHeart } from "react-icons/bs";
import { BsBagHeartFill } from "react-icons/bs";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// // import { Link } from 'react-router-dom';



export default function NFTPage(props) {
  const [bounce, setBounce] = useState(false);
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  const [user, setUser] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newPrice, setNewPrice] = useState(""); 

  useEffect(() => {
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 500); // Match animation duration (0.5s)
    return () => clearTimeout(timer);
  }, [isInWatchlist]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser && data.tokenId) {
        checkWatchlistStatus(data.tokenId); // Check status when user logs in
      }
    });
    return () => unsubscribe();
  }, [data.tokenId]);

  async function checkWatchlistStatus(tokenId) {
    if (!user) {
      setIsInWatchlist(false);
      return;
    }
    try {
      const watchlistRef = doc(db, "watchlists", user.uid);
      const watchlistDoc = await getDoc(watchlistRef);
      const currentWatchlist = watchlistDoc.exists()
        ? watchlistDoc.data().tokenIds || []
        : [];
      setIsInWatchlist(currentWatchlist.includes(tokenId.toString()));
    } catch (error) {
      console.error("Error checking watchlist status:", error);
      setIsInWatchlist(false);
    }
  }

  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    //create an NFT Token
    var tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr);
    updateCurrAddress(addr);
    if (user) {
      await checkWatchlistStatus(tokenId); // Check status after loading NFT
    }
  }

  async function buyNFT(tokenId) {
    try {
      const ethers = require("ethers");
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      //run the executeSale function
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  async function addToWatchlist(tokenId) {
    if (!user) {
      alert("Please sign in to add to watchlist");
      return;
    }
    try {
      const watchlistRef = doc(db, "watchlists", user.uid);
      const watchlistDoc = await getDoc(watchlistRef);
      const currentWatchlist = watchlistDoc.exists()
        ? watchlistDoc.data().tokenIds || []
        : [];
      if (!currentWatchlist.includes(tokenId.toString())) {
        const updatedWatchlist = [...currentWatchlist, tokenId.toString()];
        await setDoc(
          watchlistRef,
          { tokenIds: updatedWatchlist },
          { merge: true }
        );
        setIsInWatchlist(true); // Update state
        // alert(`Added Token ID ${tokenId} to watchlist!`);
      } else {
        alert(`Token ID ${tokenId} is already in your watchlist`);
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  }

  async function removeFromWatchlist(tokenId) {
    if (!user) {
      alert("Please sign in to remove from watchlist");
      return;
    }
    try {
      const watchlistRef = doc(db, "watchlists", user.uid);
      const watchlistDoc = await getDoc(watchlistRef);
      const currentWatchlist = watchlistDoc.exists()
        ? watchlistDoc.data().tokenIds || []
        : [];
      const updatedWatchlist = currentWatchlist.filter(
        (id) => id !== tokenId.toString()
      );
      await setDoc(
        watchlistRef,
        { tokenIds: updatedWatchlist },
        { merge: true }
      );
      setIsInWatchlist(false); // Update state
      // alert(`Removed Token ID ${tokenId} from watchlist!`);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  }

  async function updateNFTPrice(e) {
    e.preventDefault();
    if (!newPrice) {
      updateMessage("Please enter a new price");
      return;
    }

    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );

      // Fetch current metadata
      const tokenURI = await contract.tokenURI(data.tokenId);
      const meta = await axios.get(GetIpfsUrlFromPinata(tokenURI));
      const currentMetadata = meta.data;

      // Create new metadata with updated price
      const updatedMetadata = {
        ...currentMetadata,
        price: newPrice,
      };

      // Upload new metadata to IPFS
      const IPFSUrl = await uploadJSONToIPFS(updatedMetadata);
      if (!IPFSUrl.success) {
        throw new Error("Failed to upload metadata to IPFS");
      }

      updateMessage("Updating price... Please wait (Upto 5 mins)");
      const priceInWei = ethers.utils.parseUnits(newPrice, "ether");
      let transaction = await contract.updateTokenPrice(
        data.tokenId,
        priceInWei,
        IPFSUrl.pinataURL
      );
      await transaction.wait();

      // Update Firestore
      await setDoc(
        doc(db, "nfts", data.tokenId.toString()),
        {
          price: newPrice,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      updateMessage("Price updated successfully!");
      setShowUpdateModal(false);
      getNFTData(data.tokenId); // Refresh data
    } catch (e) {
      alert("Update Error" + e);
      updateMessage("");
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);
  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

  return (
    // <div style={{ "min-height": "100vh" }}>
    //   <Navbar></Navbar>
    //   <div className="flex ml-20 mt-20">
    //     <img src={data.image} alt="" className="w-2/5" />
    //     <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
    //       <div>Name: {data.name}</div>
    //       <div>Description: {data.description}</div>
    //       <div>
    //         Price: <span className="">{data.price + " ETH"}</span>
    //       </div>
    //       <div>
    //         Owner: <span className="text-sm">{data.owner}</span>
    //       </div>
    //       <div>
    //         Seller: <span className="text-sm">{data.seller}</span>
    //       </div>
    //       <div>
    //         {currAddress != data.owner && currAddress != data.seller ? (
    //           <button
    //             className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
    //             onClick={() => buyNFT(tokenId)}
    //           >
    //             Buy this NFT
    //           </button>
    //         ) : (
    //           <div>
    //             <div className="text-emerald-700">
    //               You are the owner of this NFTs
    //             </div>{" "}
    //             <Link to="/updateNFT">Update Price</Link>
    //           </div>
    //         )}
    //         {isInWatchlist ? (
    //           <button
    //             className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
    //             onClick={() => removeFromWatchlist(tokenId)}
    //           >
    //             Remove from Watchlist
    //           </button>
    //         ) : (
    //           <button
    //             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
    //             onClick={() => addToWatchlist(tokenId)}
    //           >
    //             Add to Watchlist
    //           </button>
    //         )}
    //         <div className="text-green text-center mt-3">{message}</div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    
//     <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(./bg.png)' }}>
//   <div className="h-[15vh]">
//     <Navbar />
//   </div>
//   <div className="flex flex-col md:flex-row h-[85vh] max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-8 ">
//     {/* Left 50% - Image Container */}
//     <div className="w-full md:w-1/2 flex items-center justify-center">
//       <div className="w-full h-[70vh] md:h-[75vh] max-w-md">
//         <img 
//           src={data.image} 
//           alt="Product" 
//           className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-gray-200" 
//         />
//       </div>
//     </div>

//     {/* Right 50% - Split into Info and Buttons */}
//     <div className="w-full md:w-1/2 flex flex-col mt-0 space-y-4 ">
//       {/* Information - 50% of 85vh */}
//       <div className="h-[42.5vh] bg-white p-4 py-5 md:p-6 rounded-lg shadow-xl space-y-4 overflow-hidden">
//         <div className="font-bold text-2xl text-gray-800">{data.name}</div>
//         <div className="text-gray-600 truncate">{data.description}</div>
//         <div className="text-lg font-bold text-green-600">Price: {data.price} ETH</div>
//         <div className="text-sm text-gray-500">Owner: {data.seller}</div>
//       </div>

//       {/* Buttons - 50% of 85vh */}
//       <div className="h-[42.5vh] p-4 md:p-6  flex flex-row justify-between items-center space-x-2">
//             {currAddress !== data.owner && currAddress !== data.seller ? (
//               <button 
//                 className="w-[80%]  bg-blue-600 hover:bg-blue-700 text-white shadow-xl font-semibold py-2 px-4 rounded bg-cover bg-center hover:brightness-75" 
//                 onClick={() => buyNFT(tokenId)}
//               >
//                 Buy this NFT
//               </button>
//             ) : (
//               <div className="w-[80%] text-emerald-700">
//                 You are the owner of this NFT
//                 <Link to="/updateNFT" className="ml-2 text-blue-500 underline">Update Price</Link>
//               </div>
//             )}
//             {isInWatchlist ? (
//               <button className="w-[20%]  text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
//               onClick={() => removeFromWatchlist(tokenId)}
//               >
//                 <BsBagHeartFill className={`text-4xl  text-red-600 hover:text-red-600 ${bounce ? 'animate-heart-bounce' : ''}`}   />
//               </button>
//             ) : (
//               <button className="w-[20%] text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
//               onClick={() => addToWatchlist(tokenId)}
//               >
//                 <BsBagHeart className={`text-4xl  text-blue-600 hover:text-blue-600 ${bounce ? 'animate-heart-bounce' : ''}`} />
//               </button>
//             )}
            
//           </div>
//           {message && <div className="text-green-500 text-center mt-3">{message}</div>}
//     </div>
//   </div>
// </div>
<div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(./bg.png)' }}>
<div className="h-[15vh]">
  <Navbar />
</div>

{/* Update Price Modal */}
{showUpdateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Update NFT Price</h2>
      <form onSubmit={updateNFTPrice}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Current Price: {data.price} ETH</label>
          <input
            type="number"
            step="0.01"
            placeholder="Enter new price (ETH)"
            className="w-full p-2 border rounded"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setShowUpdateModal(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Price
          </button>
        </div>
      </form>
      {message && <div className="mt-3 text-center text-green-600">{message}</div>}
    </div>
  </div>
)}

<div className="flex flex-col md:flex-row h-[85vh] max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-8">
  {/* Left side - Image */}
  <div className="w-full md:w-1/2 flex items-center justify-center">
    <div className="w-full h-[70vh] md:h-[75vh] max-w-md">
      <img 
        src={data.image} 
        alt="Product" 
        className="w-full h-full object-cover rounded-lg shadow-lg border-2 border-gray-200" 
      />
    </div>
  </div>

  {/* Right side - Info and Buttons */}
  <div className="w-full md:w-1/2 flex flex-col mt-0 space-y-4">
    {/* Information */}
    <div className="h-[42.5vh] bg-white p-4 py-5 md:p-6 rounded-lg shadow-xl space-y-4 overflow-hidden">
      <div className="font-bold text-2xl text-gray-800">{data.name}</div>
      <div className="text-gray-600 truncate">{data.description}</div>
      <div className="text-lg font-bold text-green-600">Price: {data.price} ETH</div>
      <div className="text-sm text-gray-500">Owner: {data.seller}</div>
    </div>

    {/* Buttons */}
    <div className="h-[42.5vh] p-4 md:p-6 flex flex-row justify-between items-center space-x-2">
      {currAddress !== data.owner && currAddress !== data.seller ? (
        <button 
          className="w-[80%] bg-blue-600 hover:bg-blue-700 text-white shadow-xl font-semibold py-2 px-4 rounded bg-cover bg-center hover:brightness-75" 
          onClick={() => buyNFT(tokenId)}
        >
          Buy this NFT
        </button>
      ) : (
        <div className="w-[80%] flex items-center">
          <span className="text-emerald-700 mr-4">You own this NFT</span>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowUpdateModal(true)}
          >
            Update Price
          </button>
        </div>
      )}
      {isInWatchlist ? (
        <button 
          className="w-[20%] text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
          onClick={() => removeFromWatchlist(tokenId)}
        >
          <BsBagHeartFill className={`text-4xl text-red-600 hover:text-red-600 ${bounce ? 'animate-heart-bounce' : ''}`} />
        </button>
      ) : (
        <button 
          className="w-[20%] text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
          onClick={() => addToWatchlist(tokenId)}
        >
          <BsBagHeart className={`text-4xl text-blue-600 hover:text-blue-600 ${bounce ? 'animate-heart-bounce' : ''}`} />
        </button>
      )}
    </div>
    {message && <div className="text-green-500 text-center mt-3">{message}</div>}
  </div>
</div>
</div>
  );
}
