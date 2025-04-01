import { useState, useEffect } from "react";
import Marketplace from "../Marketplace.json";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
const ethers = require("ethers");

const contractAddress = "0x57D13bFA30AAd3D106961Bc23B72146A6B31b20C";

export default function UpdateNFT() {
  const [formParams, updateFormParams] = useState({
    tokenId: "",
    newPrice: "",
  });
  const [message, updateMessage] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);

  async function fetchCurrentPrice(tokenId) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        Marketplace.abi,
        provider
      );
      const tokenData = await contract.getListedTokenForId(tokenId);
      const priceInEther = ethers.utils.formatUnits(tokenData.price, "ether");
      setCurrentPrice(priceInEther);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  }

  useEffect(() => {
    if (formParams.tokenId) {
      fetchCurrentPrice(formParams.tokenId);
    }
  }, [formParams.tokenId]);

  async function updateNFTPrice(e) {
    e.preventDefault();
    const { tokenId, newPrice } = formParams;

    if (!tokenId || !newPrice) {
      updateMessage("Please fill all fields!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        Marketplace.abi,
        signer
      );

      // Fetch current metadata to preserve other fields
      const currentToken = await contract.getListedTokenForId(tokenId);
      const currentURI = await contract.tokenURI(tokenId);
      const response = await fetch(currentURI);
      const currentMetadata = await response.json();

      // Create new metadata with updated price
      const newMetadata = {
        ...currentMetadata,
        price: newPrice,
      };

      // Upload new metadata to Pinata
      const metadataResponse = await uploadJSONToIPFS(newMetadata);
      if (!metadataResponse.success) {
        throw new Error("Failed to upload new metadata to Pinata");
      }
      const newTokenURI = metadataResponse.pinataURL;

      updateMessage("Updating price and metadata... Please wait!");
      const priceInWei = ethers.utils.parseUnits(newPrice, "ether");
      const transaction = await contract.updateTokenPrice(
        tokenId,
        priceInWei,
        newTokenURI
      );
      await transaction.wait();

      // Update Firestore with new price and updatedAt
      await setDoc(
        doc(db, "nfts", tokenId.toString()),
        {
          price: newPrice,
          updatedAt: Date.now(),
        },
        { merge: true } // Only update specified fields, preserve others
      );

      updateMessage("Price and metadata updated successfully!");
      updateFormParams({ tokenId: "", newPrice: "" });
      await fetchCurrentPrice(tokenId);
    } catch (error) {
      updateMessage(`Error: ${error.message}`);
      console.error(error);
    }
  }

  return (
    <div className="update-nft-price">
      <h2>Update NFT Price</h2>
      <form onSubmit={updateNFTPrice}>
        <input
          type="number"
          placeholder="Token ID"
          value={formParams.tokenId}
          onChange={(e) =>
            updateFormParams({ ...formParams, tokenId: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="New Price (ETH)"
          step="0.01"
          value={formParams.newPrice}
          onChange={(e) =>
            updateFormParams({ ...formParams, newPrice: e.target.value })
          }
        />
        <button type="submit">Update Price</button>
      </form>
      {currentPrice && formParams.tokenId && (
        <p>
          Current Price for Token ID {formParams.tokenId}: {currentPrice} ETH
        </p>
      )}
      <div>{message}</div>
    </div>
  );
}
