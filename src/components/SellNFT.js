import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from "../Marketplace.json";
import { useLocation } from "react-router";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SellNFT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const ethers = require("ethers");
  const [message, updateMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  async function disableButton() {
    const listButton = document.getElementById("list-button");
    listButton.disabled = true;
    listButton.style.backgroundColor = "grey";
    listButton.style.opacity = 0.3;
  }

  async function enableButton() {
    const listButton = document.getElementById("list-button");
    listButton.disabled = false;
    listButton.style.backgroundColor = "#A500FF";
    listButton.style.opacity = 1;
  }

  //This function uploads the NFT image to IPFS
  async function OnChangeFile(e) {
    var file = e.target.files[0];
    //check for file extension
    try {
      //upload the file to IPFS
      disableButton();
      updateMessage("Uploading image.. please dont click anything!");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        enableButton();
        updateMessage("");
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }

  //This function uploads the metadata to IPFS
  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    //Make sure that none of the fields are empty
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }

  async function listNFT(e) {
    e.preventDefault();

    //Upload data to IPFS
    try {
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      disableButton();
      updateMessage(
        "Uploading NFT(takes 5 mins).. please dont click anything!"
      );

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      //massage the params to be sent to the create NFT request
      const price = ethers.utils.parseUnits(formParams.price, "ether");
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();

      //actually create the NFT
      let transaction = await contract.createToken(metadataURL, price, {
        value: listingPrice,
      });
      await transaction.wait();

      const tokenId = await contract.getCurrentToken();
      // Save NFT details to Firestore
      const now = Date.now();
      await setDoc(doc(db, "nfts", tokenId.toString()), {
        tokenId: tokenId.toString(),
        price: formParams.price, // Store as string for consistency
        seller: await signer.getAddress(),
        metadataURL: metadataURL,
        purchaseCount: 0, // Initialize purchase count
        createdAt: now,
        updatedAt: now,
      });

      alert(`Successfully listed your NFT! Token ID: ${tokenId}`);
      enableButton();
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      setFileURL(null); // Reset file upload
      setShowPreview(false); // Close preview if open
      // window.location.replace("/");
      navigate("/marketplace");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  console.log("Working", process.env);
  return (
    <div className="">
      {/* <Navbar></Navbar> */}
      {/* <div className="flex flex-col place-items-center mt-10" id="nftForm">
        <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold text-purple-500 mb-8">
            Upload your NFT to the marketplace
          </h3>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="name"
            >
              NFT Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Axie#4563"
              onChange={(e) =>
                updateFormParams({ ...formParams, name: e.target.value })
              }
              value={formParams.name}
            ></input>
          </div>
          <div className="mb-6">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="description"
            >
              NFT Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              cols="40"
              rows="5"
              id="description"
              type="text"
              placeholder="Axie Infinity Collection"
              value={formParams.description}
              onChange={(e) =>
                updateFormParams({ ...formParams, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-6">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="price"
            >
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.01 ETH"
              step="0.01"
              value={formParams.price}
              onChange={(e) =>
                updateFormParams({ ...formParams, price: e.target.value })
              }
            ></input>
          </div>
          <div>
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Upload Image (&lt;500 KB)
            </label>
            <input type={"file"} onChange={OnChangeFile}></input>
          </div>
          <br></br>
          <div className="text-red-500 text-center">{message}</div>
          <button
            onClick={listNFT}
            className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
            id="list-button"
          >
            List NFT
          </button>
        </form>
      </div> */}
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center">
        <Navbar />
        <div className="flex flex-col items-center mt-10 w-full px-4">
          <form className="bg-white rounded-lg shadow-md p-6 max-w-xl w-full">
            <h3 className="text-center text-2xl font-bold text-purple-600 mb-8">
              List Your NFT
            </h3>

            {/* Inputs */}
            <div className="space-y-8">
              {/* Name and Price in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg shadow-sm p-4">
                  <div className="flex items-center mb-2">
                    <svg
                      className="h-5 w-5 text-purple-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    <label
                      className="text-purple-600 text-sm font-semibold"
                      htmlFor="name"
                    >
                      NFT Name
                    </label>
                  </div>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
                    id="name"
                    type="text"
                    placeholder="e.g., Axie#4563"
                    onChange={(e) =>
                      updateFormParams({ ...formParams, name: e.target.value })
                    }
                    value={formParams.name}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg shadow-sm p-4">
                  <div className="flex items-center mb-2">
                    <svg
                      className="h-5 w-5 text-purple-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <label
                      className="text-purple-600 text-sm font-semibold"
                      htmlFor="price"
                    >
                      Price (in ETH)
                    </label>
                  </div>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
                    type="number"
                    placeholder="Min 0.01 ETH"
                    step="0.01"
                    value={formParams.price}
                    onChange={(e) =>
                      updateFormParams({ ...formParams, price: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-purple-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12h18M3 6h18M3 18h18"
                    />
                  </svg>
                  <label
                    className="text-purple-600 text-sm font-semibold"
                    htmlFor="description"
                  >
                    NFT Description
                  </label>
                </div>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400"
                  cols="40"
                  rows="4"
                  id="description"
                  placeholder="e.g., Axie Infinity Collection"
                  value={formParams.description}
                  onChange={(e) =>
                    updateFormParams({
                      ...formParams,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {/* Upload Image */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-purple-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    <label
                      className="text-purple-600 text-sm font-semibold"
                      htmlFor="image"
                    >
                      Upload Image (500 KB)
                    </label>
                  </div>
                  {fileURL && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="text-purple-600 text-sm font-semibold hover:text-purple-800 transition-all duration-200"
                    >
                      Preview
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  onChange={OnChangeFile}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-700 hover:border-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Feedback Message */}
            {message && (
              <div className="mt-6 text-red-500 text-center text-sm">
                {message}
              </div>
            )}

            {/* List Button */}
            <button
              onClick={listNFT}
              className="mt-8 w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md"
              id="list-button"
            >
              List NFT
            </button>
          </form>

          {/* Image Preview Popup */}
          {showPreview && fileURL && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <h4 className="text-lg font-semibold text-purple-600 mb-4">
                  Image Preview
                </h4>
                <img
                  src={fileURL}
                  alt="Uploaded NFT"
                  className="w-full h-64 object-cover rounded-md border border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
