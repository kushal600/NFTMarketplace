import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Marketplace() {
  // const sampleData = [
  //     {
  //         "name": "NFT#1",
  //         "description": "Alchemy's First NFT",
  //         "website":"http://axieinfinity.io",
  //         "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
  //         "price":"0.03ETH",
  //         "currentlySelling":"True",
  //         "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
  //     },
  //     {
  //         "name": "NFT#2",
  //         "description": "Alchemy's Second NFT",
  //         "website":"http://axieinfinity.io",
  //         "image":"https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
  //         "price":"0.03ETH",
  //         "currentlySelling":"True",
  //         "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
  //     },
  //     {
  //         "name": "NFT#3",
  //         "description": "Alchemy's Third NFT",
  //         "website":"http://axieinfinity.io",
  //         "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
  //         "price":"0.03ETH",
  //         "currentlySelling":"True",
  //         "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
  //     },
  // ];
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);
  const [user, setUser] = useState(null); // Add user state

  // Check auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  async function getAllNFTs() {
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
    //create an NFT Token
    let transaction = await contract.getAllNFTs();

    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(
      transaction.map(async (i) => {
        var tokenURI = await contract.tokenURI(i.tokenId);
        console.log("getting this tokenUri", tokenURI);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        return item;
      })
    );

    updateFetched(true);
    updateData(items);
  }

  // Add to watchlist
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
        alert(`Added Token ID ${tokenId} to watchlist!`);
      } else {
        alert(`Token ID ${tokenId} is already in your watchlist`);
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  }

  // Remove from watchlist
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
      alert(`Removed Token ID ${tokenId} from watchlist!`);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  }
  if (!dataFetched) getAllNFTs();

  return (
    <div>
      <Navbar></Navbar>
      <div className="flex flex-col place-items-center mt-20">
        <div className="md:text-xl font-bold text-white">Top NFTs</div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {/* {data.map((value, index) => {
            return <NFTTile data={value} key={index}></NFTTile>;
          })} */}
          {data.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <NFTTile data={value} />
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2"
                onClick={() => addToWatchlist(value.tokenId)}
              >
                Add to Watchlist
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mt-2"
                onClick={() => removeFromWatchlist(value.tokenId)}
              >
                Remove from Watchlist
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
