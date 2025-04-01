import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams, Link } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  const [user, setUser] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

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
        alert(`Added Token ID ${tokenId} to watchlist!`);
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
      alert(`Removed Token ID ${tokenId} from watchlist!`);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);
  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

  return (
    <div style={{ "min-height": "100vh" }}>
      <Navbar></Navbar>
      <div className="flex ml-20 mt-20">
        <img src={data.image} alt="" className="w-2/5" />
        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.name}</div>
          <div>Description: {data.description}</div>
          <div>
            Price: <span className="">{data.price + " ETH"}</span>
          </div>
          <div>
            Owner: <span className="text-sm">{data.owner}</span>
          </div>
          <div>
            Seller: <span className="text-sm">{data.seller}</span>
          </div>
          <div>
            {currAddress != data.owner && currAddress != data.seller ? (
              <button
                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => buyNFT(tokenId)}
              >
                Buy this NFT
              </button>
            ) : (
              <div>
                <div className="text-emerald-700">
                  You are the owner of this NFTs
                </div>{" "}
                <Link to="/updateNFT">Update Price</Link>
              </div>
            )}
            {isInWatchlist ? (
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => removeFromWatchlist(tokenId)}
              >
                Remove from Watchlist
              </button>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => addToWatchlist(tokenId)}
              >
                Add to Watchlist
              </button>
            )}
            <div className="text-green text-center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
